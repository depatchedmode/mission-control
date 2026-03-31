#!/usr/bin/env node

/**
 * Fitness Test: Patchwork Branching
 *
 * Validates the experimental branch/merge feature —
 * tasks can be branched for experimentation and merged back.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  withStartedServer,
  authedPost,
  authedPatch,
  authedGet,
  getDoc,
  createTask,
} from '../support/resources.js'

describe('patchwork branching', () => {
  it('creates a branch of a task', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, {
        title: 'Parent task',
        status: 'in-progress',
        priority: 'p1',
      })

      const result = await authedPost(server, `/automerge/task/${taskId}/branch`, {
        branchName: 'experiment-1',
        agent: 'gary',
      })

      assert.ok(result.success)
      assert.ok(result.branchId)
      assert.equal(result.parentId, taskId)

      const doc = await getDoc(server)
      const branch = doc.tasks[result.branchId]
      assert.ok(branch, 'Branch task should exist')
      assert.equal(branch.branch_of, taskId)
      assert.equal(branch.branch_name, 'experiment-1')
      assert.ok(branch.title.includes('experiment-1'))
    })
  })

  it('lists branches for a task', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Branched task' })

      await authedPost(server, `/automerge/task/${taskId}/branch`, {
        branchName: 'branch-a',
        agent: 'gary',
      })
      await authedPost(server, `/automerge/task/${taskId}/branch`, {
        branchName: 'branch-b',
        agent: 'friday',
      })

      const { branches } = await authedGet(server, `/automerge/task/${taskId}/branches`)
      assert.equal(branches.length, 2)

      const names = branches.map(b => b.branch_name).sort()
      assert.deepEqual(names, ['branch-a', 'branch-b'])
    })
  })

  it('modifying a branch does not affect the parent', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, {
        title: 'Parent',
        status: 'todo',
        priority: 'p2',
      })

      const { branchId } = await authedPost(server, `/automerge/task/${taskId}/branch`, {
        branchName: 'experiment',
        agent: 'gary',
      })

      // Update the branch
      await authedPatch(server, `/automerge/task/${branchId}`, {
        status: 'in-progress',
        priority: 'p0',
        agent: 'gary',
      })

      const doc = await getDoc(server)
      const parent = doc.tasks[taskId]
      const branch = doc.tasks[branchId]

      assert.equal(parent.status, 'todo', 'Parent status should be unchanged')
      assert.equal(parent.priority, 'p2', 'Parent priority should be unchanged')
      assert.equal(branch.status, 'in-progress', 'Branch status should be updated')
      assert.equal(branch.priority, 'p0', 'Branch priority should be updated')
    })
  })

  it('merges a branch back to parent', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, {
        title: 'Merge parent',
        status: 'todo',
        priority: 'p2',
      })

      const { branchId } = await authedPost(server, `/automerge/task/${taskId}/branch`, {
        branchName: 'feature',
        agent: 'gary',
      })

      // Make changes on the branch
      await authedPatch(server, `/automerge/task/${branchId}`, {
        status: 'in-progress',
        priority: 'p0',
        agent: 'gary',
      })

      // Merge back
      const mergeResult = await authedPost(server, `/automerge/branch/${branchId}/merge`, {
        agent: 'gary',
      })

      assert.ok(mergeResult.success)
      assert.equal(mergeResult.parentId, taskId)

      const doc = await getDoc(server)
      const parent = doc.tasks[taskId]

      assert.equal(parent.status, 'in-progress', 'Parent should have branch status after merge')
      assert.equal(parent.priority, 'p0', 'Parent should have branch priority after merge')

      // Branch should be marked merged
      const branch = doc.tasks[branchId]
      assert.equal(branch.merged, true)
      assert.ok(branch.merged_at)
      assert.equal(branch.status, 'completed')
    })
  })

  it('merge records history on parent task', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'History parent', priority: 'p2' })

      const { branchId } = await authedPost(server, `/automerge/task/${taskId}/branch`, {
        branchName: 'tracked',
        agent: 'gary',
      })

      await authedPatch(server, `/automerge/task/${branchId}`, {
        priority: 'p0',
        agent: 'gary',
      })

      await authedPost(server, `/automerge/branch/${branchId}/merge`, { agent: 'gary' })

      const doc = await getDoc(server)
      const history = doc.taskHistory?.[taskId] || []
      const mergeEntry = history.find(h => h.type === 'merge')

      assert.ok(mergeEntry, 'Should have a merge history entry')
      assert.equal(mergeEntry.from_branch, branchId)
      assert.ok(mergeEntry.changes.length > 0, 'Merge should record changes')
    })
  })

  it('merge generates activity feed entry', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Activity parent' })

      const { branchId } = await authedPost(server, `/automerge/task/${taskId}/branch`, {
        branchName: 'activity-test',
        agent: 'gary',
      })

      await authedPost(server, `/automerge/branch/${branchId}/merge`, { agent: 'gary' })

      const doc = await getDoc(server)
      const mergeActivity = doc.activity.find(
        a => a.type === 'task_merged' && a.taskId === taskId
      )

      assert.ok(mergeActivity, 'Should have task_merged activity')
      assert.equal(mergeActivity.branch_id, branchId)
      assert.equal(mergeActivity.agent, 'gary')
    })
  })

  it('branching generates activity feed entry', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Branch activity' })

      const { branchId } = await authedPost(server, `/automerge/task/${taskId}/branch`, {
        branchName: 'tracked-branch',
        agent: 'friday',
      })

      const doc = await getDoc(server)
      const branchActivity = doc.activity.find(
        a => a.type === 'task_branched' && a.taskId === taskId
      )

      assert.ok(branchActivity, 'Should have task_branched activity')
      assert.equal(branchActivity.branch_id, branchId)
      assert.equal(branchActivity.agent, 'friday')
    })
  })

  it('cannot merge an already-merged branch', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Double merge' })

      const { branchId } = await authedPost(server, `/automerge/task/${taskId}/branch`, {
        branchName: 'once',
        agent: 'gary',
      })

      // First merge
      await authedPost(server, `/automerge/branch/${branchId}/merge`, { agent: 'gary' })

      // Second merge should fail
      const result = await authedPost(server, `/automerge/branch/${branchId}/merge`, {
        agent: 'gary',
      })
      assert.equal(result.status, 400)
      assert.match(result.error, /already merged/i)
    })
  })

  it('branch with linked commits preserves history', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Commit branch' })

      const { branchId } = await authedPost(server, `/automerge/task/${taskId}/branch`, {
        branchName: 'dev',
        agent: 'gary',
      })

      // Link a commit to the branch task
      await authedPost(server, `/automerge/task/${branchId}/commit`, {
        agent: 'gary',
        commit: {
          hash: 'abc123def456',
          message: 'feat: add branch feature',
          diff: { shortstat: '3 files changed' },
        },
      })

      const doc = await getDoc(server)
      const branchHistory = doc.taskHistory?.[branchId] || []
      const commitEntry = branchHistory.find(h => h.type === 'commit')

      assert.ok(commitEntry, 'Branch should have commit history')
      assert.equal(commitEntry.commit.hash, 'abc123def456')
    })
  })
})
