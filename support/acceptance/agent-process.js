import { fork } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { DatabaseSync } from 'node:sqlite'
import { join } from 'node:path'

export class AgentProcess {
  constructor(options, observe = () => {}) {
    this.options = options
    this.observe = observe
    this.events = []
    this.stderr = ''
    this.pending = new Map()
  }

  async start() {
    this.child = fork(new URL('./agent-worker.js', import.meta.url), [JSON.stringify(this.options)], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] })
    this.child.stderr.on('data', bytes => { this.stderr += bytes })
    this.child.on('message', message => {
      this.events.push({ ...message, at: Date.now() })
      try { this.observe(message) } catch (error) { this.failure = error }
      const awaiting = this.pending.get(message.requestId)
      if (awaiting) {
        this.pending.delete(message.requestId)
        clearTimeout(awaiting.timer)
        if (this.failure) awaiting.reject(this.failure)
        else awaiting.resolve(message)
      }
    })
    this.child.on('exit', (code, signal) => {
      for (const waiting of this.pending.values()) {
        clearTimeout(waiting.timer)
        waiting.reject(new Error(`Agent exited ${code}/${signal}: ${this.stderr}`))
      }
      this.pending.clear()
    })
    const timer = setTimeout(() => this.child.kill('SIGKILL'), 10000)
    try {
      const [message] = await Promise.race([
        once(this.child, 'message'),
        once(this.child, 'exit').then(([code]) => { throw new Error(`Agent startup failed (${code}): ${this.stderr}`) }),
      ])
      if (!message.ready) throw new Error('Agent did not report readiness')
    } finally { clearTimeout(timer) }
    return this
  }

  run(pauseAt) {
    const requestId = randomUUID()
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId)
        reject(new Error(`Agent ${this.options.actorId} timed out`))
      }, 15000)
      this.pending.set(requestId, { resolve, reject, timer })
      this.child.send({ requestId, pauseAt })
    })
  }

  async stop(signal) {
    const child = this.child
    if (!child || child.exitCode !== null || child.signalCode !== null) return
    const exited = once(child, 'exit')
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000)
    if (signal) child.kill(signal)
    else child.disconnect()
    const [code, actualSignal] = await exited
    clearTimeout(timer)
    if (!signal && (code !== 0 || actualSignal)) throw new Error(`Agent did not exit naturally: ${this.stderr}`)
  }

  evidence() {
    const database = new DatabaseSync(join(this.options.directory, 'inbox.sqlite'), { readOnly: true })
    try {
      return { actorId: this.options.actorId, events: this.events, stderr: this.stderr,
        inbox: database.prepare('SELECT * FROM inbox ORDER BY key').all(),
        effects: database.prepare('SELECT * FROM effects ORDER BY key').all() }
    } finally { database.close() }
  }
}
