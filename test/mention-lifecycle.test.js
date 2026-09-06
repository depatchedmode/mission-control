import { it } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import AutomergeSyncServer from '../automerge-sync-server.js'
import { withWorkspaceServer } from '../support/workspace-test.js'

const claim = (api, actorId = 'builder', requestId = randomUUID(), ttlMs = 1000) => api('/automerge/deliveries/claim', { actorId, requestId, ttlMs })
const pending = async (api, actor) => (await api(`/automerge/deliveries${actor ? `?actor=${actor}` : ''}`)).mentions
const finish = (api, action, receipt, actorId = 'builder') => api(`/automerge/deliveries/${action}`, { actorId, mentionId: receipt.mention.id, claimToken: receipt.claimToken })
async function mention(create, operation, text = '@builder please review') {
  const taskId = await create()
  const receipt = await operation('comment.add', { taskId, text })
  return { taskId, ...receipt.result, revision: receipt.operationId }
}

it('creates one delivery per mentioned Actor, deduplicates repeated handles, and filters pending work', async () => {
  await withWorkspaceServer(async ({ create, operation, api }) => {
    const created = await mention(create, operation, '@builder @reviewer @builder')
    const all = await pending(api)
    assert.equal(all.length, 2)
    for (const actor of ['builder', 'reviewer']) {
      const selected = await pending(api, actor)
      assert.equal(selected.length, 1)
      assert.equal(selected[0].toActorId, actor)
      assert.equal(selected[0].fromActorId, 'alice')
      assert.equal(selected[0].taskId, created.taskId)
      assert.equal(selected[0].commentId, created.commentId)
    }
    assert.deepEqual(await pending(api, 'bob'), [])
  })
})

it('simultaneous claims allocate one delivery once and replay the winning request safely', async () => {
  await withWorkspaceServer(async ({ create, operation, api }) => {
    await mention(create, operation)
    const ids = ['first-poll', 'second-poll']
    const results = await Promise.all(ids.map(id => claim(api, 'builder', id)))
    assert.equal(results.filter(result => result.claimed).length, 1)
    const winner = results.findIndex(result => result.claimed)
    const replay = await claim(api, 'builder', ids[winner])
    assert.equal(replay.replayed, true)
    assert.equal(replay.claimToken, results[winner].claimToken)
    assert.deepEqual(await pending(api), [])
    const otherActor = await claim(api, 'reviewer', ids[winner])
    assert.equal(otherActor.code, 'OPERATION_ID_REUSED')
  })
})

it('empty claims have a stable replay and a new poll can discover subsequently created work', async () => {
  await withWorkspaceServer(async ({ create, operation, api }) => {
    assert.equal((await claim(api, 'builder', 'empty')).claimed, false)
    await mention(create, operation)
    const replay = await claim(api, 'builder', 'empty')
    assert.equal(replay.claimed, false)
    assert.equal(replay.replayed, true)
    assert.equal((await claim(api)).claimed, true)
  })
})

it('release restores pending work and renewed claims reject every old token', async () => {
  await withWorkspaceServer(async ({ create, operation, api }) => {
    await mention(create, operation)
    const first = await claim(api)
    assert.deepEqual(await pending(api), [])
    assert.equal((await finish(api, 'release', first)).released, true)
    assert.equal((await finish(api, 'release', first)).replayed, true)
    assert.equal((await pending(api)).length, 1)
    const second = await claim(api)
    assert.notEqual(second.claimToken, first.claimToken)
    for (const action of ['ack', 'release']) assert.equal((await finish(api, action, first)).code, 'STALE_CLAIM')
    assert.equal((await finish(api, 'ack', second, 'reviewer')).code, 'STALE_CLAIM')
    assert.equal((await finish(api, 'ack', second)).acknowledged, true)
    assert.equal((await finish(api, 'ack', second)).replayed, true)
    assert.deepEqual(await pending(api), [])
  })
})

it('expired leases become pending and cannot be acknowledged or released even before renewal', async () => {
  await withWorkspaceServer(async ({ create, operation, api, server }) => {
    let now = 1000
    server.store.deliveryLedger.clock = () => now
    await mention(create, operation)
    const first = await claim(api)
    now += 1001
    assert.equal((await pending(api)).length, 1)
    for (const action of ['ack', 'release']) assert.equal((await finish(api, action, first)).code, 'STALE_CLAIM')
    const second = await claim(api)
    assert.notEqual(second.claimToken, first.claimToken)
    assert.equal((await finish(api, 'ack', second)).acknowledged, true)
  })
})

it('active leases and completed acknowledgements survive a production service restart', async () => {
  await withWorkspaceServer(async ({ create, operation, api, server, directory }) => {
    await mention(create, operation)
    const receipt = await claim(api, 'builder', 'durable-claim', 60000)
    const options = { directory, apiToken: 'test-token', env: {}, logger: {}, httpPort: server.httpPort, wsPort: server.wsPort }
    await server.stop()
    let reopened = new AutomergeSyncServer(options)
    try {
      await reopened.start()
      assert.deepEqual(await pending(api), [])
      assert.equal((await claim(api, 'builder', 'durable-claim')).claimToken, receipt.claimToken)
      assert.equal((await finish(api, 'ack', receipt)).acknowledged, true)
      await reopened.stop()
      reopened = new AutomergeSyncServer(options)
      await reopened.start()
      assert.equal((await finish(api, 'ack', receipt)).replayed, true)
      assert.equal((await claim(api)).claimed, false)
    } finally { await reopened.stop() }
  })
})

it('deleting a comment cancels its delivery and invalidates an outstanding claim', async () => {
  await withWorkspaceServer(async ({ create, operation, api, context }) => {
    const created = await mention(create, operation)
    const receipt = await claim(api)
    const deleted = await operation('comment.delete', { commentId: created.commentId, expectedRevisions: [created.revision] })
    assert.equal(deleted.savedLocally, true)
    assert.deepEqual((await context(created.taskId)).comments, [])
    assert.deepEqual(await pending(api), [])
    assert.equal((await finish(api, 'ack', receipt)).code, 'STALE_CLAIM')
  })
})

it('comments on separate tasks retain separate delivery identities and task context', async () => {
  await withWorkspaceServer(async ({ create, operation, api }) => {
    const first = await mention(create, operation)
    const second = await mention(create, operation)
    const deliveries = await pending(api, 'builder')
    assert.equal(deliveries.length, 2)
    assert.deepEqual(deliveries.map(value => value.taskId).sort(), [first.taskId, second.taskId].sort())
    assert.equal(new Set(deliveries.map(value => value.idempotency_key)).size, 2)
    const claimed = await claim(api)
    await finish(api, 'ack', claimed)
    const remaining = await claim(api)
    assert.notEqual(remaining.mention.taskId, claimed.mention.taskId)
  })
})
