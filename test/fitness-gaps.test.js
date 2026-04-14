#!/usr/bin/env node

/**
 * Fitness gaps and roadmap contracts.
 *
 * GAP suites document areas where the product still trails its stated
 * direction, but they also keep shipped roadmap claims from regressing
 * after the gap has been closed.
 *
 * `npm test` excludes `GAP:` suites by name. `npm run test:gaps` runs
 * these GAP specs plus the UC sync acceptance suite.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { Repo, parseAutomergeUrl } from '@automerge/automerge-repo'
import { WebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'
import {
  withStartedServer,
  mintWsTicket,
  authedPatch,
  authedGet,
  getDoc,
  createTask,
  nativeAutomergeWsUrl,
  NATIVE_AUTOMERGE_RETRY_MS,
} from '../support/resources.js'

const AUTOMERGE_SYNC_PROBE_TIMEOUT_MS = 3000

async function findWithTimeout(repo, url, timeoutMs) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await repo.find(url, { signal: controller.signal })
  } catch {
    const { documentId } = parseAutomergeUrl(url)
    const handle = repo.handles[documentId]
    handle?.delete()
    delete repo.handles[documentId]
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function suppressAutomergeRepoFailureLogs() {
  const originalLog = console.log
  console.log = (...args) => {
    const [first] = args
    if (
      typeof first === 'string' &&
      (first.startsWith('error waiting for ') || first === 'caught whenready')
    ) {
      return
    }
    originalLog(...args)
  }

  return () => {
    console.log = originalLog
  }
}

// ─────────────────────────────────────────────────────────────────
// GAP 1: True CRDT merge is never exercised
//
// HTTP writes are still serialized through a single hub, so true
// CRDT merge is proven by native Repo peers rather than HTTP PATCHes.
// Mission Control now exposes both WebSocket surfaces on the same port:
// legacy JSON on `/` and native Automerge sync (CBOR) on `/automerge`.
//
// This test connects a real Automerge Repo with its native
// WebSocketClientAdapter to the running server and verifies the thin
// native-wire contract: a peer can resolve the workspace document URL
// over `/automerge`.
//
// Functional merge behavior lives in `test/sync-use-cases.test.js`
// (UC1–UC4). This GAP stays as a lower-level regression guard.
// ─────────────────────────────────────────────────────────────────

describe('GAP: true CRDT sync via WebSocket', () => {
  it('Automerge Repo peer can sync with the server via WebSocket', async () => {
    await withStartedServer({}, async server => {
      const ticket = await mintWsTicket(server)
      const transportUrl = nativeAutomergeWsUrl(server, { ticket })
      const { url: documentUrl } = await authedGet(server, '/automerge/url')

      // Connect a real Automerge Repo using its native WS adapter.
      // The adapter sends CBOR-encoded binary messages (join, sync);
      // the server must accept CBOR on /automerge for this to pass.
      // Use a long retry interval so a failed handshake does not
      // immediately consume the single-use WS ticket on reconnect.
      const adapter = new WebSocketClientAdapter(transportUrl, NATIVE_AUTOMERGE_RETRY_MS)
      const peerRepo = new Repo({ network: [adapter] })
      const restoreLog = suppressAutomergeRepoFailureLogs()

      try {
        // In a working CRDT sync setup, clients can fetch the document
        // URL over HTTP and resolve that URL through the Automerge sync
        // transport. If native sync regresses, the repo will not resolve the document URL. The probe timeout
        // must exceed the adapter's 1s readiness fallback so a future
        // sync implementation still has time to request and resolve it.
        const handle = await findWithTimeout(
          peerRepo,
          documentUrl,
          AUTOMERGE_SYNC_PROBE_TIMEOUT_MS
        )
        const doc = handle?.doc()

        assert.ok(
          handle?.isReady() && doc?.name === 'Mission Control',
          'Peer repo should resolve the server document URL via Automerge native WebSocket sync'
        )
      } finally {
        adapter.socket?.terminate?.()
        try {
          await peerRepo.shutdown()
          await delay(50)
        } finally {
          restoreLog()
        }
      }
    })
  })
})

// ─────────────────────────────────────────────────────────────────
// GAP 2: End-to-end duplicate protection still depends on harness dedupe
//
// Mission Control now uses lease-based at-least-once delivery and emits
// stable idempotency keys, but true duplicate suppression still depends
// on the receiving harness honoring that key. This spec models the
// downstream contract that a future harness should satisfy.
// ─────────────────────────────────────────────────────────────────

describe('GAP: mention delivery duplicate protection', () => {
  it('a harness can use stable keys to dedupe across duplicate poll cycles', async () => {
    const replayedMention = {
      id: 'mention-1',
      idempotency_key: 'delivery-key-1',
      from_agent: 'alice',
      to_agent: 'bob',
      taskId: 'task-123',
      content: '@bob please review',
    }
    const secondMention = {
      id: 'mention-2',
      idempotency_key: 'delivery-key-2',
      from_agent: 'alice',
      to_agent: 'bob',
      taskId: 'task-123',
      content: '@bob please review',
    }
    let downstreamNotifications = 0
    const deliveredKeys = new Set()

    function extractDeliveryKey(message) {
      if (!message || typeof message !== 'object') return null
      const candidates = [
        message.id,
        message.mentionId,
        message.mention_id,
        message.idempotencyKey,
        message.idempotency_key,
      ]
      return candidates.find(candidate => typeof candidate === 'string') || null
    }

    const pollCycles = [
      [replayedMention],
      [replayedMention, secondMention],
    ]

    for (const cycle of pollCycles) {
      for (const mention of cycle) {
        const key = extractDeliveryKey(mention)
        if (key && deliveredKeys.has(key)) continue
        if (key) {
          deliveredKeys.add(key)
        }
        downstreamNotifications += 1
      }
    }

    assert.equal(
      downstreamNotifications,
      2,
      'Two logical mentions should yield exactly two downstream notifications even if one is replayed in a later poll cycle, but this still depends on harness-side idempotency'
    )
  })
})

// ─────────────────────────────────────────────────────────────────
// GAP: task PATCH atomicity (regression guard)
//
// PATCH /automerge/task/:taskId delegates to AutomergeStore.updateTask(),
// which applies task fields, taskHistory, and task_updated activity inside
// a single docHandle.change(). This suite guards that one mutating PATCH
// still produces exactly one Automerge change event (historically a gap
// when the handler used two separate change() calls).
// ─────────────────────────────────────────────────────────────────

describe('GAP: task update and history recording are atomic', () => {
  it('update and its history entry are written in a single change', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, {
        title: 'Atomicity test',
        status: 'todo',
        priority: 'p2',
      })

      // Mutating PATCH should perform one docHandle.change() via updateTask.
      let changeCount = 0
      const onChange = () => {
        changeCount += 1
      }
      server.store.docHandle.on('change', onChange)

      try {
        await authedPatch(server, `/automerge/task/${taskId}`, {
          status: 'in-progress',
          agent: 'agent-a',
        })
      } finally {
        server.store.docHandle.off('change', onChange)
      }

      const doc = await getDoc(server)

      const activityEntry = doc.activity.find(
        a => a.type === 'task_updated' && a.taskId === taskId
      )
      const historyEntries = doc.taskHistory?.[taskId] || []
      const historyEntry = historyEntries.find(
        h => h.changes?.some(c => c.field === 'status')
      )

      assert.ok(activityEntry, 'Should have activity entry')
      assert.ok(historyEntry, 'Should have history entry')

      assert.equal(
        changeCount,
        1,
        'A single HTTP PATCH that mutates the task should produce exactly one Automerge document change'
      )
    })
  })
})
