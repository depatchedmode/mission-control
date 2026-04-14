#!/usr/bin/env node
/**
 * UC1–UC4: multi-replica coordination (native Automerge Repo WebSocket).
 * Run with: npm test or npm run test:gaps
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  withStartedServer,
  authedGet,
  authedPatch,
  createTask,
  closeNativePeer,
  createTempDir,
  disconnectNativePeer,
  getDoc,
  openNativePeer,
  waitFor,
} from '../support/resources.js'

async function waitForTaskFields(resolveDoc, taskId, expected, label) {
  await waitFor(
    async () => {
      const doc = await resolveDoc()
      const task = doc?.tasks?.[taskId]
      if (!task) return false
      return Object.entries(expected).every(([key, value]) => task[key] === value)
    },
    { description: label }
  )
}

describe('sync use cases (native Automerge WS)', () => {
  it('UC1_two_actors_same_hub_concurrent_peer_edits_merge', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'UC1', agent: 'seed' })
      const dir1 = createTempDir('mc-peer-')
      const dir2 = createTempDir('mc-peer-')
      let p1
      let p2
      try {
        p1 = await openNativePeer(server, dir1)
        p2 = await openNativePeer(server, dir2)

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

        await waitForTaskFields(
          () => p1.handle.doc(),
          taskId,
          { assignee: 'alice', priority: 'p0' },
          'UC1 convergence on peer A'
        )
        await waitForTaskFields(
          () => p2.handle.doc(),
          taskId,
          { assignee: 'alice', priority: 'p0' },
          'UC1 convergence on peer B'
        )
      } finally {
        await closeNativePeer(p1)
        await closeNativePeer(p2)
      }
    })
  })

  it('UC2_one_actor_two_replicas_converge', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'UC2', agent: 'solo' })
      const dir1 = createTempDir('mc-peer-')
      const dir2 = createTempDir('mc-peer-')
      let p1
      let p2
      try {
        p1 = await openNativePeer(server, dir1)
        p2 = await openNativePeer(server, dir2)

        await p1.handle.change(d => {
          d.tasks[taskId].description = 'from R1'
          d.tasks[taskId].updated_at = new Date().toISOString()
        })
        await waitForTaskFields(
          () => p2.handle.doc(),
          taskId,
          { description: 'from R1' },
          'UC2 convergence on replica 2'
        )
      } finally {
        await closeNativePeer(p1)
        await closeNativePeer(p2)
      }
    })
  })

  it('UC3_two_actors_two_replicas_cross_replica_merge', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'UC3', agent: 'seed' })
      const dirA = createTempDir('mc-peer-')
      const dirB = createTempDir('mc-peer-')
      let pa
      let pb
      try {
        pa = await openNativePeer(server, dirA)
        pb = await openNativePeer(server, dirB)

        await pa.handle.change(d => {
          d.tasks[taskId].status = 'in-progress'
          d.tasks[taskId].updated_at = new Date().toISOString()
        })
        await pb.handle.change(d => {
          d.tasks[taskId].title = 'UC3 updated'
          d.tasks[taskId].updated_at = new Date().toISOString()
        })
        await waitForTaskFields(
          () => pa.handle.doc(),
          taskId,
          { status: 'in-progress', title: 'UC3 updated' },
          'UC3 convergence on replica A'
        )
        await waitForTaskFields(
          () => pb.handle.doc(),
          taskId,
          { status: 'in-progress', title: 'UC3 updated' },
          'UC3 convergence on replica B'
        )
      } finally {
        await closeNativePeer(pa)
        await closeNativePeer(pb)
      }
    })
  })

  it('UC4_local_first_replica_recovers_after_disconnect_and_merges', async () => {
    await withStartedServer({}, async server => {
      const taskId = await createTask(server, { title: 'UC4', agent: 'seed' })
      const dir = createTempDir('mc-peer-')
      let peer
      try {
        peer = await openNativePeer(server, dir)
        await disconnectNativePeer(peer)

        await peer.handle.change(d => {
          d.tasks[taskId].description = 'offline edit'
          d.tasks[taskId].updated_at = new Date().toISOString()
        })
        assert.equal(peer.handle.doc().tasks[taskId].description, 'offline edit')

        await authedPatch(server, `/automerge/task/${taskId}`, {
          status: 'in-review',
          agent: 'hub',
        })

        const hubWhileOffline = await authedGet(server, '/automerge/doc')
        assert.equal(hubWhileOffline.doc.tasks[taskId].status, 'in-review')
        assert.notEqual(hubWhileOffline.doc.tasks[taskId].description, 'offline edit')

        await closeNativePeer(peer, { removeStorage: false })
        peer = await openNativePeer(server, dir)

        await waitForTaskFields(
          () => peer.handle.doc(),
          taskId,
          { description: 'offline edit', status: 'in-review' },
          'UC4 convergence on reconnected replica'
        )
        await waitForTaskFields(
          () => getDoc(server),
          taskId,
          { description: 'offline edit', status: 'in-review' },
          'UC4 convergence on hub'
        )
      } finally {
        await closeNativePeer(peer)
      }
    })
  })
})
