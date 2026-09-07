import { it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { BridgeInbox } from '../lib/bridge-inbox.js'
import { retireCompletedBridge, planWorktreeArchive, moveArchivedWorktree } from '../lib/bridge-retirement.js'
import { createWorktrees } from '../support/bridge-rehearsal.js'

async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'pardner-retirement-'))
  const inbox = new BridgeInbox(join(root, 'inbox.sqlite'), { workspaceId: 'w', replicaId: 'r' })
  const mappings = ['builder', 'reviewer'].map(actorId => ({ actorId, threadId: actorId, worktree: '/shared-fixture', enabled: true, allowedTaskIds: ['one', 'two'] }))
  const state = { tasks: { one: 'completed', two: 'completed' }, busy: false, pending: [], archived: [], moved: [], plans: [], extraThreads: [], conflicts: {} }
  const adapter = {
    availability: async () => state.busy ? 'busy' : 'ready',
    worktreeThreads: async () => state.extraThreads,
    isArchived: async mapping => state.archived.includes(mapping.threadId),
    archive: async mapping => {
      if (!state.archived.includes(mapping.threadId)) state.archived.push(mapping.threadId)
      if (state.loseReply) { state.loseReply = false; throw new Error('reply lost') }
    },
  }
  const bridge = { config: { mappings, completionCleanup: { archiveDirectory: join(root, 'archive') } }, inbox,
    source: { actors: async () => ({ tasks: state.branches ?? {} }), pending: async () => ({ mentions: state.pending }),
      context: async ({ taskId }) => ({ task: { status: state.tasks[taskId] }, conflicts: state.conflicts }) },
    adapters: new Map(mappings.map(mapping => [mapping.actorId, adapter])),
  }
  const dependencies = {
    plan: async source => { state.plans.push(source); return { source, destination: '/archive/fixture' } },
    move: async plan => { if (state.failMove) throw new Error('disk unavailable'); state.moved.push(plan.source) },
  }
  state.tick = () => retireCompletedBridge(bridge, dependencies)
  state.inbox = inbox
  state.bridge = bridge
  try { await run(state) } finally { inbox.close(); await rm(root, { recursive: true, force: true }) }
}

it('waits for all tasks, conflicts, deliveries, and active turns, then archives a shared worktree once', () => fixture(async state => {
  state.tasks.two = 'review'; await state.tick()
  state.tasks.two = 'completed'; state.conflicts = { status: ['a', 'b'] }; await state.tick()
  state.conflicts = {}; state.busy = true; await state.tick()
  state.busy = false; state.pending = [{}]; await state.tick()
  state.pending = []; state.extraThreads = [{ id: 'unmapped-thread' }]; await state.tick()
  assert.deepEqual(state.archived, [])
  state.extraThreads = []; await state.tick(); await state.tick()
  assert.deepEqual(state.archived, ['builder', 'reviewer'])
  assert.deepEqual(state.plans, ['/shared-fixture'])
  assert.deepEqual(state.moved, ['/shared-fixture'])
  assert.equal(state.inbox.retirement().state, 'archived')
}))

it('an open related branch prevents cleanup even when the configured parent is complete', () => fixture(async state => {
  state.branches = { child: { id: 'child', branch: { parentId: 'one' } } }
  state.tasks.child = 'review'; await state.tick()
  assert.equal(state.inbox.retirement(), null)
  state.tasks.child = 'completed'; await state.tick()
  assert.equal(state.inbox.retirement().state, 'archived')
}))

it('queued and uncertain work and outstanding claims prevent retirement', () => fixture(async state => {
  const mapping = state.bridge.config.mappings[0]
  state.inbox.claim('builder')
  await state.tick(); assert.equal(state.inbox.retirement(), null)
  state.inbox.receive('builder', { mention: { id: 'delivery', taskId: 'one', toActorId: 'builder' } }, mapping)
  state.inbox.clearClaim('builder')
  await state.tick(); assert.equal(state.inbox.retirement(), null)
  state.inbox.begin('delivery', 'prompt'); state.inbox.recover()
  await state.tick(); assert.equal(state.inbox.retirement(), null)
  state.inbox.accept('delivery', 'turn'); await state.tick()
  assert.equal(state.inbox.retirement().state, 'archived')
}))

it('lost archive replies and move failures retain a durable retirement decision for retry', () => fixture(async state => {
  state.loseReply = true
  await assert.rejects(state.tick(), /reply lost/)
  assert.equal(state.inbox.retirement().state, 'archiving')
  state.failMove = true
  await assert.rejects(state.tick(), /disk unavailable/)
  assert.deepEqual(state.archived, ['builder', 'reviewer'])
  state.failMove = false
  await state.tick()
  assert.equal(state.inbox.retirement().state, 'archived')
  assert.deepEqual(state.plans, ['/shared-fixture'])
}))

it('reopening a task pauses partial retirement and never reactivates an archived ownership group', () => fixture(async state => {
  state.loseReply = true
  await assert.rejects(state.tick(), /reply lost/)
  state.tasks.two = 'in-progress'
  await state.tick()
  assert.deepEqual(state.archived, ['builder'])
  assert.deepEqual(state.moved, [])
  state.tasks.two = 'completed'
  await state.tick()
  const completed = state.inbox.retirement()
  state.tasks.one = 'backlog'
  await state.tick()
  assert.deepEqual(state.inbox.retirement(), completed)
  assert.equal(state.moved.length, 1)
}))

it('moving a real dirty worktree preserves tracked, untracked, and ignored files and tolerates retry', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pardner-archive-worktree-'))
  try {
    const trees = await createWorktrees(root, 'challenge')
    await writeFile(join(trees.builder, 'queue.mjs'), 'uncommitted work')
    await writeFile(join(trees.builder, 'notes.txt'), 'untracked work')
    await writeFile(join(trees.builder, 'evidence.log'), 'ignored evidence')
    await assert.rejects(planWorktreeArchive(join(root, 'fixture-repository'), join(root, 'archive')), /main checkout/)
    const plan = await planWorktreeArchive(trees.builder, join(root, 'archive'))
    await moveArchivedWorktree(plan); await moveArchivedWorktree(plan)
    for (const [name, value] of [['queue.mjs', 'uncommitted work'], ['notes.txt', 'untracked work'], ['evidence.log', 'ignored evidence']]) {
      assert.equal(await readFile(join(plan.destination, name), 'utf8'), value)
    }
    await assert.rejects(readFile(join(trees.builder, 'queue.mjs')), { code: 'ENOENT' })
  } finally { await rm(root, { recursive: true, force: true }) }
})
