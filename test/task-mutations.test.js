#!/usr/bin/env node

/**
 * Fitness Test: Task Mutations & Activity Feed
 *
 * Validates that the full task lifecycle (CRUD) works correctly
 * and that the activity feed faithfully records all changes.
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

describe('task mutations', () => {
  it('creates a task with all fields', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/task', {
        title: 'Full task',
        description: 'A detailed description',
        priority: 'p0',
        assignee: 'gary',
        tags: ['urgent', 'backend'],
        status: 'in-progress',
        agent: 'test-agent',
      })

      assert.ok(result.success)
      const doc = await getDoc(server)
      const task = doc.tasks[result.taskId]

      assert.equal(task.title, 'Full task')
      assert.equal(task.description, 'A detailed description')
      assert.equal(task.priority, 'p0')
      assert.equal(task.assignee, 'gary')
      assert.deepEqual(task.tags, ['urgent', 'backend'])
      assert.equal(task.status, 'in-progress')
      assert.ok(task.created_at)
      assert.ok(task.updated_at)
    })
  })

  it('updates status field and records activity', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Status test' })

      const result = await authedPatch(server, `/automerge/task/${taskId}`, {
        status: 'in-progress',
        agent: 'gary',
      })

      assert.ok(result.success)
      assert.equal(result.changes.length, 1)
      assert.equal(result.changes[0].field, 'status')
      assert.equal(result.changes[0].old, 'todo')
      assert.equal(result.changes[0].new, 'in-progress')

      const doc = await getDoc(server)
      assert.equal(doc.tasks[taskId].status, 'in-progress')
    })
  })

  it('updates priority field', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPatch(server, `/automerge/task/${taskId}`, {
        priority: 'p0',
        agent: 'gary',
      })

      const doc = await getDoc(server)
      assert.equal(doc.tasks[taskId].priority, 'p0')
    })
  })

  it('updates assignee field', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPatch(server, `/automerge/task/${taskId}`, {
        assignee: 'friday',
        agent: 'gary',
      })

      const doc = await getDoc(server)
      assert.equal(doc.tasks[taskId].assignee, 'friday')
    })
  })

  it('updates title field', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPatch(server, `/automerge/task/${taskId}`, {
        title: 'Updated title',
        agent: 'gary',
      })

      const doc = await getDoc(server)
      assert.equal(doc.tasks[taskId].title, 'Updated title')
    })
  })

  it('updates description field', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPatch(server, `/automerge/task/${taskId}`, {
        description: 'New description',
        agent: 'gary',
      })

      const doc = await getDoc(server)
      assert.equal(doc.tasks[taskId].description, 'New description')
    })
  })

  it('full status lifecycle: todo → in-progress → review → completed', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Lifecycle task' })

      const transitions = ['in-progress', 'review', 'completed']
      for (const status of transitions) {
        const result = await authedPatch(server, `/automerge/task/${taskId}`, {
          status,
          agent: 'gary',
        })
        assert.ok(result.success)
      }

      const doc = await getDoc(server)
      assert.equal(doc.tasks[taskId].status, 'completed')
    })
  })

  it('no-op update produces no changes', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'No-op test', status: 'todo' })

      const result = await authedPatch(server, `/automerge/task/${taskId}`, {
        status: 'todo', // same as current
        agent: 'gary',
      })

      assert.ok(result.success)
      assert.equal(result.changes.length, 0, 'No changes should be recorded')
    })
  })

  it('activity feed records task creation', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { agent: 'gary' })

      const doc = await getDoc(server)
      const creation = doc.activity.find(
        a => a.type === 'task_created' && a.taskId === taskId
      )

      assert.ok(creation, 'Should have task_created activity')
      assert.equal(creation.agent, 'gary')
      assert.ok(creation.timestamp)
    })
  })

  it('activity feed records task updates', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPatch(server, `/automerge/task/${taskId}`, {
        status: 'in-progress',
        agent: 'gary',
      })

      const doc = await getDoc(server)
      const update = doc.activity.find(
        a => a.type === 'task_updated' && a.taskId === taskId
      )

      assert.ok(update, 'Should have task_updated activity')
      assert.equal(update.agent, 'gary')
    })
  })

  it('task history tracks changes for patchwork diff', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPatch(server, `/automerge/task/${taskId}`, {
        status: 'in-progress',
        agent: 'gary',
      })

      await authedPatch(server, `/automerge/task/${taskId}`, {
        priority: 'p0',
        agent: 'friday',
      })

      const { history } = await authedGet(server, `/automerge/task/${taskId}/history`)
      assert.ok(history.length >= 2, `Expected at least 2 history entries, got ${history.length}`)
    })
  })

  it('multiple updates produce ordered activity entries', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPatch(server, `/automerge/task/${taskId}`, {
        status: 'in-progress',
        agent: 'agent-1',
      })
      await authedPatch(server, `/automerge/task/${taskId}`, {
        status: 'review',
        agent: 'agent-2',
      })

      const doc = await getDoc(server)
      const updates = doc.activity
        .filter(a => a.type === 'task_updated' && a.taskId === taskId)

      assert.equal(updates.length, 2)

      // Verify timestamps are increasing
      const t1 = new Date(updates[0].timestamp).getTime()
      const t2 = new Date(updates[1].timestamp).getTime()
      assert.ok(t1 <= t2, 'Activity entries should be in chronological order')
    })
  })
})
