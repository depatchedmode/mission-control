#!/usr/bin/env node

import { beforeEach, afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'

import AutomergeSyncServer from '../automerge-sync-server.js'

const ORIGINAL_ENV = { ...process.env }

function resetEnv(overrides = {}) {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key]
  }

  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    process.env[key] = value
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key]
      continue
    }
    process.env[key] = value
  }
}

describe('AutomergeSyncServer websocket auth', () => {
  beforeEach(() => {
    resetEnv({
      MC_API_TOKEN: 'secret-token',
      MC_ALLOW_INSECURE_LOCAL: undefined,
      MC_ALLOW_LEGACY_WS_QUERY_TOKEN: '1',
      MC_WS_TICKET_TTL_MS: '60000',
    })
  })

  afterEach(() => {
    resetEnv()
  })

  it('rejects legacy query tokens on HTTP requests', () => {
    const server = new AutomergeSyncServer()

    assert.equal(
      server.isAuthorizedRequest({ headers: {}, url: '/automerge/doc?token=secret-token' }),
      false
    )
  })

  it('allows legacy query tokens on websocket requests when enabled', () => {
    const server = new AutomergeSyncServer()

    assert.equal(
      server.isAuthorizedWebSocketRequest({ headers: {}, url: '/?token=secret-token' }),
      true
    )
  })

  it('consumes websocket tickets after a single successful use', () => {
    const server = new AutomergeSyncServer()
    const ticket = server.mintWsTicket()

    assert.equal(
      server.isAuthorizedWebSocketRequest({ headers: {}, url: `/?ticket=${ticket}` }),
      true
    )
    assert.equal(
      server.isAuthorizedWebSocketRequest({ headers: {}, url: `/?ticket=${ticket}` }),
      false
    )
  })
})
