#!/usr/bin/env node

/**
 * Fitness Gaps: Tests that document known issues.
 *
 * These tests describe the EXPECTED behavior based on the project's
 * positioning claims. They fail today, serving as a roadmap for
 * closing the gap between what Mission Control claims and what it does.
 *
 * When a test starts passing, the corresponding issue has been fixed.
 *
 * GAP suites stay runnable, but are excluded from `npm test`.
 * Run them explicitly with `npm run test:gaps`.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Repo, parseAutomergeUrl } from '@automerge/automerge-repo'
import { WebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'
import {
  withStartedServer,
  authedPost,
  authedPatch,
  authedGet,
  getDoc,
  createTask,
  wsUrl,
} from '../support/resources.js'

const AUTOMERGE_SYNC_PROBE_TIMEOUT_MS = 3000
let mentionProcessorImportCount = 0

async function importFreshMentionProcessor() {
  const moduleUrl = new URL('../daemon/mention-processor.js', import.meta.url)
  moduleUrl.searchParams.set('instance', String(mentionProcessorImportCount++))
  return import(moduleUrl.href)
}

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
// The positioning says "CRDT: conflict-free concurrent edits" but
// all writes are serialized through a single HTTP server. The
// WebSocket endpoint speaks a custom JSON protocol (document-state /
// document-update), NOT the Automerge binary sync protocol (CBOR).
//
// This test connects a real Automerge Repo with its native
// WebSocketClientAdapter to the running server. The adapter sends
// CBOR-encoded join/sync messages, but the server expects JSON —
// so the handshake never completes and no CRDT sync occurs.
//
// When Mission Control adds true Automerge sync support, this
// test will start passing.
// ─────────────────────────────────────────────────────────────────

describe('GAP: true CRDT sync via WebSocket', () => {
  it('Automerge Repo peer can sync with the server via WebSocket', async () => {
    await withStartedServer({}, async server => {
      const { ticket } = await authedPost(server, '/automerge/ws-ticket', {})
      const transportUrl = wsUrl(server, `/?ticket=${ticket}`)
      const { url: documentUrl } = await authedGet(server, '/automerge/url')

      // Connect a real Automerge Repo using its native WS adapter.
      // The adapter sends CBOR-encoded binary messages (join, sync);
      // the server only understands JSON — so this will fail.
      // Use a long retry interval so a failed handshake does not
      // immediately consume the single-use WS ticket on reconnect.
      const adapter = new WebSocketClientAdapter(transportUrl, 60_000)
      const peerRepo = new Repo({ network: [adapter] })
      const restoreLog = suppressAutomergeRepoFailureLogs()

      try {
        // In a working CRDT sync setup, clients can fetch the document
        // URL over HTTP and resolve that URL through the Automerge sync
        // transport. Today the WebSocket endpoint still speaks custom
        // JSON instead of the Automerge binary sync protocol, so the
        // repo never resolves the requested document. The probe timeout
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
          'Peer repo should resolve the server document URL via Automerge sync — FAILS because the WS endpoint still speaks JSON, not the CBOR-based Automerge sync protocol'
        )
      } finally {
        adapter.socket?.terminate?.()
        try {
          await peerRepo.shutdown()
          await new Promise(resolve => setTimeout(resolve, 50))
        } finally {
          restoreLog()
        }
      }
    })
  })
})

// ─────────────────────────────────────────────────────────────────
// GAP 2: Mention delivery has no duplicate protection
//
// If the daemon delivers a mention notification but crashes before
// marking it delivered, the next poll will deliver it again.
// The fix should be an end-to-end behavior guarantee rather than
// a requirement for one particular payload field.
// ─────────────────────────────────────────────────────────────────

describe('GAP: mention delivery duplicate protection', () => {
  it('the daemon notifies a mention at most once across duplicate poll cycles', async () => {
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
    const doc = {
      agents: {
        bob: {
          name: 'bob',
        },
      },
    }
    let downstreamNotifications = 0
    const deliveredKeys = new Set()

    function extractDeliveryKey(message) {
      if (typeof message === 'string') {
        for (const key of [
          replayedMention.id,
          replayedMention.idempotency_key,
          secondMention.id,
          secondMention.idempotency_key,
        ]) {
          if (message.includes(key)) return key
        }
        return null
      }

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

    const deps = {
      doc,
      wakeAgent: async (_agentId, message) => {
        const key = extractDeliveryKey(message)
        if (key && deliveredKeys.has(key)) {
          return true
        }
        if (key) {
          deliveredKeys.add(key)
        }
        downstreamNotifications += 1
        return true
      },
      markDelivered: async () => {},
      log: () => {},
    }

    // Simulate a crash window where one mention is replayed in a later
    // poll before its delivered flag is durably advanced, alongside a
    // second mention with the same visible text. Each poll intentionally
    // uses a fresh module instance to model a daemon restart, so a fix
    // that only keeps dedupe state in memory does not satisfy the test.
    const { processPendingMentions: firstPollProcessor } =
      await importFreshMentionProcessor()
    await firstPollProcessor({
      pendingMentions: [replayedMention],
      ...deps,
    })
    const { processPendingMentions: replayPollProcessor } =
      await importFreshMentionProcessor()
    await replayPollProcessor({
      pendingMentions: [replayedMention, secondMention],
      ...deps,
    })

    assert.equal(
      downstreamNotifications,
      2,
      'Two logical mentions should yield exactly two downstream notifications even if one is replayed in a later poll cycle — FAILS because duplicate deliveries are indistinguishable from a distinct second mention with the same visible text'
    )
  })
})

// ─────────────────────────────────────────────────────────────────
// GAP 3: PATCH endpoint computes diff outside the atomic change
//
// In automerge-sync-server.js, PATCH /automerge/task/:taskId reads
// the current doc via store.getDoc() (a snapshot), computes which
// fields changed, then enters docHandle.change() to apply them.
// The diff computation and the write are NOT in the same atomic
// block. The HTTP handler also records changes in two separate
// docHandle.change() calls (one for the update, one via
// recordTaskChange for history) — meaning another request could
// interleave between them.
//
// This test verifies that the update AND its history entry are
// recorded atomically. Today they aren't — the update and the
// history write are separate docHandle.change() calls.
// ─────────────────────────────────────────────────────────────────

describe('GAP: task update and history recording are atomic', () => {
  it('update and its history entry are written in a single change', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, {
        title: 'Atomicity test',
        status: 'todo',
        priority: 'p2',
      })

      // Patch the task — this should record the update AND its history
      // in a single docHandle.change() call. Currently the server does:
      //   1. docHandle.change() to apply the update + push to activity
      //   2. store.recordTaskChange() which does another docHandle.change()
      // This means history is written in a separate transaction.
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

      // One request should result in one Automerge document change.
      // Today the HTTP handler still performs two separate writes.
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
        'A single HTTP PATCH should produce exactly one Automerge document change — FAILS because the route still updates the task and taskHistory in separate docHandle.change() calls'
      )
    })
  })
})
