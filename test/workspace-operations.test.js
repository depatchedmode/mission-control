import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import fs, { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { save } from '@automerge/automerge'
import { DurableRepo } from '../lib/durable-repo.js'
import { NodeFSStorageAdapter } from '../lib/nodefs-storage-adapter.js'
import { Workspace, createWorkspaceData } from '../lib/workspace.js'

const actors = [
  { id: 'alice', handle: 'alice', kind: 'human' },
  { id: 'bob', handle: 'bob', kind: 'human' },
  { id: 'builder', handle: 'builder', kind: 'agent' },
  { id: 'reviewer', handle: 'reviewer', kind: 'agent' },
]

async function withWorkspaces(run) {
  const resources = []
  const create = async (source, storageOptions) => {
    const directory = await mkdtemp(join(tmpdir(), 'pardner-commands-'))
    const repo = new DurableRepo({ storage: new NodeFSStorageAdapter(directory, storageOptions) })
    const handle = source ? repo.import(save(source.handle.doc())) : repo.create(createWorkspaceData({ actors }))
    const workspace = new Workspace({ repo, handle, replicaId: `replica-${resources.length}` })
    resources.push({ directory, repo })
    return workspace
  }
  try { await run(await create(), create) } finally {
    for (const { repo, directory } of resources) {
      await repo.shutdown()
      await rm(directory, { recursive: true, force: true })
    }
  }
}

function command(workspace, type, payload, actorId = 'alice', operationId = randomUUID()) {
  return workspace.execute({ operationId, type, actorId, payload })
}

async function createTask(workspace, fields = {}) {
  return (await command(workspace, 'task.create', { title: 'Shared work', ...fields })).result.taskId
}

function updatePayload(workspace, taskId, updates) {
  const { revisions } = workspace.taskContext(taskId)
  return { taskId, updates, expectedRevisions: Object.fromEntries(Object.keys(updates).map(field => [field, revisions[field]])) }
}

describe('shared workspace operations', () => {
  it('keeps a comment unread while any concurrent revision remains unseen', async () => {
    await withWorkspaces(async (workspace, create) => {
      const taskId = await createTask(workspace)
      const original = await command(workspace, 'comment.add', { taskId, text: 'Original' })
      const commentId = original.result.commentId
      const peer = await create(workspace)
      const first = await command(workspace, 'comment.edit', { commentId, text: 'Human revision', expectedRevisions: [original.operationId] })
      const second = await command(peer, 'comment.edit', { commentId, text: 'Agent revision', expectedRevisions: [original.operationId] }, 'builder')
      workspace.handle.merge(peer.handle)
      await command(workspace, 'read.mark', { taskId, comments: [{ commentId, revisionId: first.operationId }] })
      assert.equal(workspace.taskContext(taskId, 'alice').unreadCount, 1)
      await command(workspace, 'read.mark', { taskId, comments: [{ commentId, revisionId: second.operationId }] })
      assert.equal(workspace.taskContext(taskId, 'alice').unreadCount, 0)
      assert.equal(workspace.taskContext(taskId, 'builder').unreadCount, 1)
    })
  })
  it('rejects old schemas and supports explicit first-Actor registration', async () => {
    await withWorkspaces(async workspace => {
      const old = workspace.repo.create({ tasks: {} })
      assert.throws(() => new Workspace({ repo: workspace.repo, handle: old, replicaId: 'old' }), { code: 'INCOMPATIBLE_SCHEMA' })
      const handle = workspace.repo.create(createWorkspaceData())
      const fresh = new Workspace({ repo: workspace.repo, handle, replicaId: 'fresh' })
      await command(fresh, 'actor.register', { id: 'alice', handle: 'Alice', kind: 'human' })
      await command(fresh, 'actor.register', { id: 'builder', handle: 'builder', kind: 'agent' })
      assert.equal(fresh.snapshot().actors.alice.handle, 'alice')
      await assert.rejects(command(fresh, 'actor.register', { id: 'another', handle: 'alice', kind: 'agent' }), { code: 'ALREADY_EXISTS' })
    })
  })

  it('does not acknowledge a storage failure and retries the same logical operation', async () => {
    await withWorkspaces(async (_workspace, create) => {
      let fail = false
      const workspace = await create(null, { io: { ...fs, rename: async (...args) => {
        if (fail) throw Object.assign(new Error('disk full'), { code: 'ENOSPC' })
        return fs.rename(...args)
      } } })
      await workspace.repo.flush()
      const id = randomUUID()
      fail = true
      try {
        await assert.rejects(command(workspace, 'task.create', { title: 'Do not lose this' }, 'alice', id), { code: 'STORAGE_FAILED' })
      } finally { fail = false }
      const receipt = await command(workspace, 'task.create', { title: 'Do not lose this' }, 'alice', id)
      assert.equal(receipt.replayed, true)
      assert.equal(receipt.savedLocally, true)
      assert.equal(Object.keys(workspace.snapshot().tasks).length, 1)
      assert.equal(Object.keys(workspace.handle.doc().operations).length, 1)
    })
  })

  it('atomically hands work to another Actor and safely replays a lost response', async () => {
    await withWorkspaces(async workspace => {
      const taskId = await createTask(workspace)
      const operationId = randomUUID()
      const payload = {
        ...updatePayload(workspace, taskId, { assignee: 'builder', status: 'in-progress' }),
        to: 'builder', status: 'in-progress', message: '@builder implement the request',
      }
      delete payload.updates
      const first = await command(workspace, 'task.handoff', payload, 'alice', operationId)
      const replay = await command(workspace, 'task.handoff', payload, 'alice', operationId)
      assert.equal(first.savedLocally, true)
      assert.equal(first.actorId, 'alice')
      assert.equal(first.replicaId, 'replica-0')
      assert.equal(replay.replayed, true)
      assert.deepEqual(replay.result, first.result)
      const context = workspace.taskContext(taskId, 'builder')
      assert.equal(context.task.assignee, 'builder')
      assert.equal(context.task.status, 'in-progress')
      assert.equal(context.comments.length, 1)
      assert.equal(context.mentions.length, 1)
      assert.equal(context.mentions[0].toActorId, 'builder')
      assert.equal(context.history.filter(event => event.operationId === operationId).length, 1)
      assert.equal(Object.keys(workspace.handle.doc().operations).length, 2)
      await assert.rejects(command(workspace, 'task.handoff', { ...payload, message: 'different' }, 'alice', operationId), { code: 'OPERATION_ID_REUSED' })
    })
  })

  it('returns complete task context and keeps read receipts separate by Actor and revision', async () => {
    await withWorkspaces(async workspace => {
      const description = 'A complete request with context. '.repeat(100)
      const taskId = await createTask(workspace, { description })
      for (let index = 0; index < 6; index++) {
        await command(workspace, 'comment.add', { taskId, text: `Full comment ${index} ${'x'.repeat(600)}` }, 'builder')
      }
      const before = workspace.taskContext(taskId, 'alice')
      assert.equal(before.task.description, description)
      assert.equal(before.comments.length, 6)
      assert.ok(before.comments.every(comment => comment.content.length > 600))
      assert.equal(before.unreadCount, 6)
      await command(workspace, 'read.mark', { taskId, comments: before.comments.map(comment => ({ commentId: comment.id, revisionId: comment.revisionId })) })
      assert.equal(workspace.taskContext(taskId, 'alice').unreadCount, 0)
      assert.equal(workspace.taskContext(taskId, 'bob').unreadCount, 6)
      const comment = before.comments[0]
      await command(workspace, 'comment.edit', { commentId: comment.id, text: 'Updated explanation', expectedRevisions: [comment.revisionId] }, 'builder')
      assert.equal(workspace.taskContext(taskId, 'alice').unreadCount, 1)
    })
  })

  it('validates before mutation and rejects stale writes instead of dropping intervening work', async () => {
    await withWorkspaces(async workspace => {
      await assert.rejects(command(workspace, 'task.create', { title: 'Bad' }, 'unknown'), { code: 'UNKNOWN_ACTOR' })
      await assert.rejects(command(workspace, 'task.create', { title: 'Bad', status: 'vanished' }), { code: 'INVALID_ARGUMENT' })
      assert.equal(Object.keys(workspace.handle.doc().operations).length, 0)
      const taskId = await createTask(workspace, { status: 'todo' })
      assert.equal(workspace.taskContext(taskId).task.status, 'backlog')
      const stale = updatePayload(workspace, taskId, { status: 'completed' })
      await command(workspace, 'task.update', updatePayload(workspace, taskId, { status: 'in-review' }), 'builder')
      assert.equal(workspace.taskContext(taskId).task.status, 'review')
      await assert.rejects(command(workspace, 'task.update', stale), { code: 'STALE_UPDATE' })
      await assert.rejects(command(workspace, 'task.update', { taskId, updates: { status: 'completed' } }), { code: 'REVISION_REQUIRED' })
      assert.equal(workspace.taskContext(taskId).task.status, 'review')
      assert.equal(workspace.taskContext(taskId).history.length, 2)
      const before = workspace.handle.heads()
      const context = workspace.taskContext(taskId)
      await assert.rejects(command(workspace, 'task.handoff', {
        taskId, to: 'builder', status: 'in-progress', message: '', expectedRevisions: context.revisions,
      }), { code: 'INVALID_ARGUMENT' })
      assert.deepEqual(workspace.handle.heads(), before, 'an invalid explanation cannot partially change responsibility')
    })
  })

  it('preserves attributed concurrent alternatives and requires explicit resolution', async () => {
    await withWorkspaces(async (left, create) => {
      const taskId = await createTask(left)
      const right = await create(left)
      await command(left, 'task.update', updatePayload(left, taskId, { status: 'review' }), 'builder', 'left-edit')
      await command(right, 'task.update', updatePayload(right, taskId, { status: 'completed' }), 'reviewer', 'right-edit')
      left.handle.merge(right.handle)
      right.handle.merge(left.handle)
      const context = left.taskContext(taskId)
      assert.deepEqual(context.conflicts.status.map(value => value.actorId).sort(), ['builder', 'reviewer'])
      assert.deepEqual(context.revisions.status, ['left-edit', 'right-edit'])
      await assert.rejects(command(left, 'task.update', updatePayload(left, taskId, { status: 'completed' })), { code: 'CONFLICT_REQUIRES_RESOLUTION' })
      await command(left, 'task.resolve', {
        taskId, field: 'status', value: 'review', expectedRevisions: context.revisions.status,
      }, 'bob')
      right.handle.merge(left.handle)
      assert.deepEqual(right.taskContext(taskId).conflicts, {})
      assert.equal(right.taskContext(taskId).task.status, 'review')
      assert.equal(right.taskContext(taskId).history.length, 4)
    })
  })

  it('keeps human/agent read receipts when the same Actor works on separate replicas', async () => {
    await withWorkspaces(async (left, create) => {
      const taskId = await createTask(left)
      await command(left, 'comment.add', { taskId, text: 'First' }, 'builder')
      await command(left, 'comment.add', { taskId, text: 'Second' }, 'reviewer')
      const right = await create(left)
      const comments = left.taskContext(taskId).comments
      await command(left, 'read.mark', { taskId, comments: [{ commentId: comments[0].id, revisionId: comments[0].revisionId }] })
      await command(right, 'read.mark', { taskId, comments: [{ commentId: comments[1].id, revisionId: comments[1].revisionId }] })
      left.handle.merge(right.handle)
      assert.equal(left.taskContext(taskId, 'alice').unreadCount, 0)
      assert.equal(left.taskContext(taskId, 'bob').unreadCount, 2)
      await command(right, 'comment.add', { taskId, text: 'Previously unseen offline comment' }, 'reviewer')
      left.handle.merge(right.handle)
      assert.equal(left.taskContext(taskId, 'alice').unreadCount, 1)
    })
  })

  it('preserves commit evidence and merges branch changes without replacing unrelated parent edits', async () => {
    await withWorkspaces(async workspace => {
      const taskId = await createTask(workspace)
      const { result } = await command(workspace, 'task.branch', { taskId, name: 'Experiment' }, 'builder')
      await command(workspace, 'task.update', updatePayload(workspace, result.branchId, { description: 'A useful experiment' }), 'builder')
      await command(workspace, 'task.update', updatePayload(workspace, taskId, { priority: 'p0' }))
      await command(workspace, 'task.merge', { branchId: result.branchId, expectedRevisions: workspace.taskContext(taskId).revisions }, 'bob')
      await command(workspace, 'task.link-commit', { taskId, commit: { hash: 'abc123abcdef', message: 'Implement the experiment' } }, 'builder')
      const context = workspace.taskContext(taskId)
      assert.equal(context.task.description, 'A useful experiment')
      assert.equal(context.task.priority, 'p0')
      assert.deepEqual(context.evidence, [{ hash: 'abc123abcdef', message: 'Implement the experiment' }])
      assert.equal(workspace.taskContext(result.branchId).task.merged, true)
      await assert.rejects(command(workspace, 'task.merge', { branchId: result.branchId }), { code: 'INVALID_BRANCH' })
    })
  })

  it('keeps deleted comment history while removing its mentions from the active queue', async () => {
    await withWorkspaces(async workspace => {
      const taskId = await createTask(workspace)
      const receipt = await command(workspace, 'comment.add', { taskId, text: '@builder this has been superseded' })
      assert.equal(workspace.taskContext(taskId).mentions.length, 1)
      await command(workspace, 'comment.delete', { commentId: receipt.result.commentId, expectedRevisions: [receipt.operationId] })
      const context = workspace.taskContext(taskId)
      assert.equal(context.comments.length, 0)
      assert.equal(context.mentions.length, 0)
      assert.equal(context.history.length, 3)
      assert.equal(context.history.find(event => event.type === 'comment.add').payload.text, '@builder this has been superseded')
    })
  })
})
