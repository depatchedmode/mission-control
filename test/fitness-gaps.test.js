#!/usr/bin/env node

/**
 * Fitness Gaps: Tests that document known issues.
 *
 * These tests describe the EXPECTED behavior based on the project's
 * positioning claims. They fail today, serving as a roadmap for
 * closing the gap between what Mission Control claims and what it does.
 *
 * When a test starts passing, the corresponding issue has been fixed.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { WebSocket } from 'ws'
import {
  withStartedServer,
  authedPost,
  authedPatch,
  authedGet,
  getDoc,
  createTask,
  wsUrl,
  connectAuthenticatedWs,
  nextWsMessage,
} from '../support/resources.js'

// ─────────────────────────────────────────────────────────────────
// GAP 1: True CRDT merge is never exercised
//
// The positioning says "CRDT: conflict-free concurrent edits" but
// all writes are serialized through a single HTTP server. The
// WebSocket endpoint speaks a JSON protocol (document-state /
// document-update), NOT the Automerge binary sync protocol. There
// is no path for a second Automerge peer to sync its changes into
// the server — every write must go through HTTP or the JSON WS API.
//
// This test connects to the real server and verifies that the WS
// protocol has no support for Automerge sync messages. When a true
// CRDT sync path is added, this test will start passing.
// ─────────────────────────────────────────────────────────────────

describe('GAP: true CRDT sync via WebSocket', () => {
  it('server should accept Automerge sync messages over WebSocket', async () => {
    await withStartedServer({}, async server => {
      const ws = await connectAuthenticatedWs(server)
      try {
        // Consume initial document-state
        const initial = await nextWsMessage(ws)
        assert.equal(initial.type, 'document-state', 'Should get JSON document-state')

        // Attempt to send an Automerge-style sync message.
        // In a true CRDT system, the server would accept binary sync
        // messages and merge them into its local document. Instead,
        // the server only understands JSON document-change messages.
        ws.send(JSON.stringify({
          type: 'sync',
          data: 'automerge-sync-message-placeholder',
        }))

        // If the server supported CRDT sync, it would respond with a
        // sync-state or sync-complete message. Instead, it either
        // ignores the message or sends back an error/unrecognized type.
        //
        // We test for a 'sync-response' message type, which would
        // indicate the server speaks the Automerge sync protocol.
        const response = await nextWsMessage(ws, 1000).catch(() => null)

        assert.ok(
          response && response.type === 'sync-response',
          'Server should respond to sync messages with a sync-response — FAILS because the WS endpoint only speaks JSON document-state/document-update, not the Automerge sync protocol'
        )
      } finally {
        ws.close()
        await once(ws, 'close')
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
