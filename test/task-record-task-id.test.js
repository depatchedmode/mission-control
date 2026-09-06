import { it } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { withWorkspaceServer } from '../support/workspace-test.js'
import { WorkspaceRuntime } from '../lib/workspace-runtime.js'

it('comments and mentions preserve canonical task references and stable recipient keys across reads', async () => {
  await withWorkspaceServer(async ({ create, operation, context, api, server }) => {
    const taskId = await create()
    const receipt = await operation('comment.add', { taskId, text: '@builder and @reviewer please review' })
    const rawBefore = JSON.stringify(server.store.workspace.handle.doc())
    for (let iteration = 0; iteration < 2; iteration++) {
      const result = await context(taskId)
      assert.equal(result.comments.length, 1)
      assert.equal(result.mentions.length, 2)
      const snapshot = (await api('/automerge/doc')).doc
      for (const comment of [result.comments[0], snapshot.comments[receipt.result.commentId]]) {
        assert.equal(comment.taskId, taskId)
        assert.equal(Object.hasOwn(comment, 'task_id'), false)
      }
      for (const mention of result.mentions) {
        assert.equal(mention.taskId, taskId)
        assert.equal(mention.commentId, receipt.result.commentId)
        assert.equal(Object.hasOwn(mention, 'task_id'), false)
        const expectedKey = createHash('sha256').update(JSON.stringify([mention.commentId, mention.toActorId])).digest('hex')
        assert.equal(mention.idempotency_key, expectedKey)
        assert.equal(snapshot.mentions[mention.id].idempotency_key, expectedKey)
      }
    }
    assert.equal(JSON.stringify(server.store.workspace.handle.doc()), rawBefore)
  })
})

for (const [legacy, schemaVersion] of [['workspace.json', 1], ['workspace.json', 2], ['document-url', null]]) {
  it(`rejects incompatible ${legacy}${schemaVersion ? ` version ${schemaVersion}` : ''} without migrating or modifying its contents`, async () => {
    const directory = await mkdtemp(join(tmpdir(), 'pardner-legacy-rejection-'))
    const contents = legacy === 'workspace.json' ? JSON.stringify({ schemaVersion, workspaceId: 'old-workspace' }) : 'automerge:legacy-document'
    const runtime = new WorkspaceRuntime({ directory })
    try {
      await writeFile(join(directory, legacy), contents)
      await assert.rejects(runtime.init(), { code: 'INCOMPATIBLE_SCHEMA' })
      assert.equal(await readFile(join(directory, legacy), 'utf8'), contents)
    } finally {
      await runtime.close()
      await rm(directory, { recursive: true, force: true })
    }
  })
}
