#!/usr/bin/env node

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildMentionMessage,
  processPendingMentions,
} from '../daemon/mention-processor.js'

describe('processPendingMentions', () => {
  it('wakes a registered agent and marks the mention delivered on success', async () => {
    const wakeCalls = []
    const delivered = []
    const mention = {
      id: 'mention-1',
      from_agent: 'alice',
      to_agent: 'bob',
      taskId: 'task-123',
      content: '@bob please review this change',
    }

    const processed = await processPendingMentions({
      pendingMentions: [mention],
      doc: { agents: { bob: { name: 'bob' } } },
      wakeAgent: async (agentId, message) => {
        wakeCalls.push({ agentId, message })
        return true
      },
      markDelivered: async mentionId => {
        delivered.push(mentionId)
      },
    })

    assert.equal(processed, 1)
    assert.deepEqual(wakeCalls, [
      {
        agentId: 'bob',
        message: buildMentionMessage(mention),
      },
    ])
    assert.deepEqual(delivered, ['mention-1'])
  })

  it('skips mentions for agents that are not registered', async () => {
    const wakeCalls = []
    const delivered = []

    const processed = await processPendingMentions({
      pendingMentions: [
        {
          id: 'mention-2',
          from_agent: 'alice',
          to_agent: 'bob',
          taskId: 'task-456',
          content: '@bob ping',
        },
      ],
      doc: { agents: {} },
      wakeAgent: async (agentId, message) => {
        wakeCalls.push({ agentId, message })
        return true
      },
      markDelivered: async mentionId => {
        delivered.push(mentionId)
      },
    })

    assert.equal(processed, 0)
    assert.deepEqual(wakeCalls, [])
    assert.deepEqual(delivered, [])
  })

  it('does not mark a mention delivered when the wake attempt fails', async () => {
    const delivered = []

    const processed = await processPendingMentions({
      pendingMentions: [
        {
          id: 'mention-3',
          from_agent: 'alice',
          to_agent: 'bob',
          taskId: 'task-789',
          content: '@bob heads up',
        },
      ],
      doc: { agents: { bob: { name: 'bob' } } },
      wakeAgent: async () => false,
      markDelivered: async mentionId => {
        delivered.push(mentionId)
      },
    })

    assert.equal(processed, 0)
    assert.deepEqual(delivered, [])
  })
})
