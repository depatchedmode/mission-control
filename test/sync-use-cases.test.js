#!/usr/bin/env node
/**
 * UC1–UC3: multi-replica coordination (native Automerge Repo WebSocket).
 * Run with: npm run test:gaps
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Repo } from '@automerge/automerge-repo'
import { WebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'
import { NodeFSStorageAdapter } from '../lib/nodefs-storage-adapter.js'

import {
  withStartedServer,
  authedPost,
  authedGet,
  createTask,
  nativeAutomergeWsUrl,
} from '../support/resources.js'

const SYNC_SETTLE_MS = 4000
const ADAPTER_RETRY_MS = 60_000

function tempPeerDir() {
  return mkdtempSync(join(tmpdir(), 'mc-peer-'))
}

function rmDir(dir) {
  try {
    rmSync(dir, { recursive: true, force: true })
  } catch {
    // ignore
  }
}

async function mintTicket(server) {
  const { ticket } = await authedPost(server, '/automerge/ws-ticket', {})
  assert.ok(ticket, 'ws ticket')
  return ticket
}

async function openPeerRepo(server, storageDir) {
  const ticket = await mintTicket(server)
  const { url: documentUrl } = await authedGet(server, '/automerge/url')
  const transportUrl = nativeAutomergeWsUrl(server, { ticket })
  const adapter = new WebSocketClientAdapter(transportUrl, ADAPTER_RETRY_MS)
  const repo = new Repo({
    storage: new NodeFSStorageAdapter(storageDir),
    network: [adapter],
  })
  const handle = await repo.find(documentUrl)
  await handle.whenReady(['ready'])
  return { repo, handle, adapter, documentUrl, storageDir }
}

async function settle() {
  await new Promise(r => setTimeout(r, SYNC_SETTLE_MS))
}

describe('sync use cases (native Automerge WS)', () => {
  it('UC1_two_actors_same_hub_concurrent_peer_edits_merge', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'UC1', agent: 'seed' })
      const dir1 = tempPeerDir()
      const dir2 = tempPeerDir()
      let p1
      let p2
      try {
        p1 = await openPeerRepo(server, dir1)
        p2 = await openPeerRepo(server, dir2)

        await Promise.all([
          p1.handle.change(d => {
            d.tasks[taskId].assignee = 'alice'
            d.tasks[taskId].updated_at = new Date().toISOString()
          }),
          p2.handle.change(d => {
            d.tasks[taskId].priority = 'p0'
            d.tasks[taskId].updated_at = new Date().toISOString()
          }),
        ])

        await settle()
        const a = p1.handle.doc()
        const b = p2.handle.doc()
        assert.equal(a.tasks[taskId].assignee, 'alice')
        assert.equal(a.tasks[taskId].priority, 'p0')
        assert.equal(b.tasks[taskId].assignee, 'alice')
        assert.equal(b.tasks[taskId].priority, 'p0')
      } finally {
        try {
          p1?.adapter?.socket?.terminate?.()
          await p1?.repo?.shutdown()
        } catch {
          // ignore
        }
        try {
          p2?.adapter?.socket?.terminate?.()
          await p2?.repo?.shutdown()
        } catch {
          // ignore
        }
        rmDir(dir1)
        rmDir(dir2)
      }
    })
  })

  it('UC2_one_actor_two_replicas_converge', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'UC2', agent: 'solo' })
      const dir1 = tempPeerDir()
      const dir2 = tempPeerDir()
      let p1
      let p2
      try {
        p1 = await openPeerRepo(server, dir1)
        p2 = await openPeerRepo(server, dir2)

        await p1.handle.change(d => {
          d.tasks[taskId].description = 'from R1'
          d.tasks[taskId].updated_at = new Date().toISOString()
        })
        await settle()
        const doc2 = p2.handle.doc()
        assert.equal(doc2.tasks[taskId].description, 'from R1')
      } finally {
        try {
          p1?.adapter?.socket?.terminate?.()
          await p1?.repo?.shutdown()
        } catch {
          // ignore
        }
        try {
          p2?.adapter?.socket?.terminate?.()
          await p2?.repo?.shutdown()
        } catch {
          // ignore
        }
        rmDir(dir1)
        rmDir(dir2)
      }
    })
  })

  it('UC3_two_actors_two_replicas_cross_replica_merge', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'UC3', agent: 'seed' })
      const dirA = tempPeerDir()
      const dirB = tempPeerDir()
      let pa
      let pb
      try {
        pa = await openPeerRepo(server, dirA)
        pb = await openPeerRepo(server, dirB)

        await pa.handle.change(d => {
          d.tasks[taskId].status = 'in-progress'
          d.tasks[taskId].updated_at = new Date().toISOString()
        })
        await pb.handle.change(d => {
          d.tasks[taskId].title = 'UC3 updated'
          d.tasks[taskId].updated_at = new Date().toISOString()
        })
        await settle()

        const da = pa.handle.doc()
        const db = pb.handle.doc()
        assert.equal(da.tasks[taskId].status, 'in-progress')
        assert.equal(da.tasks[taskId].title, 'UC3 updated')
        assert.equal(db.tasks[taskId].status, 'in-progress')
        assert.equal(db.tasks[taskId].title, 'UC3 updated')
      } finally {
        try {
          pa?.adapter?.socket?.terminate?.()
          await pa?.repo?.shutdown()
        } catch {
          // ignore
        }
        try {
          pb?.adapter?.socket?.terminate?.()
          await pb?.repo?.shutdown()
        } catch {
          // ignore
        }
        rmDir(dirA)
        rmDir(dirB)
      }
    })
  })
})
