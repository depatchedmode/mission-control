#!/usr/bin/env node

import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { WebSocket } from 'ws'

import AutomergeSyncServer from '../automerge-sync-server.js'

const activeServers = []
const tempDirs = []

function createTempDir(prefix = 'mc-sync-test-') {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

function createServer(overrides = {}) {
  return new AutomergeSyncServer({
    env: {},
    apiToken: 'secret-token',
    allowedOrigins: ['http://allowed.example'],
    httpPort: 0,
    wsPort: 0,
    storagePath: createTempDir(),
    usePersistedUrl: false,
    logger: { warn() {} },
    ...overrides,
  })
}

async function startServer(overrides = {}) {
  const server = createServer(overrides)
  activeServers.push(server)
  await server.start()
  return server
}

function httpUrl(server, path) {
  return `http://${server.host}:${server.httpPort}${path}`
}

function wsUrl(server, path = '/') {
  return `ws://${server.host}:${server.wsPort}${path}`
}

function connectWebSocket(url, options = {}) {
  return new Promise(resolve => {
    const ws = new WebSocket(url, options)
    let settled = false
    const timeout = setTimeout(() => {
      if (!settled) {
        try {
          ws.terminate()
        } catch {
          // Ignore client shutdown errors during test timeouts.
        }
        resolve({ type: 'timeout' })
      }
    }, 2000)

    function finish(result) {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      resolve(result)
    }

    ws.once('open', () => {
      try {
        ws.close()
      } catch {
        // Ignore close failures while resolving open-path probes.
      }
      finish({ type: 'open' })
    })
    ws.once('unexpected-response', (_req, res) => {
      const chunks = []
      res.on('data', chunk => chunks.push(Buffer.from(chunk)))
      res.on('end', () => {
        finish({
          type: 'unexpected-response',
          statusCode: res.statusCode,
          body: Buffer.concat(chunks).toString('utf8'),
        })
      })
      res.resume()
    })
    ws.once('error', error => finish({ type: 'error', error }))
  })
}

async function expectWebSocketOpen(url, options = {}) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, options)
    const timeout = setTimeout(() => {
      try {
        ws.terminate()
      } catch {
        // Ignore shutdown failures for test timeouts.
      }
      reject(new Error(`Timed out waiting for websocket open: ${url}`))
    }, 2000)

    const fail = message => {
      clearTimeout(timeout)
      try {
        ws.terminate()
      } catch {
        // Ignore shutdown failures after an expected rejection.
      }
      reject(new Error(message))
    }

    ws.once('open', () => {
      clearTimeout(timeout)
      resolve(ws)
    })
    ws.once('unexpected-response', (_req, res) => {
      const chunks = []
      res.on('data', chunk => chunks.push(Buffer.from(chunk)))
      res.on('end', () => {
        fail(
          `Expected websocket open, got HTTP ${res.statusCode}: ${Buffer.concat(chunks).toString('utf8')}`
        )
      })
      res.resume()
    })
    ws.once('error', error => {
      fail(`Expected websocket open, got error: ${error.message}`)
    })
  })
}

afterEach(async () => {
  while (activeServers.length > 0) {
    const server = activeServers.pop()
    await server.stop()
  }

  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop(), { recursive: true, force: true })
  }
})

describe('AutomergeSyncServer configuration', () => {
  it('requires an API token unless insecure local mode is enabled', () => {
    assert.throws(
      () => createServer({ apiToken: '', allowInsecureLocal: false }),
      /MC_API_TOKEN is required/
    )

    assert.doesNotThrow(() => createServer({ apiToken: '', allowInsecureLocal: true }))
  })

  it('binds to loopback by default', () => {
    const server = createServer()
    assert.equal(server.host, '127.0.0.1')
  })

  it('rejects wildcard origin configuration', () => {
    assert.throws(
      () => createServer({ allowedOrigins: '*' }),
      /Wildcard "\*" is not supported/
    )
  })
})

describe('AutomergeSyncServer HTTP auth and CORS', () => {
  it('allows authorized GET requests and allowlisted preflight requests', async () => {
    const server = await startServer()

    const getResponse = await fetch(httpUrl(server, '/automerge/doc'), {
      headers: {
        Authorization: 'Bearer secret-token',
        Origin: 'http://allowed.example',
      },
    })

    assert.equal(getResponse.status, 200)
    assert.equal(getResponse.headers.get('access-control-allow-origin'), 'http://allowed.example')
    const payload = await getResponse.json()
    assert.equal(payload.success, true)

    const preflightResponse = await fetch(httpUrl(server, '/automerge/doc'), {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://allowed.example',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization',
      },
    })

    assert.equal(preflightResponse.status, 204)
    assert.equal(preflightResponse.headers.get('access-control-allow-origin'), 'http://allowed.example')
    assert.match(preflightResponse.headers.get('access-control-allow-headers') || '', /Authorization/)
  })

  it('rejects disallowed origins for GET and preflight requests', async () => {
    const server = await startServer()

    const getResponse = await fetch(httpUrl(server, '/automerge/doc'), {
      headers: {
        Authorization: 'Bearer secret-token',
        Origin: 'http://denied.example',
      },
    })

    assert.equal(getResponse.status, 403)
    assert.match((await getResponse.json()).error, /Origin not allowed/)

    const preflightResponse = await fetch(httpUrl(server, '/automerge/doc'), {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://denied.example',
        'Access-Control-Request-Method': 'GET',
      },
    })

    assert.equal(preflightResponse.status, 403)
    assert.match((await preflightResponse.json()).error, /Origin not allowed/)
    assert.equal(server.getSecurityCounters().httpOriginRejected, 2)
  })

  it('rejects unauthorized HTTP requests and accepts authorized ones', async () => {
    const server = await startServer()

    const unauthorizedResponse = await fetch(httpUrl(server, '/automerge/doc'))
    assert.equal(unauthorizedResponse.status, 401)
    assert.match((await unauthorizedResponse.json()).error, /Unauthorized/)

    const authorizedResponse = await fetch(httpUrl(server, '/automerge/doc'), {
      headers: { Authorization: 'Bearer secret-token' },
    })
    assert.equal(authorizedResponse.status, 200)
  })

  it('does not allow legacy query tokens on HTTP requests', async () => {
    const server = await startServer({ allowLegacyWsQueryToken: true })

    const response = await fetch(httpUrl(server, '/automerge/doc?token=secret-token'))
    assert.equal(response.status, 401)
  })
})

describe('AutomergeSyncServer websocket auth and origin enforcement', () => {
  it('rejects unauthorized websocket upgrades before the socket opens', async () => {
    const server = await startServer()

    const result = await connectWebSocket(wsUrl(server), {
      origin: 'http://allowed.example',
    })

    assert.equal(result.type, 'unexpected-response')
    assert.equal(result.statusCode, 401)
    assert.match(result.body, /Unauthorized/)
  })

  it('rejects disallowed websocket origins before the socket opens', async () => {
    const server = await startServer()

    const result = await connectWebSocket(wsUrl(server), {
      origin: 'http://denied.example',
      headers: { Authorization: 'Bearer secret-token' },
    })

    assert.equal(result.type, 'unexpected-response')
    assert.equal(result.statusCode, 403)
    assert.match(result.body, /Origin not allowed/)
  })

  it('consumes websocket tickets after a single successful use and rejects expired tickets', async () => {
    const server = await startServer({ wsTicketTtlMs: 25 })

    const ticketResponse = await fetch(httpUrl(server, '/automerge/ws-ticket'), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer secret-token',
        Origin: 'http://allowed.example',
        'Content-Type': 'application/json',
      },
    })
    const firstTicket = (await ticketResponse.json()).ticket

    const firstConnection = await expectWebSocketOpen(wsUrl(server, `/?ticket=${firstTicket}`), {
      origin: 'http://allowed.example',
    })
    firstConnection.close()
    await once(firstConnection, 'close')

    const reusedConnection = await connectWebSocket(wsUrl(server, `/?ticket=${firstTicket}`), {
      origin: 'http://allowed.example',
    })
    assert.equal(reusedConnection.type, 'unexpected-response')
    assert.equal(reusedConnection.statusCode, 401)

    const secondTicketResponse = await fetch(httpUrl(server, '/automerge/ws-ticket'), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer secret-token',
        Origin: 'http://allowed.example',
        'Content-Type': 'application/json',
      },
    })
    const secondTicket = (await secondTicketResponse.json()).ticket

    await delay(40)

    const expiredConnection = await connectWebSocket(wsUrl(server, `/?ticket=${secondTicket}`), {
      origin: 'http://allowed.example',
    })
    assert.equal(expiredConnection.type, 'unexpected-response')
    assert.equal(expiredConnection.statusCode, 401)
  })

  it('allows legacy websocket query tokens only when the compatibility flag is enabled', async () => {
    const disabledServer = await startServer({ allowLegacyWsQueryToken: false })

    const disabledResult = await connectWebSocket(wsUrl(disabledServer, '/?token=secret-token'), {
      origin: 'http://allowed.example',
    })
    assert.equal(disabledResult.type, 'unexpected-response')
    assert.equal(disabledResult.statusCode, 401)

    const enabledServer = await startServer({ allowLegacyWsQueryToken: true })

    const enabledSocket = await expectWebSocketOpen(wsUrl(enabledServer, '/?token=secret-token'), {
      origin: 'http://allowed.example',
    })
    enabledSocket.close()
    await once(enabledSocket, 'close')
  })
})
