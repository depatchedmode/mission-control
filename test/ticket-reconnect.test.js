import { it } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer } from 'node:http'
import { Workspace } from '../lib/workspace.js'
import { DurableRepo } from '../lib/durable-repo.js'
import { NodeFSStorageAdapter } from '../lib/nodefs-storage-adapter.js'
import { TicketNetworkAdapter } from '../lib/ticket-network-adapter.js'
import {
  withStartedServer, createTask, createTempDir, cleanupTempDir,
  mintWsTicket, nativeAutomergeWsUrl, waitFor,
} from '../support/resources.js'

it('shuts down safely while a WebSocket handshake is still pending', { timeout: 5000 }, async () => {
  const directory = createTempDir('pardner-handshake-')
  const server = createServer()
  const sockets = new Set()
  server.on('connection', socket => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
  })
  server.on('upgrade', () => {})
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const adapter = new TicketNetworkAdapter({ getUrl: async () => `ws://127.0.0.1:${server.address().port}/` })
  const repo = new DurableRepo({ storage: new NodeFSStorageAdapter(directory), network: [adapter] })
  try {
    await waitFor(() => adapter.child?.socket?.readyState === 0)
    await repo.shutdown()
    assert.equal(adapter.state, 'offline')
  } finally {
    await repo.shutdown()
    for (const socket of sockets) socket.destroy()
    await new Promise(resolve => server.close(resolve))
    cleanupTempDir(directory)
  }
})

it('native transport mints fresh tickets after repeated disconnects without recreating its Repo', { timeout: 15000 }, async () => {
  await withStartedServer({}, async server => {
    const directory = createTempDir('pardner-renewal-')
    const taskId = await createTask(server)
    const tickets = []
    const adapter = new TicketNetworkAdapter({ retryMs: 30, getUrl: async () => {
      const ticket = await mintWsTicket(server)
      tickets.push(ticket)
      return nativeAutomergeWsUrl(server, { ticket })
    } })
    const repo = new DurableRepo({ storage: new NodeFSStorageAdapter(directory), network: [adapter] })
    try {
      const handle = await repo.find(server.store.docHandle.url)
      const workspace = new Workspace({ repo, handle, replicaId: 'ticket-test-replica' })
      for (let index = 0; index < 3; index++) {
        await waitFor(() => adapter.state === 'connected')
        const disconnected = once(adapter, 'peer-disconnected')
        adapter.child.socket.terminate()
        await disconnected
        await workspace.execute({ operationId: `offline-${index}`, actorId: 'builder', type: 'task.update',
          payload: { taskId, updates: { description: `offline-${index}` }, expectedRevisions: { description: workspace.taskContext(taskId).revisions.description } } })
        await waitFor(() => server.store.getDoc().tasks[taskId].description === `offline-${index}`)
      }
      assert.equal(new Set(tickets).size, tickets.length)
      assert.ok(tickets.length >= 4, 'initial connection plus three fresh authenticated connections')
      assert.equal(server.securityCounters.wsUnauthorized, 0)
    } finally {
      await repo.shutdown()
      cleanupTempDir(directory)
    }
  })
})
