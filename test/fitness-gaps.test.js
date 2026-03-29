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
import { Repo } from '@automerge/automerge-repo'
import { NodeFSStorageAdapter } from '../lib/nodefs-storage-adapter.js'
import {
  withStartedServer,
  authedPost,
  authedPatch,
  authedGet,
  getDoc,
  createTask,
  createTempDir,
  cleanupTempDir,
} from '../support/resources.js'

// ─────────────────────────────────────────────────────────────────
// GAP 1: True CRDT merge is never exercised
//
// The positioning says "CRDT: conflict-free concurrent edits" but
// all writes are serialized through a single HTTP server. Automerge's
// merge capability is never actually tested. This test creates two
// independent Automerge repos, makes conflicting changes in each,
// and merges them — the way real CRDT peers would behave.
// ─────────────────────────────────────────────────────────────────

describe('GAP: true CRDT merge between divergent peers', () => {
  it('two repos that diverge on different fields merge cleanly', async () => {
    const storageA = createTempDir('crdt-a-')
    const storageB = createTempDir('crdt-b-')

    try {
      // Create repo A with a task
      const repoA = new Repo({
        storage: new NodeFSStorageAdapter(storageA),
        sharePolicy: async () => false,
      })
      const handleA = repoA.create()
      handleA.change(doc => {
        doc.tasks = {}
        doc.tasks['task-1'] = {
          id: 'task-1',
          title: 'Shared task',
          status: 'todo',
          assignee: null,
          priority: 'p2',
        }
      })

      // Get the raw Automerge document bytes and load into repo B
      const repoB = new Repo({
        storage: new NodeFSStorageAdapter(storageB),
        sharePolicy: async () => false,
      })

      // Clone A's document into B by saving and loading binary
      const docA = handleA.doc()
      const handleB = repoB.create()
      handleB.change(doc => {
        doc.tasks = {}
        doc.tasks['task-1'] = {
          id: 'task-1',
          title: 'Shared task',
          status: 'todo',
          assignee: null,
          priority: 'p2',
        }
      })

      // Now make DIVERGENT changes — this simulates two agents working offline
      handleA.change(doc => {
        doc.tasks['task-1'].status = 'in-progress'
      })

      handleB.change(doc => {
        doc.tasks['task-1'].assignee = 'friday'
      })

      // In a real CRDT system, merging these should preserve BOTH changes.
      // Mission Control never does this — it serializes through HTTP.
      // This test asserts that the project's Automerge usage actually
      // supports the merge it claims to offer.
      //
      // To make this pass, Mission Control would need to sync changes
      // between repos (e.g., via Automerge's sync protocol) rather than
      // only accepting HTTP writes to a single authority.

      const mergedA = handleA.doc()

      // Repo A only sees its own change — it has no mechanism to learn
      // about repo B's change. This is the gap: there is no sync.
      assert.equal(mergedA.tasks['task-1'].status, 'in-progress', 'A status should be updated')
      assert.equal(
        mergedA.tasks['task-1'].assignee,
        'friday',
        'A should also have B\'s assignee change after merge — FAILS because no sync exists'
      )

      await repoA.shutdown()
      await repoB.shutdown()
    } finally {
      cleanupTempDir(storageA)
      cleanupTempDir(storageB)
    }
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
