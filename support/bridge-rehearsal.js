import { spawn, execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, copyFile, writeFile, symlink, realpath } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { once, EventEmitter } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'
import { createHash } from 'node:crypto'
import WebSocket, { WebSocketServer } from 'ws'
import { candidateFingerprint } from './acceptance/candidate.js'

export const execute = promisify(execFile)
export const sha256 = value => createHash('sha256').update(value).digest('hex')

export async function availablePort() {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const port = server.address().port
  await new Promise(resolve => server.close(resolve))
  return port
}

export function startProcess(command, args, options = {}) {
  const grouped = process.platform !== 'win32'
  const child = spawn(command, args, { ...options, detached: grouped, stdio: ['ignore', 'pipe', 'pipe'] })
  let stdout = '', stderr = '', closed = false, error
  const completion = new Promise(resolve => child.once('close', () => { closed = true; resolve() }))
  child.on('error', value => { error = value })
  child.stdout.on('data', bytes => { stdout += bytes; if (stdout.length > 1000000) stdout = stdout.slice(-1000000) })
  child.stderr.on('data', bytes => { stderr += bytes; if (stderr.length > 1000000) stderr = stderr.slice(-1000000) })
  function kill(signal) {
    if (closed || !child.pid) return
    try { if (grouped) process.kill(-child.pid, signal); else child.kill(signal) }
    catch (failure) { if (failure.code !== 'ESRCH') throw failure }
  }
  return { child, kill, output: () => ({ stdout, stderr }),
    check: () => { if (error) throw error; if (closed) throw new Error(`Test process exited (${child.exitCode ?? child.signalCode}): ${stderr.slice(-2000)}`) },
    async stop(signal = 'SIGTERM') {
      kill(signal)
      const timer = setTimeout(() => kill('SIGKILL'), 3000)
      try { await completion } finally { clearTimeout(timer) }
    } }
}

export async function eventually(check, { timeoutMs = 10000, intervalMs = 100, label = 'condition' } = {}) {
  const deadline = Date.now() + timeoutMs
  while (true) {
    const result = await check()
    if (result) return result
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for ${label}`)
    await delay(intervalMs)
  }
}

export async function freezeCandidate(source, destination) {
  const before = await candidateFingerprint(source)
  for (const path of Object.keys(before.files)) {
    await mkdir(dirname(join(destination, path)), { recursive: true })
    await copyFile(join(source, path), join(destination, path))
  }
  await symlink(join(source, 'node_modules'), join(destination, 'node_modules'), 'dir')
  const after = await candidateFingerprint(destination)
  if (before.sha256 !== after.sha256) throw new Error('Candidate changed while it was copied')
  return before
}

export const requirements = `Implement queue.mjs with exports challenge and selectReadyTasks(tasks, actorId, limit).
Return only tasks whose assignee exactly matches actorId and whose status is exactly "todo".
Order by priority p0, p1, p2, p3 (missing or unknown priority last), then created_at ascending, then id ascending.
Apply a positive integer limit; throw RangeError for zero, negative, non-integer, or non-finite limits.
Do not mutate the input array or task objects. Return the selected original task objects.
Empty input returns []. Use no dependencies. Add meaningful Node tests in queue.test.mjs.`

export async function createWorktrees(root, challenge) {
  const repository = join(root, 'fixture-repository')
  await mkdir(repository, { recursive: true })
  await writeFile(join(repository, 'queue.mjs'), `export const challenge = ${JSON.stringify(challenge)}\nexport function selectReadyTasks() { throw new Error('Not implemented') }\n`)
  await writeFile(join(repository, '.gitignore'), '*.log\n')
  const git = args => execute('git', args, { cwd: repository })
  await git(['init', '--quiet'])
  await git(['add', 'queue.mjs', '.gitignore'])
  await git(['-c', 'user.name=Pardner Rehearsal', '-c', 'user.email=rehearsal@localhost', 'commit', '--quiet', '-m', 'test: seed isolated rehearsal fixture'])
  const trees = {}
  for (const actor of ['builder', 'reviewer']) {
    const path = join(root, actor)
    await git(['worktree', 'add', '--quiet', '--detach', path, 'HEAD'])
    trees[actor] = await realpath(path)
  }
  return trees
}

/** Relay the real protocol; inject only transport faults, never model replies. */
export class HarnessProxy extends EventEmitter {
  constructor(upstream, { dropDispatchReply = false, dropArchiveReply = false } = {}) {
    super()
    this.upstream = upstream
    this.dropDispatchReply = dropDispatchReply
    this.dropArchiveReply = dropArchiveReply
    this.events = []
    this.sockets = new Set()
  }
  record(type, fields = {}) {
    const event = { type, at: Date.now(), ...fields }
    this.events.push(event); this.emit('event', event)
  }
  async start() {
    this.server = new WebSocketServer({ host: '127.0.0.1', port: 0 })
    await once(this.server, 'listening')
    this.server.on('connection', client => {
      const upstream = new WebSocket(this.upstream)
      this.sockets.add(client); this.sockets.add(upstream)
      const waiting = [], requests = new Map()
      const close = () => { client.terminate(); upstream.terminate(); this.sockets.delete(client); this.sockets.delete(upstream) }
      client.on('error', () => {}); upstream.on('error', close)
      client.on('close', close); upstream.on('close', close)
      upstream.on('open', () => { for (const [bytes, binary] of waiting) upstream.send(bytes, { binary }) })
      client.on('message', (bytes, binary) => {
        const message = JSON.parse(bytes.toString())
        if (message.id !== undefined) requests.set(message.id, { method: message.method, threadId: message.params?.threadId })
        if (message.method === 'turn/start') this.record('dispatch', { threadId: message.params.threadId })
        if (message.method === 'thread/archive') this.record('archive-request', { threadId: message.params.threadId })
        if (upstream.readyState === WebSocket.OPEN) upstream.send(bytes, { binary })
        else waiting.push([bytes, binary])
      })
      upstream.on('message', (bytes, binary) => {
        const message = JSON.parse(bytes.toString())
        const request = message.method ? null : requests.get(message.id)
        if (request) requests.delete(message.id)
        if (request?.method === 'thread/resume' && message.result) this.record('session-settings', {
          threadId: request.threadId, model: message.result.model, reasoningEffort: message.result.reasoningEffort,
        })
        if (request && message.error) this.record('rpc-error', { method: request.method, code: message.error.code, message: message.error.message })
        if (request?.method === 'thread/archive' && message.result) {
          this.record('archive-accepted', { threadId: request.threadId })
          if (this.dropArchiveReply) {
            this.dropArchiveReply = false
            this.record('archive-reply-dropped', { threadId: request.threadId })
            close(); return
          }
        }
        if (request?.method === 'turn/start' && message.result?.turn?.id) {
          this.record('accepted', { threadId: request.threadId, turnId: message.result.turn.id })
          if (this.dropDispatchReply) {
            this.dropDispatchReply = false
            this.record('reply-dropped', { threadId: request.threadId, turnId: message.result.turn.id })
            close(); return
          }
        }
        if (message.method === 'turn/completed') this.record('completed', {
          threadId: message.params.threadId, turnId: message.params.turn.id, status: message.params.turn.status, error: message.params.turn.error,
        })
        if (message.method && message.id !== undefined) this.record('input-required', { method: message.method, threadId: message.params?.threadId })
        if (client.readyState !== WebSocket.OPEN) return
        client.send(bytes, { binary })
        if (message.method === 'thread/status/changed') {
          client.send(bytes, { binary })
          this.record('duplicate-notification', { threadId: message.params.threadId })
        }
      })
    })
    return `ws://127.0.0.1:${this.server.address().port}`
  }
  async close() {
    for (const socket of this.sockets) socket.terminate()
    if (this.server) await new Promise(resolve => this.server.close(resolve))
  }
}
