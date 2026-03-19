#!/usr/bin/env node
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import { activityTaskId } from '../lib/activity-task-id.js'
import { AutomergeStore } from '../lib/automerge-store.js'

describe('activityTaskId', () => {
  it('prefers taskId when both are present', () => {
    assert.strictEqual(activityTaskId({ taskId: 'a', task_id: 'b' }), 'a')
  })

  it('falls back to task_id for legacy documents', () => {
    assert.strictEqual(activityTaskId({ task_id: 'legacy' }), 'legacy')
  })

  it('returns undefined for missing or invalid entries', () => {
    assert.strictEqual(activityTaskId(null), undefined)
    assert.strictEqual(activityTaskId(undefined), undefined)
    assert.strictEqual(activityTaskId({}), undefined)
  })
})

describe('AutomergeStore activity task field', () => {
  let store

  before(async () => {
    store = new AutomergeStore({
      storagePath: '/tmp/mc-activity-taskid-test-' + Date.now(),
      usePersistedUrl: false
    })
    await store.init()
    await store.docHandle.change(doc => {
      if (!doc.tasks) doc.tasks = {}
      doc.tasks['legacy-task'] = {
        id: 'legacy-task',
        title: 'Legacy',
        status: 'todo',
        created_at: new Date().toISOString()
      }
    })
  })

  after(async () => {
    if (store) await store.close()
  })

  it('writes comment_added activity with taskId only', async () => {
    await store.addComment('legacy-task', 'hello', 'agent')
    const doc = store.getDoc()
    const evt = (doc.activity || []).find(a => a.type === 'comment_added')
    assert.ok(evt, 'activity event exists')
    assert.strictEqual(evt.taskId, 'legacy-task')
    assert.strictEqual(evt.task_id, undefined)
  })

  it('getActivity filters by task using legacy task_id on stored events', async () => {
    await store.docHandle.change(doc => {
      doc.activity.push({
        id: 'old-event',
        type: 'task_updated',
        task_id: 'legacy-task',
        agent: 'bot',
        timestamp: new Date().toISOString()
      })
    })
    const filtered = await store.getActivity({ task: 'legacy-task' })
    assert.ok(
      filtered.some(e => e.id === 'old-event'),
      'legacy task_id entry should match filter'
    )
  })
})
