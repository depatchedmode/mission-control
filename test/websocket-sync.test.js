#!/usr/bin/env node

/**
 * Fitness Test: WebSocket Real-Time Sync
 *
 * Validates the real-time sync claim — WebSocket clients
 * receive live updates when the document changes via HTTP.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import {
  withStartedServer,
  authedPost,
  authedPatch,
  getDoc,
  createTask,
  connectAuthenticatedWs,
  nextWsMessage,
} from '../support/resources.js'

describe('websocket sync', () => {
  it('client receives document-state on connect', async () => {
    await withStartedServer({}, async server => {
      const ws = await connectAuthenticatedWs(server)
      try {
        const msg = await nextWsMessage(ws)
        assert.equal(msg.type, 'document-state')
        assert.ok(msg.doc, 'Should include full document')
        assert.ok(msg.doc.tasks !== undefined, 'Doc should have tasks')
      } finally {
        ws.close()
        await once(ws, 'close')
      }
    })
  })

  it('client receives document-update after HTTP task creation', async () => {
    await withStartedServer({}, async server => {
      const ws = await connectAuthenticatedWs(server)
      try {
        // Consume initial document-state
        await nextWsMessage(ws)

        // Set up listener BEFORE the HTTP call so we don't miss the broadcast
        const updatePromise = nextWsMessage(ws, 3000)

        // Create a task via HTTP
        const taskId = await createTask(server, { title: 'WS notify test' })

        // WS client should receive the update
        const msg = await updatePromise
        assert.equal(msg.type, 'document-update')
        assert.ok(msg.doc.tasks[taskId], 'Update should contain the new task')
        assert.equal(msg.doc.tasks[taskId].title, 'WS notify test')
      } finally {
        ws.close()
        await once(ws, 'close')
      }
    })
  })

  it('client receives document-update after HTTP task update', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'Update me' })

      const ws = await connectAuthenticatedWs(server)
      try {
        // Consume initial state
        await nextWsMessage(ws)

        const updatePromise = nextWsMessage(ws, 3000)

        // Update via HTTP
        await authedPatch(server, `/automerge/task/${taskId}`, {
          status: 'in-progress',
          agent: 'gary',
        })

        const msg = await updatePromise
        assert.equal(msg.type, 'document-update')
        assert.equal(msg.doc.tasks[taskId].status, 'in-progress')
      } finally {
        ws.close()
        await once(ws, 'close')
      }
    })
  })

  it('client receives document-update after comment is added', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      const ws = await connectAuthenticatedWs(server)
      try {
        await nextWsMessage(ws)

        const updatePromise = nextWsMessage(ws, 3000)

        const { commentId } = await authedPost(server, '/automerge/comment', {
          taskId,
          text: 'Hello via HTTP',
          agent: 'gary',
        })

        const msg = await updatePromise
        assert.equal(msg.type, 'document-update')
        assert.ok(msg.doc.comments[commentId], 'Update should contain the new comment')
      } finally {
        ws.close()
        await once(ws, 'close')
      }
    })
  })

  it('multiple WS clients each receive the same broadcast', async () => {
    await withStartedServer({}, async server => {
      const ws1 = await connectAuthenticatedWs(server)
      const ws2 = await connectAuthenticatedWs(server)
      try {
        // Consume initial states
        await nextWsMessage(ws1)
        await nextWsMessage(ws2)

        // Set up listeners before mutation
        const p1 = nextWsMessage(ws1, 3000)
        const p2 = nextWsMessage(ws2, 3000)

        // Mutate via HTTP
        await createTask(server, { title: 'Broadcast test' })

        // Both clients should receive the update
        const [msg1, msg2] = await Promise.all([p1, p2])

        assert.equal(msg1.type, 'document-update')
        assert.equal(msg2.type, 'document-update')

        // Both should have the same document state
        const tasks1 = Object.keys(msg1.doc.tasks)
        const tasks2 = Object.keys(msg2.doc.tasks)
        assert.deepEqual(tasks1.sort(), tasks2.sort())
      } finally {
        ws1.close()
        ws2.close()
        await Promise.all([once(ws1, 'close'), once(ws2, 'close')])
      }
    })
  })

  it('WS task-update message applies correctly', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'WS update' })

      // Use two clients: one sends, the other observes the broadcast
      const sender = await connectAuthenticatedWs(server)
      const observer = await connectAuthenticatedWs(server)
      try {
        await nextWsMessage(sender)
        await nextWsMessage(observer)

        const updatePromise = nextWsMessage(observer, 3000)

        // Send task update via WebSocket
        sender.send(JSON.stringify({
          type: 'document-change',
          change: {
            type: 'task-update',
            taskId,
            updates: { status: 'completed' },
          },
          agent: 'ui-user',
        }))

        // Observer (non-sender) should receive the broadcast
        const msg = await updatePromise
        assert.equal(msg.type, 'document-update')
        assert.equal(msg.doc.tasks[taskId].status, 'completed')
      } finally {
        sender.close()
        observer.close()
        await Promise.all([once(sender, 'close'), once(observer, 'close')])
      }
    })
  })

  it('WS task-create message creates a task', async () => {
    await withStartedServer({}, async server => {
      const sender = await connectAuthenticatedWs(server)
      const observer = await connectAuthenticatedWs(server)
      try {
        await nextWsMessage(sender)
        await nextWsMessage(observer)

        const updatePromise = nextWsMessage(observer, 3000)

        const taskId = 'ws-created-' + Date.now()
        sender.send(JSON.stringify({
          type: 'document-change',
          change: {
            type: 'task-create',
            task: {
              id: taskId,
              title: 'Created via WS',
              status: 'todo',
              priority: 'p2',
            },
          },
          agent: 'ui-user',
        }))

        const msg = await updatePromise
        assert.equal(msg.type, 'document-update')
        assert.ok(msg.doc.tasks[taskId], 'Task created via WS should exist')
        assert.equal(msg.doc.tasks[taskId].title, 'Created via WS')
      } finally {
        sender.close()
        observer.close()
        await Promise.all([once(sender, 'close'), once(observer, 'close')])
      }
    })
  })

  it('WS comment-add message creates a comment', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      const ws = await connectAuthenticatedWs(server)
      try {
        await nextWsMessage(ws)

        ws.send(JSON.stringify({
          type: 'document-change',
          change: {
            type: 'comment-add',
            taskId,
            comment: {
              text: 'Comment via WS',
              agent: 'ui-user',
            },
          },
          agent: 'ui-user',
        }))

        // comment-add broadcasts to ALL clients (including sender)
        const msg = await nextWsMessage(ws)
        assert.equal(msg.type, 'document-update')

        const comments = Object.values(msg.doc.comments).filter(c => c.taskId === taskId)
        assert.ok(comments.length >= 1, 'Should have at least one comment')
        assert.equal(comments[0].content, 'Comment via WS')
      } finally {
        ws.close()
        await once(ws, 'close')
      }
    })
  })

  it('ping/pong keepalive works', async () => {
    await withStartedServer({}, async server => {
      const ws = await connectAuthenticatedWs(server)
      try {
        await nextWsMessage(ws) // consume initial state

        ws.send(JSON.stringify({ type: 'ping' }))

        const msg = await nextWsMessage(ws)
        assert.equal(msg.type, 'pong')
      } finally {
        ws.close()
        await once(ws, 'close')
      }
    })
  })
})
