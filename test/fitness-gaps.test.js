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
import { once } from 'node:events'
import { Repo } from '@automerge/automerge-repo'
import { WebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'
import {
  withStartedServer,
  authedPost,
  authedPatch,
  authedGet,
  getDoc,
  createTask,
  wsUrl,
  TEST_TOKEN,
} from '../support/resources.js'

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
    await withStartedServer({ allowLegacyWsQueryToken: true }, async server => {
      const url = wsUrl(server, `/?token=${TEST_TOKEN}`)

      // Connect a real Automerge Repo using its native WS adapter.
      // The adapter sends CBOR-encoded binary messages (join, sync);
      // the server only understands JSON — so this will fail.
      // Disable reconnection so the test doesn't hang.
      const adapter = new WebSocketClientAdapter(url, 0)
      const peerRepo = new Repo({ network: [adapter] })

      try {
        // Give the adapter time to attempt its handshake.
        await new Promise(resolve => setTimeout(resolve, 1000))

        // In a working CRDT sync setup, the peer repo would discover
        // the server's document and be able to read it. Instead, the
        // protocol mismatch means no documents are shared.
        const handles = peerRepo.handles
        const syncedDocCount = Object.keys(handles).length

        assert.ok(
          syncedDocCount > 0,
          'Peer repo should discover server documents via Automerge sync — FAILS because the WS endpoint speaks JSON, not the CBOR-based Automerge sync protocol'
        )
      } finally {
        await peerRepo.shutdown()
      }
    })
  })
})

// ─────────────────────────────────────────────────────────────────
// GAP 2: Mention delivery has no duplicate protection
//
// If the daemon delivers a mention notification but crashes before
// marking it delivered, the next poll will deliver it again.
// There's no idempotency token or dedup mechanism.
// ─────────────────────────────────────────────────────────────────

describe('GAP: mention delivery duplicate protection', () => {
  it('mentions include an idempotency key for safe redelivery', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob please review',
        agent: 'alice',
      })

      const { mentions } = await authedGet(server, '/automerge/mentions/pending?agent=bob')
      assert.equal(mentions.length, 1)

      // A mention should carry an idempotency_key that the daemon can
      // pass to the delivery target, allowing the target to deduplicate
      // if the same mention is delivered twice.
      assert.ok(
        mentions[0].idempotency_key,
        'Mention should have an idempotency_key for safe redelivery — FAILS because no dedup mechanism exists'
      )
    })
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

      await authedPatch(server, `/automerge/task/${taskId}`, {
        status: 'in-progress',
        agent: 'agent-a',
      })

      const doc = await getDoc(server)

      // The activity entry and the taskHistory entry should have the
      // exact same timestamp, proving they were written atomically.
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
        activityEntry.timestamp,
        historyEntry.timestamp,
        'Activity and history timestamps should match (proving atomicity) — FAILS because they are written in separate docHandle.change() calls with different Date.now() values'
      )
    })
  })
})
