#!/usr/bin/env node

/**
 * Fitness Test: Mention Lifecycle
 *
 * Validates the inter-agent communication claim —
 * @mentions in comments create trackable mention records
 * that can be queried, delivered, and cleaned up.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  withStartedServer,
  authedPost,
  authedGet,
  authedDelete,
  authedPatch,
  getDoc,
  createTask,
} from '../support/resources.js'

describe('mention lifecycle', () => {
  it('comment with @mention creates a pending mention record', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob please review this',
        agent: 'alice',
      })

      const { mentions } = await authedGet(server, '/automerge/mentions/pending?agent=bob')
      assert.equal(mentions.length, 1)
      assert.equal(mentions[0].to_agent, 'bob')
      assert.equal(mentions[0].from_agent, 'alice')
      assert.equal(mentions[0].delivered, false)
      assert.equal(mentions[0].taskId, taskId)
    })
  })

  it('delivering a mention marks it as delivered', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob heads up',
        agent: 'alice',
      })

      const { mentions: before } = await authedGet(
        server,
        '/automerge/mentions/pending?agent=bob'
      )
      assert.equal(before.length, 1)

      await authedPost(server, `/automerge/mentions/${before[0].id}/deliver`, {})

      const { mentions: after } = await authedGet(
        server,
        '/automerge/mentions/pending?agent=bob'
      )
      assert.equal(after.length, 0, 'No pending mentions after delivery')
    })
  })

  it('multiple @mentions in one comment create separate records', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@alice @bob @charlie please review',
        agent: 'dave',
      })

      const doc = await getDoc(server)
      const mentions = Object.values(doc.mentions)
      assert.equal(mentions.length, 3, 'Should have 3 mention records')

      const recipients = mentions.map(m => m.to_agent).sort()
      assert.deepEqual(recipients, ['alice', 'bob', 'charlie'])

      // Each should be from dave
      for (const mention of mentions) {
        assert.equal(mention.from_agent, 'dave')
        assert.equal(mention.delivered, false)
      }
    })
  })

  it('pending mentions are filtered by agent', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@alice @bob check this',
        agent: 'charlie',
      })

      const { mentions: aliceMentions } = await authedGet(
        server,
        '/automerge/mentions/pending?agent=alice'
      )
      assert.equal(aliceMentions.length, 1)
      assert.equal(aliceMentions[0].to_agent, 'alice')

      const { mentions: bobMentions } = await authedGet(
        server,
        '/automerge/mentions/pending?agent=bob'
      )
      assert.equal(bobMentions.length, 1)
      assert.equal(bobMentions[0].to_agent, 'bob')

      const { mentions: unknownMentions } = await authedGet(
        server,
        '/automerge/mentions/pending?agent=nobody'
      )
      assert.equal(unknownMentions.length, 0)
    })
  })

  it('pending mentions without agent filter returns all undelivered', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@alice @bob hello',
        agent: 'charlie',
      })

      const { mentions } = await authedGet(server, '/automerge/mentions/pending')
      assert.equal(mentions.length, 2, 'Should return all pending mentions')
    })
  })

  it('deleting a comment removes its associated mentions', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      const { commentId } = await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob @charlie review',
        agent: 'alice',
      })

      // Verify mentions exist
      const docBefore = await getDoc(server)
      const mentionsBefore = Object.values(docBefore.mentions)
      assert.equal(mentionsBefore.length, 2)

      // Delete the comment
      const result = await authedDelete(server, `/automerge/comment/${commentId}`)
      assert.ok(result.success)
      assert.equal(result.mentionsDeleted, 2)

      // Verify mentions are gone
      const docAfter = await getDoc(server)
      const mentionsAfter = Object.values(docAfter.mentions)
      assert.equal(mentionsAfter.length, 0, 'Mentions should be deleted with comment')
    })
  })

  it('duplicate @mention in same comment is deduplicated', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob @bob @bob hello',
        agent: 'alice',
      })

      const doc = await getDoc(server)
      const mentions = Object.values(doc.mentions).filter(m => m.to_agent === 'bob')
      assert.equal(mentions.length, 1, 'Duplicate @mention should be deduplicated')
    })
  })

  it('mention delivery is idempotent or harmless when repeated', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob hello',
        agent: 'alice',
      })

      const { mentions } = await authedGet(server, '/automerge/mentions/pending?agent=bob')
      const mentionId = mentions[0].id

      // Deliver once
      const first = await authedPost(server, `/automerge/mentions/${mentionId}/deliver`, {})
      assert.ok(first.success)

      // Deliver again — should not crash
      const second = await authedPost(server, `/automerge/mentions/${mentionId}/deliver`, {})
      assert.ok(second.success, 'Double delivery should not crash')
    })
  })

  it('comments across multiple tasks generate separate mention pools', async () => {
    await withStartedServer({}, async server => {
      const taskA = await createTask(server, { title: 'Task A' })
      const taskB = await createTask(server, { title: 'Task B' })

      await authedPost(server, '/automerge/comment', {
        taskId: taskA,
        text: '@bob review task A',
        agent: 'alice',
      })

      await authedPost(server, '/automerge/comment', {
        taskId: taskB,
        text: '@bob review task B',
        agent: 'charlie',
      })

      const { mentions } = await authedGet(server, '/automerge/mentions/pending?agent=bob')
      assert.equal(mentions.length, 2, 'Bob should have 2 pending mentions')

      const taskIds = mentions.map(m => m.taskId).sort()
      assert.deepEqual(taskIds, [taskA, taskB].sort(), 'Mentions should span both tasks')
    })
  })
})
