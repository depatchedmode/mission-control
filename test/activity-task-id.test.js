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
    assert.ok(!('task_id' in evt), 'new events must not set task_id')
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

  it('getTimeline filters by task using legacy task_id on stored events', async () => {
    const filtered = await store.getTimeline({ task: 'legacy-task' })
    assert.ok(
      filtered.some(e => e.id === 'old-event'),
      'getTimeline should match getActivity for legacy task_id rows'
    )
  })
})

describe('AutomergeStore activity writers (branch / merge / update)', () => {
  let store

  before(async () => {
    store = new AutomergeStore({
      storagePath: '/tmp/mc-activity-writers-test-' + Date.now(),
      usePersistedUrl: false
    })
    await store.init()
    await store.docHandle.change(doc => {
      if (!doc.tasks) doc.tasks = {}
      const ts = new Date().toISOString()
      doc.tasks['parent-task'] = {
        id: 'parent-task',
        title: 'Parent',
        description: '',
        status: 'todo',
        assignee: null,
        type: 'task',
        priority: 'p2',
        created_at: ts,
        updated_at: ts
      }
    })
  })

  after(async () => {
    if (store) await store.close()
  })

  it('createBranch logs task_branched with taskId only', async () => {
    const branchId = await store.createBranch('parent-task', 'exp-branch', 'alice')
    assert.ok(branchId)
    const doc = store.getDoc()
    const evt = (doc.activity || []).find(
      a => a.type === 'task_branched' && a.branch_id === branchId
    )
    assert.ok(evt, 'task_branched activity exists')
    assert.strictEqual(evt.taskId, 'parent-task')
    assert.ok(!('task_id' in evt))
  })

  it('mergeBranch logs task_merged with taskId only', async () => {
    const doc = store.getDoc()
    const branchId = Object.keys(doc.tasks).find(
      id => doc.tasks[id].branch_of === 'parent-task' && !doc.tasks[id].merged
    )
    assert.ok(branchId, 'unmerged branch exists')
    const result = await store.mergeBranch(branchId, 'bob')
    assert.strictEqual(result.success, true)
    const doc2 = store.getDoc()
    const evt = (doc2.activity || []).find(
      a => a.type === 'task_merged' && a.branch_id === branchId
    )
    assert.ok(evt, 'task_merged activity exists')
    assert.strictEqual(evt.taskId, 'parent-task')
    assert.ok(!('task_id' in evt))
  })

  it('updateTask logs task_updated with taskId only', async () => {
    await store.docHandle.change(doc => {
      const ts = new Date().toISOString()
      doc.tasks['upd-task'] = {
        id: 'upd-task',
        title: 'To update',
        description: '',
        status: 'todo',
        assignee: null,
        type: 'task',
        priority: 'p2',
        created_at: ts,
        updated_at: ts
      }
    })
    await store.updateTask('upd-task', { status: 'in-progress' }, 'carol')
    const doc = store.getDoc()
    const evts = (doc.activity || []).filter(
      a => a.type === 'task_updated' && activityTaskId(a) === 'upd-task'
    )
    const evt = evts[evts.length - 1]
    assert.ok(evt, 'task_updated activity exists')
    assert.strictEqual(evt.taskId, 'upd-task')
    assert.ok(!('task_id' in evt))
  })
})
