import { it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'
import { cli, startCliService } from '../support/cli-resources.js'

it(
  'uses runtime credentials and shared operations in two independent browser sessions',
  { timeout: 60000 },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), 'pardner-ui-'))
    const service = await startCliService(directory)
    let browser
    const errors = []
    const run = async (args, actor = 'alice') => {
      const output = await cli(directory, [...args, '--actor', actor])
      assert.equal(output.code, 0, output.stdout + output.stderr)
      return output.result
    }
    try {
      for (const [id, kind] of [
        ['alice', 'human'],
        ['bob', 'human'],
        ['builder', 'agent'],
      ])
        await run(['actors', 'register', id, '--handle', id, '--kind', kind])
      const { token } = JSON.parse(
        await readFile(join(directory, 'connection.json'), 'utf8'),
      )
      browser = await chromium.launch({ headless: true })
      const pages = []
      for (const actor of ['alice', 'bob']) {
        const context = await browser.newContext({
          viewport: { width: 1440, height: 1000 },
        })
        const page = await context.newPage()
        page.on('pageerror', (error) => errors.push(error.message))
        await page.goto(`${service.httpUrl}/pardner/`)
        await page.getByLabel('Local service token').fill(token)
        await page.getByRole('button', { name: 'Connect', exact: true }).click()
        await page.getByLabel('Actor', { exact: true }).selectOption(actor)
        pages.push(page)
      }
      const [alice, bob] = pages
      await alice.getByRole('button', { name: 'New task', exact: true }).click()
      await alice
        .getByLabel('Title', { exact: true })
        .fill('Coordinate the first release')
      await alice
        .getByLabel('Description', { exact: true })
        .fill(
          'Keep human decisions and agent progress together, including while offline.',
        )
      await alice
        .getByRole('button', { name: 'Create task', exact: true })
        .click()
      await alice
        .getByRole('heading', {
          name: 'Coordinate the first release',
          exact: true,
        })
        .waitFor()
      await bob
        .getByRole('button', { name: /Coordinate the first release/ })
        .click()
      await alice
        .getByLabel('Comment', { exact: true })
        .fill('The requirements are ready for @builder.')
      await alice
        .getByRole('button', { name: 'Add comment', exact: true })
        .click()
      await bob
        .getByText('The requirements are ready for @builder.', { exact: true })
        .waitFor()
      assert.match(
        await bob.getByText(/unread for bob/).textContent(),
        /1 unread/,
      )
      await bob
        .getByRole('button', { name: 'Mark displayed comments read' })
        .click()
      await bob.getByText('0 unread for bob', { exact: true }).waitFor()
      assert.match(
        await alice.getByText(/unread for alice/).textContent(),
        /1 unread/,
      )
      await alice
        .getByRole('button', { name: 'Edit task', exact: true })
        .click()
      await alice
        .getByLabel('Title', { exact: true })
        .fill('A stale local draft')
      const taskId = (await run(['tasks'])).tasks[0].id
      const original = await run(['show', taskId])
      await run(
        [
          'update',
          taskId,
          '--title',
          'A newer agent title',
          '--revisions',
          JSON.stringify({ title: original.revisions.title }),
        ],
        'builder',
      )
      await alice
        .getByRole('heading', { name: 'A newer agent title', exact: true })
        .waitFor()
      assert.equal(
        await alice.getByLabel('Title', { exact: true }).inputValue(),
        'A stale local draft',
      )
      await alice
        .getByRole('button', { name: 'Save changes', exact: true })
        .click()
      await alice
        .getByRole('alert')
        .getByText(/draft is preserved/)
        .waitFor()
      assert.equal(
        (await run(['show', taskId])).task.title,
        'A newer agent title',
      )
      await alice
        .getByRole('button', { name: 'Cancel edit', exact: true })
        .click()
      await alice
        .getByLabel('Recipient', { exact: true })
        .selectOption('builder')
      await alice
        .getByLabel('Handoff message', { exact: true })
        .fill('Please implement and record the evidence.')
      await alice.getByRole('button', { name: 'Hand off', exact: true }).click()
      await bob
        .getByText('Please implement and record the evidence.', { exact: true })
        .waitFor()
      assert.equal((await run(['show', taskId])).task.assignee, 'builder')
      let lost = false
      await alice.route('**/automerge/operations', async route => {
        if (!lost && route.request().postDataJSON().type === 'comment.add') {
          lost = true
          assert.equal((await route.fetch()).status(), 200)
          await route.abort('failed')
        } else await route.continue()
      })
      await alice.getByLabel('Comment', { exact: true }).fill('Confirm exactly once after a lost response')
      await alice.getByRole('button', { name: 'Add comment', exact: true }).click()
      await alice.getByRole('button', { name: 'Retry saved request', exact: true }).click()
      await alice.getByRole('button', { name: 'Retry saved request', exact: true }).waitFor({ state: 'hidden' })
      assert.equal(await alice.getByLabel('Comment', { exact: true }).inputValue(), '')
      assert.equal((await run(['show', taskId])).comments.filter(comment => comment.content === 'Confirm exactly once after a lost response').length, 1)
      await alice.unroute('**/automerge/operations')
      const output = resolve('output/playwright')
      await mkdir(output, { recursive: true })
      await alice.getByRole('button', { name: 'Close', exact: true }).click()
      await run([
        'task',
        'create',
        '--title',
        'Review the handoff evidence',
        '--status',
        'up-next',
        '--assignee',
        'bob',
      ])
      await alice
        .getByRole('button', { name: /Review the handoff evidence/ })
        .waitFor()
      await alice.screenshot({
        path: join(output, 'pardner-desktop.png'),
        fullPage: true,
      })
      await bob.setViewportSize({ width: 390, height: 844 })
      await bob.screenshot({
        path: join(output, 'pardner-mobile.png'),
        fullPage: true,
      })
      assert.equal(
        await bob.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      )
      assert.deepEqual(errors, [])
    } catch (error) {
      for (const context of browser?.contexts() || []) {
        for (const page of context.pages())
          console.error(await page.locator('body').innerText())
      }
      console.error(errors)
      throw error
    } finally {
      await browser?.close()
      await service.stop()
      await rm(directory, { recursive: true, force: true })
    }
  },
)
