import { it } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { realpath } from 'node:fs/promises'
import { WebSocketServer } from 'ws'
import { CodexBridgeAdapter, localEndpoint } from '../lib/codex-bridge-adapter.js'

async function fixture(run) {
  const server = new WebSocketServer({ host: '127.0.0.1', port: 0 })
  await once(server, 'listening')
  const policy = { approvalPolicy: 'on-request', approvalsReviewer: 'user', sandbox: { type: 'readOnly' } }
  const mapping = { endpoint: `ws://127.0.0.1:${server.address().port}`, threadId: 'thread-one', worktree: await realpath('/tmp'), expectedPolicy: policy }
  const state = { calls: [], status: { type: 'idle' }, turns: [], cwd: mapping.worktree }
  server.on('connection', socket => {
    state.socket = socket
    socket.on('message', bytes => {
      const message = JSON.parse(bytes.toString())
      state.calls.push(message)
      if (message.id === undefined) return
      let result = {}
      if (message.method === 'thread/resume') result = state.policy ?? policy
      if (message.method === 'thread/read') result = { thread: { id: mapping.threadId, cwd: state.cwd, status: state.status, turns: state.turns } }
      if (message.method === 'thread/list') result = { data: message.params.archived
        ? (state.archived ? [{ id: mapping.threadId, cwd: state.cwd }] : []) : (state.relatedThreads ?? []), nextCursor: null }
      if (message.method === 'thread/archive') {
        state.archived = true
        if (state.dropArchive) { state.dropArchive = false; socket.terminate(); return }
      }
      if (message.method === 'turn/start') {
        state.turns.push({ id: 'turn-one', items: [{ type: 'userMessage', content: message.params.input }] })
        if (state.dropDispatch) { socket.terminate(); return }
        result = { turn: { id: 'turn-one' } }
      }
      socket.send(JSON.stringify({ id: message.id, result }))
    })
  })
  const adapter = new CodexBridgeAdapter({ ...mapping, requestTimeoutMs: 200 })
  try { await run({ adapter, state, mapping }) } finally {
    adapter.close()
    for (const client of server.clients) client.terminate()
    await new Promise(resolve => server.close(resolve))
  }
}

it('initializes, resumes the mapped thread, and starts a turn without overriding session permissions or model', () => fixture(async ({ adapter, state, mapping }) => {
  assert.equal(await adapter.availability(mapping), 'ready')
  assert.equal(await adapter.dispatch(mapping, 'bounded prompt'), 'turn-one')
  assert.deepEqual(state.calls.map(call => call.method), ['initialize', 'initialized', 'thread/read', 'thread/resume', 'thread/read', 'turn/start'])
  assert.deepEqual(state.calls.find(call => call.method === 'thread/resume').params, { threadId: mapping.threadId })
  assert.deepEqual(state.calls.at(-1).params, { threadId: mapping.threadId, input: [{ type: 'text', text: 'bounded prompt', text_elements: [] }] })
}))

it('reports busy and blocked sessions and never auto-answers an approval', () => fixture(async ({ adapter, state, mapping }) => {
  state.status = { type: 'active', activeFlags: [] }
  assert.equal(await adapter.availability(mapping), 'busy')
  const event = once(adapter, 'change')
  state.socket.send(JSON.stringify({ id: 'approval-one', method: 'item/commandExecution/requestApproval', params: { threadId: mapping.threadId } }))
  await event
  assert.match(await adapter.availability(mapping), /blocked/)
  assert.equal(state.calls.some(call => call.id === 'approval-one'), false)
  assert.equal(state.calls.some(call => call.method === 'turn/start'), false)
}))

it('rejects worktree mismatch before resuming or starting a turn', () => fixture(async ({ adapter, state, mapping }) => {
  state.cwd = '/'
  await assert.rejects(adapter.availability(mapping), { code: 'WORKTREE_MISMATCH' })
  assert.equal(state.calls.some(call => call.method === 'thread/resume' || call.method === 'turn/start'), false)
}))

it('reconnects and finds an accepted prompt after the dispatch response was lost', () => fixture(async ({ adapter, state, mapping }) => {
  await adapter.availability(mapping)
  state.dropDispatch = true
  await assert.rejects(adapter.dispatch(mapping, 'stable prompt'), /closed/)
  assert.equal(await adapter.reconcile(mapping, 'stable prompt'), 'turn-one')
  assert.equal(await adapter.reconcile(mapping, 'different prompt'), null)
  assert.equal(state.calls.filter(call => call.method === 'turn/start').length, 1)
}))

it('does not infer non-acceptance from missing history or accept ambiguous matching turns', () => fixture(async ({ adapter, state, mapping }) => {
  const turn = { id: 'turn-one', items: [{ type: 'userMessage', content: [{ type: 'text', text: 'prompt' }] }] }
  state.turns = [turn, { ...turn, id: 'turn-two' }]
  assert.equal(await adapter.reconcile(mapping, 'prompt'), null)
  state.turns = []
  assert.equal(await adapter.reconcile(mapping, 'prompt'), null)
}))

it('rejects non-local or credential-bearing harness endpoints', () => {
  for (const endpoint of ['ws://example.com', 'ws://127.0.0.1?token=secret', 'ws://user:secret@localhost', 'http://localhost']) {
    assert.throws(() => localEndpoint(endpoint, ['ws:']))
  }
})

it('blocks dispatch when resumed session permissions differ from the explicit policy', () => fixture(async ({ adapter, state, mapping }) => {
  state.policy = { ...mapping.expectedPolicy, approvalPolicy: 'never' }
  await assert.rejects(adapter.availability(mapping), { code: 'PERMISSION_POLICY_CHANGED' })
  assert.equal(state.calls.some(call => call.method === 'turn/start'), false)
}))

it('inspection returns effective permissions and worktree without dispatching', () => fixture(async ({ adapter, state, mapping }) => {
  assert.deepEqual(await adapter.describe(mapping), { threadId: mapping.threadId, worktree: mapping.worktree, expectedPolicy: mapping.expectedPolicy })
  assert.equal(state.calls.some(call => call.method === 'turn/start'), false)
}))

it('archive retries recognize a lost successful reply without resuming or archiving again', () => fixture(async ({ adapter, state, mapping }) => {
  state.dropArchive = true
  await assert.rejects(adapter.archive(mapping), /closed/)
  const resumes = state.calls.filter(call => call.method === 'thread/resume').length
  await adapter.archive(mapping)
  assert.equal(state.calls.filter(call => call.method === 'thread/archive').length, 1)
  assert.equal(state.calls.filter(call => call.method === 'thread/resume').length, resumes)
}))

it('finds descendants outside the worktree without treating unrelated threads as associated', () => fixture(async ({ adapter, state, mapping }) => {
  state.relatedThreads = [
    { id: 'grandchild', cwd: '/another', forkedFromId: 'child' },
    { id: 'child', cwd: '/elsewhere', source: { subAgent: { thread_spawn: { parent_thread_id: mapping.threadId } } } },
    { id: 'unrelated', cwd: '/different' },
  ]
  assert.deepEqual((await adapter.worktreeThreads(mapping, false)).map(thread => thread.id), ['grandchild', 'child'])
}))
