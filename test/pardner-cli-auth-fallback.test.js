import { it } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, writeFile, readFile, rm, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { cli, startCliService } from '../support/cli-resources.js'

const exec = promisify(execFile)
async function fixture(run, handler) {
  const directory = await mkdtemp(join(tmpdir(), 'pardner-cli-auth-'))
  const server = createServer(handler ?? ((_req, res) => { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Unauthorized', code: 'AUTH_REQUIRED' })) }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${server.address().port}`
  await mkdir(join(directory, '.mission-control'))
  const marker = join(directory, '.mission-control', 'keep')
  await writeFile(marker, 'legacy data')
  try { await run(directory, url, server); assert.equal(await readFile(marker, 'utf8'), 'legacy data') } finally {
    await new Promise(resolve => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  }
}
async function repository(directory) {
  const git = async (...args) => (await exec('git', args, { cwd: directory })).stdout.trim()
  await git('init', '-q')
  await git('config', 'user.name', 'Test Human')
  await git('config', 'user.email', 'test@example.test')
  await writeFile(join(directory, 'work.txt'), 'before\n')
  await git('add', 'work.txt')
  await git('commit', '-qm', 'initial')
  await writeFile(join(directory, 'work.txt'), 'after\n')
  await git('add', 'work.txt')
  return git
}
const commitArgs = ['commit', '--task', 'task-one', '--actor', 'builder', '--', '-m', 'Agent work']

it('returns structured auth failures for reads without opening a local store', async () => {
  await fixture(async (directory, server) => {
    for (const args of [['tasks'], ['show', 'task-one'], ['comments', 'task-one'], ['activity']]) {
      const output = await cli(directory, [...args, '--server', server])
      assert.equal(output.code, 1)
      assert.equal(output.result.error.code, 'AUTH_REQUIRED')
    }
  })
})
it('does not fall back on authenticated mutation failures', async () => {
  await fixture(async (directory, server) => {
    const output = await cli(directory, ['comment', 'task-one', 'unsent', '--actor', 'builder', '--server', server])
    assert.equal(output.code, 1)
    assert.equal(output.result.error.code, 'AUTH_REQUIRED')
  })
})
it('reports an unavailable local service for reads and writes without opening storage', async () => {
  await fixture(async (directory, server, listener) => {
    await new Promise(resolve => listener.close(resolve))
    for (const args of [['tasks'], ['comment', 'task-one', 'unsent', '--actor', 'builder']]) {
      const output = await cli(directory, [...args, '--server', server])
      assert.equal(output.result.error.code, 'LOCAL_SERVICE_UNAVAILABLE')
      assert.equal(output.code, 1)
    }
  })
})
it('does not commit when the service is unreachable', async () => {
  await fixture(async (directory, server, listener) => {
    const git = await repository(directory)
    const before = await git('rev-parse', 'HEAD')
    await new Promise(resolve => listener.close(resolve))
    const output = await cli(directory, ['--server', server, ...commitArgs], { cwd: directory })
    assert.equal(output.code, 1)
    assert.equal(await git('rev-parse', 'HEAD'), before)
  })
})
it('does not commit when the requested task is missing', async () => {
  await fixture(async (directory, server) => {
    const git = await repository(directory)
    const before = await git('rev-parse', 'HEAD')
    const output = await cli(directory, ['--server', server, ...commitArgs], { cwd: directory })
    assert.equal(output.result.error.code, 'NOT_FOUND')
    assert.equal(await git('rev-parse', 'HEAD'), before)
  }, (_req, res) => { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Task missing', code: 'NOT_FOUND' })) })
})
it('records a trace and links the actual Git commit through shared operations', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pardner-commit-'))
  const data = join(directory, '.pardner')
  const service = await startCliService(data)
  try {
    const git = await repository(directory)
    await cli(data, ['actors', 'register', 'builder', '--handle', 'builder', '--kind', 'agent', '--actor', 'builder'])
    const created = await cli(data, ['task', 'create', '--title', 'Commit work', '--actor', 'builder'])
    const taskId = created.result.result.taskId
    const output = await cli(data, ['commit', '--task', taskId, '--actor', 'builder', '--model', 'deterministic-test', '--', '-m', 'Agent work'], { cwd: directory })
    assert.equal(output.code, 0, output.stdout + output.stderr)
    const hash = await git('rev-parse', 'HEAD')
    assert.equal(output.result.trace.commit.hash, hash)
    assert.equal(output.result.trace.agent.name, 'builder')
    assert.equal(output.result.trace.agent.model, 'deterministic-test')
    const context = await cli(data, ['show', taskId])
    assert.equal(context.result.evidence[0].hash, hash)
    const record = await cli(data, ['trace', 'show', hash], { cwd: directory })
    assert.equal(record.result.trace.commit.hash, hash)
  } finally { await service.stop(); await rm(directory, { recursive: true, force: true }) }
})
it('reports partial commit success with recovery details when task linking fails', async () => {
  await fixture(async (directory, server) => {
    const git = await repository(directory)
    const before = await git('rev-parse', 'HEAD')
    const output = await cli(directory, ['--server', server, ...commitArgs], { cwd: directory })
    assert.equal(output.code, 1)
    assert.notEqual(await git('rev-parse', 'HEAD'), before)
    assert.equal(output.result.error.code, 'STORAGE_FAILED')
    assert.equal(output.result.error.details.commitHash, await git('rev-parse', 'HEAD'))
    assert.equal(output.result.error.details.traceRecorded, true)
  }, (req, res) => {
    res.writeHead(req.method === 'GET' ? 200 : 507, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(req.method === 'GET' ? { task: { id: 'task-one' } } : { code: 'STORAGE_FAILED', error: 'Local save failed' }))
  })
})
