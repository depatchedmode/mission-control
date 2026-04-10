#!/usr/bin/env node
import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'

import { AutomergeStore } from '../lib/automerge-store.js'
import { taskRecordTaskId } from '../lib/task-record-task-id.js'
import { cleanupTempDir, createTempDir, noopLogger } from '../support/resources.js'

function expectedIdempotencyKey(commentId, toAgent) {
  return createHash('sha256')
    .update(`${commentId}:${toAgent.toLowerCase()}`)
    .digest('hex')
}

describe('taskRecordTaskId', () => {
  it('prefers taskId when both are present', () => {
    assert.equal(taskRecordTaskId({ taskId: 'new', task_id: 'legacy' }), 'new')
  })

  it('falls back to task_id for legacy records', () => {
    assert.equal(taskRecordTaskId({ task_id: 'legacy' }), 'legacy')
  })

  it('returns undefined for missing or invalid records', () => {
    assert.equal(taskRecordTaskId(null), undefined)
    assert.equal(taskRecordTaskId(undefined), undefined)
    assert.equal(taskRecordTaskId({}), undefined)
  })
})

describe('AutomergeStore comment and mention task field normalization', () => {
  let store
  let storagePath

  before(async () => {
    storagePath = createTempDir('mc-task-record-taskid-test-')
    store = new AutomergeStore({
      storagePath,
      usePersistedUrl: false,
      logger: noopLogger,
    })
    await store.init()
    await store.docHandle.change(doc => {
      if (!doc.tasks) doc.tasks = {}
      doc.tasks['task-1'] = {
        id: 'task-1',
        title: 'Task 1',
        status: 'todo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
  })

  after(async () => {
    try {
      if (store) await store.close()
      await delay(25)
    } finally {
      cleanupTempDir(storagePath)
    }
  })

  it('writes new comment and mention records with taskId only', async () => {
    await store.addComment('task-1', 'hello @reviewer', 'agent')

    const rawDoc = store.docHandle.doc()
    const comment = Object.values(rawDoc.comments || {}).find(c => c.content === 'hello @reviewer')
    const mention = Object.values(rawDoc.mentions || {}).find(m => m.to_agent === 'reviewer')

    assert.ok(comment, 'comment exists')
    assert.equal(comment.taskId, 'task-1')
    assert.ok(!('task_id' in comment))

    assert.ok(mention, 'mention exists')
    assert.equal(mention.taskId, 'task-1')
    assert.ok(!('task_id' in mention))
    assert.equal(
      mention.idempotency_key,
      expectedIdempotencyKey(comment.id, mention.to_agent)
    )
  })

  it('normalizes legacy task_id comment and mention records on read', async () => {
    await store.docHandle.change(doc => {
      doc.comments['legacy-comment'] = {
        id: 'legacy-comment',
        task_id: 'task-1',
        agent: 'legacy-agent',
        content: 'legacy comment',
        mentions: [],
        timestamp: new Date().toISOString()
      }
      doc.mentions['legacy-mention'] = {
        id: 'legacy-mention',
        comment_id: 'legacy-comment',
        task_id: 'task-1',
        from_agent: 'legacy-agent',
        to_agent: 'legacy-reviewer',
        content: 'legacy comment',
        delivered: false,
        timestamp: new Date().toISOString()
      }
    })

    const comments = await store.getComments('task-1')
    const legacyComment = comments.find(comment => comment.id === 'legacy-comment')
    assert.ok(legacyComment, 'legacy comment is returned')
    assert.equal(legacyComment.taskId, 'task-1')
    assert.ok(!('task_id' in legacyComment))

    const mentions = await store.getPendingMentions('legacy-reviewer')
    const legacyMention = mentions.find(mention => mention.id === 'legacy-mention')
    assert.ok(legacyMention, 'legacy mention is returned')
    assert.equal(legacyMention.taskId, 'task-1')
    assert.ok(!('task_id' in legacyMention))

    const doc = store.getDoc()
    assert.equal(doc.comments['legacy-comment'].taskId, 'task-1')
    assert.ok(!('task_id' in doc.comments['legacy-comment']))
    assert.equal(doc.mentions['legacy-mention'].taskId, 'task-1')
    assert.ok(!('task_id' in doc.mentions['legacy-mention']))
    assert.equal(
      doc.mentions['legacy-mention'].idempotency_key,
      expectedIdempotencyKey('legacy-comment', 'legacy-reviewer')
    )

    const rawDoc = store.docHandle.doc()
    assert.equal(rawDoc.comments['legacy-comment'].task_id, 'task-1')
    assert.equal(rawDoc.mentions['legacy-mention'].task_id, 'task-1')
    assert.ok(!('idempotency_key' in rawDoc.mentions['legacy-mention']))
  })

  it('synthesizes idempotency keys for legacy mentions on read without mutating storage', async () => {
    await store.docHandle.change(doc => {
      doc.mentions['legacy-mention-no-key'] = {
        id: 'legacy-mention-no-key',
        comment_id: 'legacy-comment-no-key',
        task_id: 'task-1',
        from_agent: 'legacy-agent',
        to_agent: 'legacy-reviewer-no-key',
        content: 'legacy comment without key',
        delivered: false,
        timestamp: new Date().toISOString()
      }
    })

    const expectedKey = expectedIdempotencyKey(
      'legacy-comment-no-key',
      'legacy-reviewer-no-key'
    )
    const mentions = await store.getPendingMentions('legacy-reviewer-no-key')
    const legacyMention = mentions.find(mention => mention.id === 'legacy-mention-no-key')

    assert.ok(legacyMention, 'legacy mention is returned')
    assert.equal(legacyMention.idempotency_key, expectedKey)

    const doc = store.getDoc()
    assert.equal(doc.mentions['legacy-mention-no-key'].idempotency_key, expectedKey)

    const rawDoc = store.docHandle.doc()
    assert.ok(!('idempotency_key' in rawDoc.mentions['legacy-mention-no-key']))
  })
})
