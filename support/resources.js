import { mkdtempSync, rmSync } from 'node:fs'
import { setTimeout as delay } from 'node:timers/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { WebSocket } from 'ws'

import AutomergeSyncServer from '../automerge-sync-server.js'

export const noopLogger = {
  log() {},
  warn() {},
  error() {},
}

export function createTempDir(prefix = 'mc-test-') {
  return mkdtempSync(join(tmpdir(), prefix))
}

export function cleanupTempDir(dir) {
  if (!dir) return
  rmSync(dir, { recursive: true, force: true })
}

// ─── Sync Server Helpers ───

export const TEST_TOKEN = 'test-token'

export function createServer(storagePath, overrides = {}) {
  return new AutomergeSyncServer({
    env: {},
    apiToken: TEST_TOKEN,
    allowedOrigins: ['http://allowed.example'],
    httpPort: 0,
    wsPort: 0,
    storagePath,
    usePersistedUrl: false,
    logger: noopLogger,
    ...overrides,
  })
}

export async function withStartedServer(overrides, fn) {
  const storagePath = createTempDir('mc-fitness-')
  const server = createServer(storagePath, overrides)
  try {
    await server.start()
    return await fn(server)
  } finally {
    try {
      await server.stop()
      await delay(25)
    } finally {
      cleanupTempDir(storagePath)
    }
  }
}

export function httpUrl(server, path) {
  return `http://${server.host}:${server.httpPort}${path}`
}

export function wsUrl(server, path = '/') {
  return `ws://${server.host}:${server.wsPort}${path}`
}

export function authedFetch(server, path, options = {}) {
  const url = httpUrl(server, path)
  const headers = {
    Authorization: `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
    ...options.headers,
  }
  return fetch(url, { ...options, headers })
}

export async function authedGet(server, path) {
  const res = await authedFetch(server, path)
  return res.json()
}

export async function authedPost(server, path, body) {
  const res = await authedFetch(server, path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return { ...(await res.json()), status: res.status }
}

export async function authedPatch(server, path, body) {
  const res = await authedFetch(server, path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return { ...(await res.json()), status: res.status }
}

export async function authedDelete(server, path) {
  const res = await authedFetch(server, path, { method: 'DELETE' })
  return { ...(await res.json()), status: res.status }
}

export async function getDoc(server) {
  const { doc } = await authedGet(server, '/automerge/doc')
  return doc
}

// Create a task via the API and return its ID
export async function createTask(server, fields = {}) {
  const { taskId } = await authedPost(server, '/automerge/task', {
    title: fields.title || 'Test task',
    agent: fields.agent || 'test-agent',
    ...fields,
  })
  return taskId
}

// Create a move via the API and return its ID
export async function createMove(server, fields = {}) {
  const { moveId } = await authedPost(server, '/automerge/move', {
    title: fields.title || 'Test move',
    agent: fields.agent || 'test-agent',
    ...fields,
  })
  return moveId
}

// Create a game via the API and return its ID
export async function createGame(server, fields = {}) {
  const { gameId } = await authedPost(server, '/automerge/game', {
    title: fields.title || 'Test game',
    endgame: fields.endgame || 'Test endgame',
    agent: fields.agent || 'test-agent',
    ...fields,
  })
  return gameId
}

// ─── WebSocket Helpers ───

export async function connectAuthenticatedWs(server) {
  const { ticket } = await authedPost(server, '/automerge/ws-ticket', {})
  const ws = new WebSocket(wsUrl(server, `/?ticket=${ticket}`), {
    origin: 'http://allowed.example',
  })

  // Buffer messages that arrive before callers attach listeners.
  const messageBuffer = []
  const bufferHandler = data => {
    messageBuffer.push(JSON.parse(data.toString()))
  }
  ws.on('message', bufferHandler)

  await once(ws, 'open')

  // Wait for the initial document-state message with a real timeout
  // instead of an arbitrary sleep.
  if (messageBuffer.length === 0) {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('No initial WS message')), 2000)
      ws.once('message', () => {
        clearTimeout(timeout)
        resolve()
      })
    })
  }

  // Stop buffering and stash any early messages.
  ws.removeListener('message', bufferHandler)
  ws._mcBuffer = messageBuffer
  return ws
}

export function nextWsMessage(ws, timeoutMs = 2000) {
  // Drain buffered messages first.
  if (ws._mcBuffer && ws._mcBuffer.length > 0) {
    return Promise.resolve(ws._mcBuffer.shift())
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('WS message timeout')), timeoutMs)
    ws.once('message', data => {
      clearTimeout(timeout)
      resolve(JSON.parse(data.toString()))
    })
  })
}
