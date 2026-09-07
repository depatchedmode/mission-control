import { spawn } from 'node:child_process'
import { mkdtemp, rm, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:net'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'
import assert from 'node:assert/strict'
import { CodexBridgeAdapter } from '../lib/codex-bridge-adapter.js'

// Isolated configuration and a read-only thread; this smoke never starts a model turn.
const listener = createServer()
listener.listen(0, '127.0.0.1')
await once(listener, 'listening')
const port = listener.address().port
await new Promise(resolve => listener.close(resolve))
const root = await mkdtemp(join(tmpdir(), 'pardner-codex-protocol-'))
const endpoint = `ws://127.0.0.1:${port}`
const separateProcessGroup = process.platform !== 'win32'
const child = spawn(process.env.PARDNER_CODEX_BINARY ?? 'codex', ['app-server', '--disable', 'plugins', '--disable', 'apps', '--listen', endpoint], {
  env: { ...process.env, CODEX_HOME: root }, stdio: ['ignore', 'ignore', 'pipe'], detached: separateProcessGroup,
})
let failure
let closed = false
const closedPromise = new Promise(resolve => child.once('close', () => { closed = true; resolve() }))
child.on('error', error => { failure = error })
child.stderr.resume()
function terminate(signal) {
  if (!child.pid || closed) return
  try {
    // The npm Codex launcher spawns a native child; stopping only the launcher leaks it.
    if (separateProcessGroup) process.kill(-child.pid, signal)
    else child.kill(signal)
  } catch (error) { if (error.code !== 'ESRCH') throw error }
}
const adapter = new CodexBridgeAdapter({ endpoint, requestTimeoutMs: 2000 })
try {
  const deadline = Date.now() + 10000
  while (true) {
    if (failure) throw failure
    try { await adapter.connect(); break } catch (error) {
      if (Date.now() >= deadline || child.exitCode !== null) throw error
      await delay(100)
    }
  }
  const cwd = await realpath(root)
  const result = await adapter.call('thread/start', { cwd, sandbox: 'read-only', approvalPolicy: 'on-request' })
  await adapter.call('thread/inject_items', { threadId: result.thread.id,
    items: [{ type: 'message', role: 'user', content: [{ type: 'input_text', text: 'Protocol fixture only. No action requested.' }] }] })
  const mapping = { threadId: result.thread.id, worktree: cwd,
    expectedPolicy: { approvalPolicy: result.approvalPolicy, approvalsReviewer: result.approvalsReviewer, sandbox: result.sandbox } }
  assert.equal(await adapter.availability(mapping), 'ready')
  const read = await adapter.inspect(mapping)
  assert.equal(read.id, mapping.threadId)
  assert.equal(read.cwd, cwd)
  await adapter.archive(mapping)
  assert.equal(await adapter.isArchived(mapping), true)
  await adapter.archive(mapping)
  console.log(JSON.stringify({ passed: true, protocol: ['initialize', 'thread/start', 'thread/read', 'thread/resume', 'thread/archive', 'thread/list'], modelTurns: 0 }))
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  adapter.close()
  if (!closed) {
    terminate('SIGTERM')
    const timer = setTimeout(() => terminate('SIGKILL'), 3000)
    try { await closedPromise } finally { clearTimeout(timer) }
  }
  await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
}
