#!/usr/bin/env node

/**
 * Fitness Test: Concurrent Writes
 *
 * Validates the core multi-agent CRDT positioning claim —
 * multiple agents writing to the same document simultaneously
 * should produce a coherent, complete result.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  withStartedServer,
  authedPost,
  authedPatch,
  getDoc,
  createTask,
} from '../support/resources.js'

describe('concurrent writes', () => {
  it('two agents update different fields on the same task concurrently', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Shared task' })

      // Agent A sets status, Agent B sets assignee — simultaneously
      await Promise.all([
        authedPatch(server, `/automerge/task/${taskId}`, {
          status: 'in-progress',
          agent: 'agent-a',
        }),
        authedPatch(server, `/automerge/task/${taskId}`, {
          assignee: 'agent-b',
          agent: 'agent-b',
        }),
      ])

      const doc = await getDoc(server)
      const task = doc.tasks[taskId]

      assert.equal(task.status, 'in-progress', 'Agent A status change should be preserved')
      assert.equal(task.assignee, 'agent-b', 'Agent B assignee change should be preserved')
    })
  })

  it('two agents update the same field concurrently without crashing', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Contested task' })

      // Both agents set status to different values simultaneously
      const [resultA, resultB] = await Promise.all([
        authedPatch(server, `/automerge/task/${taskId}`, {
          status: 'in-progress',
          agent: 'agent-a',
        }),
        authedPatch(server, `/automerge/task/${taskId}`, {
          status: 'review',
          agent: 'agent-b',
        }),
      ])

      // Both requests should succeed (no crashes, no 500s)
      assert.ok(resultA.success, 'Agent A request should succeed')
      assert.ok(resultB.success, 'Agent B request should succeed')

      // Document should converge to a deterministic state
      const doc = await getDoc(server)
      const task = doc.tasks[taskId]
      assert.ok(
        task.status === 'in-progress' || task.status === 'review',
        `Status should be one of the two values, got: ${task.status}`
      )
    })
  })

  it('two agents add comments to the same task concurrently', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Discussed task' })

      await Promise.all([
        authedPost(server, '/automerge/comment', {
          taskId,
          text: 'Comment from agent A',
          agent: 'agent-a',
        }),
        authedPost(server, '/automerge/comment', {
          taskId,
          text: 'Comment from agent B',
          agent: 'agent-b',
        }),
      ])

      const doc = await getDoc(server)
      const comments = Object.values(doc.comments).filter(c => c.taskId === taskId)

      assert.equal(comments.length, 2, 'Both comments should be present')

      const agents = comments.map(c => c.agent).sort()
      assert.deepEqual(agents, ['agent-a', 'agent-b'])
    })
  })

  it('rapid sequential updates from multiple agents are all reflected', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Rapid fire task' })

      // 10 status updates in quick succession from alternating agents
      const updates = Array.from({ length: 10 }, (_, i) => {
        const agent = i % 2 === 0 ? 'agent-a' : 'agent-b'
        const priority = `p${i % 4}`
        return authedPatch(server, `/automerge/task/${taskId}`, {
          priority,
          agent,
        })
      })

      const results = await Promise.all(updates)

      // All requests should succeed
      for (const result of results) {
        assert.ok(result.success, 'Each update should succeed')
      }

      // Document should be in a valid state
      const doc = await getDoc(server)
      const task = doc.tasks[taskId]
      assert.ok(task, 'Task should still exist')
      assert.match(task.priority, /^p[0-3]$/, 'Priority should be valid')
    })
  })

  it('concurrent task creation produces distinct tasks', async () => {
    await withStartedServer({}, async server => {
      const results = await Promise.all([
        authedPost(server, '/automerge/task', {
          title: 'Task from agent A',
          agent: 'agent-a',
        }),
        authedPost(server, '/automerge/task', {
          title: 'Task from agent B',
          agent: 'agent-b',
        }),
      ])

      assert.ok(results[0].success)
      assert.ok(results[1].success)
      assert.notEqual(results[0].taskId, results[1].taskId, 'Task IDs should be distinct')

      const doc = await getDoc(server)
      assert.ok(doc.tasks[results[0].taskId], 'Agent A task should exist')
      assert.ok(doc.tasks[results[1].taskId], 'Agent B task should exist')
    })
  })

  it('activity feed contains entries from all concurrent operations', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Activity test' })

      await Promise.all([
        authedPatch(server, `/automerge/task/${taskId}`, {
          status: 'in-progress',
          agent: 'agent-a',
        }),
        authedPost(server, '/automerge/comment', {
          taskId,
          text: 'Concurrent comment',
          agent: 'agent-b',
        }),
      ])

      const doc = await getDoc(server)
      const taskActivity = doc.activity.filter(a => a.taskId === taskId)

      // Should have: task_created + task_updated + comment_added = at least 3
      assert.ok(
        taskActivity.length >= 3,
        `Expected at least 3 activity entries, got ${taskActivity.length}`
      )

      const types = taskActivity.map(a => a.type)
      assert.ok(types.includes('task_created'), 'Should have task_created')
      assert.ok(types.includes('task_updated'), 'Should have task_updated')
      assert.ok(types.includes('comment_added'), 'Should have comment_added')
    })
  })

  it('high-volume concurrent comments from many agents', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'High volume task' })

      // 5 agents each post a comment concurrently
      const commentPromises = Array.from({ length: 5 }, (_, i) =>
        authedPost(server, '/automerge/comment', {
          taskId,
          text: `Message from agent-${i}`,
          agent: `agent-${i}`,
        })
      )

      const results = await Promise.all(commentPromises)
      for (const result of results) {
        assert.ok(result.success, 'Each comment should succeed')
      }

      const doc = await getDoc(server)
      const comments = Object.values(doc.comments).filter(c => c.taskId === taskId)
      assert.equal(comments.length, 5, 'All 5 comments should be present')
    })
  })
})
