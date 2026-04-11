#!/usr/bin/env node

/**
 * Fitness Test: Mention Lifecycle
 *
 * Validates the inter-agent communication claim —
 * @mentions in comments create trackable mention records
 * that can be queried, claimed, delivered, and retried.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import {
  cleanupTempDir,
  createServer,
  createTempDir,
  withStartedServer,
  authedPost,
  authedGet,
  authedDelete,
  getDoc,
  createTask,
} from '../support/resources.js'

function expectedIdempotencyKey(commentId, toAgent) {
  return createHash('sha256')
    .update(`${commentId}:${toAgent.toLowerCase()}`)
    .digest('hex')
}

async function getPendingMentions(server, agent) {
  const suffix = agent ? `?agent=${encodeURIComponent(agent)}` : ''
  const { mentions } = await authedGet(server, `/automerge/mentions/pending${suffix}`)
  return mentions
}

describe('mention lifecycle', () => {
  it('comment with @mention creates a pending mention record', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      const { commentId } = await authedPost(server, '/automerge/comment', {
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
      assert.equal(
        mentions[0].idempotency_key,
        expectedIdempotencyKey(commentId, 'bob')
      )
    })
  })

  it('delivering a claimed mention marks it as delivered', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob heads up',
        agent: 'alice',
      })

      const before = await getPendingMentions(server, 'bob')
      assert.equal(before.length, 1)

      const claim = await authedPost(server, `/automerge/mentions/${before[0].id}/claim`, {})
      assert.ok(claim.success)
      assert.equal(claim.claimed, true)
      assert.equal(typeof claim.claimToken, 'string')

      const deliver = await authedPost(server, `/automerge/mentions/${before[0].id}/deliver`, {
        claimToken: claim.claimToken,
      })
      assert.ok(deliver.success)
      assert.equal(deliver.delivered, true)

      const after = await getPendingMentions(server, 'bob')
      assert.equal(after.length, 0, 'No pending mentions after delivery')
    })
  })

  it('claim-next atomically claims one mention for a specific agent', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob first mention',
        agent: 'alice',
      })
      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob second mention',
        agent: 'charlie',
      })
      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@dave different agent mention',
        agent: 'erin',
      })

      const claim = await authedPost(server, '/automerge/mentions/claim-next', { agent: 'bob' })
      assert.ok(claim.success)
      assert.equal(claim.claimed, true)
      assert.equal(claim.mention.to_agent, 'bob')
      assert.equal(typeof claim.claimToken, 'string')
      assert.equal(typeof claim.claimExpiresAt, 'string')

      const bobPending = await getPendingMentions(server, 'bob')
      assert.equal(bobPending.length, 1, 'Exactly one bob mention should remain after claim-next')

      const davePending = await getPendingMentions(server, 'dave')
      assert.equal(davePending.length, 1, 'Claim-next should not affect other agents')
    })
  })

  it('claim-next returns an unclaimed shape when no work exists for an agent', async () => {
    await withStartedServer({}, async server => {
      const claim = await authedPost(server, '/automerge/mentions/claim-next', { agent: 'nobody' })
      assert.ok(claim.success)
      assert.equal(claim.claimed, false)
      assert.equal(claim.mention, null)
      assert.equal(claim.claimToken, null)
      assert.equal(claim.claimExpiresAt, null)
    })
  })

  it('claiming a mention hides it from pending results until the claim is released', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob review this before release',
        agent: 'alice',
      })

      const before = await getPendingMentions(server, 'bob')
      assert.equal(before.length, 1)

      const claim = await authedPost(server, `/automerge/mentions/${before[0].id}/claim`, {})
      assert.ok(claim.success)
      assert.equal(claim.claimed, true)
      assert.equal(typeof claim.claimToken, 'string')
      assert.equal(typeof claim.claimExpiresAt, 'string')

      const hidden = await getPendingMentions(server, 'bob')
      assert.equal(hidden.length, 0, 'Claimed mentions should not be re-polled')

      const secondClaim = await authedPost(
        server,
        `/automerge/mentions/${before[0].id}/claim`,
        {}
      )
      assert.ok(secondClaim.success)
      assert.equal(secondClaim.claimed, false)
      assert.equal(secondClaim.claimToken, null)

      const release = await authedPost(server, `/automerge/mentions/${before[0].id}/release`, {
        claimToken: claim.claimToken,
      })
      assert.ok(release.success)
      assert.equal(release.released, true)

      const afterRelease = await getPendingMentions(server, 'bob')
      assert.equal(afterRelease.length, 1, 'Released mentions should be pending again')
    })
  })

  it('claimed mentions become pending again after lease expiry', async () => {
    await withStartedServer({ mentionClaimTtlMs: 25 }, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob lease expiry test',
        agent: 'alice',
      })

      const mentions = await getPendingMentions(server, 'bob')
      const mentionId = mentions[0].id

      const claim = await authedPost(server, `/automerge/mentions/${mentionId}/claim`, {})
      assert.ok(claim.claimed)

      const hidden = await getPendingMentions(server, 'bob')
      assert.equal(hidden.length, 0)

      await delay(40)

      const afterExpiry = await getPendingMentions(server, 'bob')
      assert.equal(afterExpiry.length, 1)
      assert.equal(afterExpiry[0].id, mentionId)
    })
  })

  it('expired claim tokens cannot ack or release before a mention is reclaimed', async () => {
    await withStartedServer({ mentionClaimTtlMs: 20 }, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob expiry ownership test',
        agent: 'alice',
      })

      const mentions = await getPendingMentions(server, 'bob')
      const mentionId = mentions[0].id

      const claim = await authedPost(server, `/automerge/mentions/${mentionId}/claim`, {})
      assert.ok(claim.claimed)

      await delay(35)

      const staleDeliver = await authedPost(server, `/automerge/mentions/${mentionId}/deliver`, {
        claimToken: claim.claimToken,
      })
      assert.equal(staleDeliver.status, 409)
      assert.match(staleDeliver.error, /claim token mismatch/i)

      const staleRelease = await authedPost(server, `/automerge/mentions/${mentionId}/release`, {
        claimToken: claim.claimToken,
      })
      assert.equal(staleRelease.status, 409)
      assert.match(staleRelease.error, /claim token mismatch/i)

      const pendingAgain = await getPendingMentions(server, 'bob')
      assert.equal(pendingAgain.length, 1)
      assert.equal(pendingAgain[0].id, mentionId)

      const newClaim = await authedPost(server, `/automerge/mentions/${mentionId}/claim`, {})
      assert.ok(newClaim.claimed)
      assert.notEqual(newClaim.claimToken, claim.claimToken)
    })
  })

  it('active claims survive restart until they expire', async () => {
    const storagePath = createTempDir('mc-mention-restart-')
    let server = null

    try {
      server = createServer(storagePath, { usePersistedUrl: true, mentionClaimTtlMs: 400 })
      await server.start()

      const taskId = await createTask(server)
      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob recover this after restart',
        agent: 'alice',
      })

      const mentions = await getPendingMentions(server, 'bob')
      const mentionId = mentions[0].id

      const claim = await authedPost(server, `/automerge/mentions/${mentionId}/claim`, {})
      assert.ok(claim.claimed)

      await server.stop()
      await delay(25)

      server = createServer(storagePath, { usePersistedUrl: true, mentionClaimTtlMs: 400 })
      await server.start()

      const immediatelyAfterRestart = await getPendingMentions(server, 'bob')
      assert.equal(
        immediatelyAfterRestart.length,
        0,
        'Restart should not immediately requeue an active claim'
      )

      await delay(425)

      const afterExpiry = await getPendingMentions(server, 'bob')
      assert.equal(afterExpiry.length, 1)
      assert.equal(afterExpiry[0].id, mentionId)
    } finally {
      if (server) {
        await server.stop().catch(() => {})
        await delay(25)
      }
      cleanupTempDir(storagePath)
    }
  })

  it('stale claim tokens cannot release or deliver a renewed claim', async () => {
    await withStartedServer({ mentionClaimTtlMs: 20 }, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob stale token test',
        agent: 'alice',
      })

      const mentions = await getPendingMentions(server, 'bob')
      const mentionId = mentions[0].id

      const firstClaim = await authedPost(server, `/automerge/mentions/${mentionId}/claim`, {})
      assert.ok(firstClaim.claimed)

      await delay(35)

      const secondClaim = await authedPost(server, `/automerge/mentions/${mentionId}/claim`, {})
      assert.ok(secondClaim.claimed)
      assert.notEqual(secondClaim.claimToken, firstClaim.claimToken)

      const staleRelease = await authedPost(server, `/automerge/mentions/${mentionId}/release`, {
        claimToken: firstClaim.claimToken,
      })
      assert.equal(staleRelease.status, 409)
      assert.match(staleRelease.error, /claim token mismatch/i)

      const staleDeliver = await authedPost(server, `/automerge/mentions/${mentionId}/deliver`, {
        claimToken: firstClaim.claimToken,
      })
      assert.equal(staleDeliver.status, 409)
      assert.match(staleDeliver.error, /claim token mismatch/i)

      const deliver = await authedPost(server, `/automerge/mentions/${mentionId}/deliver`, {
        claimToken: secondClaim.claimToken,
      })
      assert.ok(deliver.success)
      assert.equal(deliver.delivered, true)
    })
  })

  it('multiple @mentions in one comment create separate records', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      const { commentId } = await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@alice @bob @charlie please review',
        agent: 'dave',
      })

      const doc = await getDoc(server)
      const mentions = Object.values(doc.mentions)
      assert.equal(mentions.length, 3, 'Should have 3 mention records')

      const recipients = mentions.map(m => m.to_agent).sort()
      assert.deepEqual(recipients, ['alice', 'bob', 'charlie'])

      for (const mention of mentions) {
        assert.equal(mention.from_agent, 'dave')
        assert.equal(mention.delivered, false)
        assert.equal(
          mention.idempotency_key,
          expectedIdempotencyKey(commentId, mention.to_agent)
        )
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

      const aliceMentions = await getPendingMentions(server, 'alice')
      assert.equal(aliceMentions.length, 1)
      assert.equal(aliceMentions[0].to_agent, 'alice')

      const bobMentions = await getPendingMentions(server, 'bob')
      assert.equal(bobMentions.length, 1)
      assert.equal(bobMentions[0].to_agent, 'bob')

      const unknownMentions = await getPendingMentions(server, 'nobody')
      assert.equal(unknownMentions.length, 0)
    })
  })

  it('pending mentions without agent filter returns all retryable mentions', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@alice @bob hello',
        agent: 'charlie',
      })

      const mentions = await getPendingMentions(server)
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

      const docBefore = await getDoc(server)
      const mentionsBefore = Object.values(docBefore.mentions)
      assert.equal(mentionsBefore.length, 2)

      const result = await authedDelete(server, `/automerge/comment/${commentId}`)
      assert.ok(result.success)
      assert.equal(result.mentionsDeleted, 2)

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

  it('mention delivery is harmless when repeated with the same claim token', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server)

      await authedPost(server, '/automerge/comment', {
        taskId,
        text: '@bob hello',
        agent: 'alice',
      })

      const mentions = await getPendingMentions(server, 'bob')
      const mentionId = mentions[0].id

      const claim = await authedPost(server, `/automerge/mentions/${mentionId}/claim`, {})
      assert.ok(claim.claimed)

      const first = await authedPost(server, `/automerge/mentions/${mentionId}/deliver`, {
        claimToken: claim.claimToken,
      })
      assert.ok(first.success)

      const second = await authedPost(server, `/automerge/mentions/${mentionId}/deliver`, {
        claimToken: claim.claimToken,
      })
      assert.ok(second.success, 'Double delivery should not crash')
      assert.equal(second.delivered, true)
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

      const mentions = await getPendingMentions(server, 'bob')
      assert.equal(mentions.length, 2, 'Bob should have 2 pending mentions')

      const taskIds = mentions.map(m => m.taskId).sort()
      assert.deepEqual(taskIds, [taskA, taskB].sort(), 'Mentions should span both tasks')
    })
  })
})
