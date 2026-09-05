#!/usr/bin/env node
/**
 * Scenario-based stress runner for native peers (UC2–UC4).
 *
 * Local hub (default): starts an in-process sync server; uses TEST_TOKEN from support/resources.
 * Remote hub: set PARDNER_SYNC_SERVER and PARDNER_API_TOKEN to hit a long-lived hub.
 *
 * Usage:
 *   node scripts/stress-native-peer.js uc2 [--runs N] [--hub-restart]
 *   node scripts/stress-native-peer.js uc3 …
 *   node scripts/stress-native-peer.js uc4 …
 *   node scripts/stress-native-peer.js all …
 */

import process from 'node:process'
import { requestJson } from '../lib/sync-client.js'
import { NetworkGate } from '../support/acceptance/network-gate.js'

import {
  closeNativePeer,
  connectNativePeer,
  createTaskHttp,
  patchTaskHttp,
  updatePeerTask,
  resolveWsBase,
  waitForTaskFieldsOnHandle,
  waitForTaskFieldsOnHub,
} from '../lib/native-peer-client.js'
import {
  TEST_TOKEN,
  createTempDir,
  httpUrl,
  withStartedServer,
} from '../support/resources.js'

function parseArgs(argv) {
  const positional = []
  let runs = 1
  let hubRestart = false
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--runs') {
      runs = Math.max(1, Number(argv[i + 1]) || 1)
      i += 1
    } else if (a === '--hub-restart') {
      hubRestart = true
    } else if (!a.startsWith('-')) {
      positional.push(a)
    }
  }
  return { scenario: positional[0], runs, hubRestart }
}

function basesFromServer(server) {
  return {
    httpBase: httpUrl(server, ''),
    wsBase: `ws://${server.host}:${server.wsPort}`,
    token: TEST_TOKEN, actorId: 'alice', secondActorId: 'builder',
  }
}

function basesFromEnv() {
  if (!process.env.PARDNER_SYNC_SERVER) {
    console.error('Remote mode requires PARDNER_SYNC_SERVER')
    process.exit(1)
  }
  const httpBase = process.env.PARDNER_SYNC_SERVER.replace(/\/$/, '')
  const token =
    process.env.PARDNER_API_TOKEN === undefined || process.env.PARDNER_API_TOKEN === ''
      ? null
      : process.env.PARDNER_API_TOKEN
  const wsBase = resolveWsBase(httpBase)
  const actorId = process.env.PARDNER_ACTOR, secondActorId = process.env.PARDNER_SECOND_ACTOR
  if (!actorId || !secondActorId) throw new Error('Remote stress requires registered PARDNER_ACTOR and PARDNER_SECOND_ACTOR')
  return { httpBase, wsBase, token, actorId, secondActorId }
}

function isRemoteMode() {
  return Boolean(process.env.PARDNER_SYNC_SERVER)
}

async function runUc2(bases) {
  const { httpBase, wsBase, token } = bases
  const dir1 = createTempDir('pardner-stress-peer-')
  const dir2 = createTempDir('pardner-stress-peer-')
  let p1
  let p2
  const t0 = Date.now()
  try {
    const taskId = await createTaskHttp(httpBase, token, {
      title: 'stress UC2',
    }, bases.actorId)
    p1 = await connectNativePeer({
      httpBase,
      wsBase,
      token,
      storagePath: dir1,
    })
    p2 = await connectNativePeer({
      httpBase,
      wsBase,
      token,
      storagePath: dir2,
    })

    await edit(p1, taskId, { description: 'from R1' }, bases.actorId)
    await waitForTaskFieldsOnHandle(
      p2.handle,
      taskId,
      { description: 'from R1' },
      'UC2 replica 2'
    )
    return { ok: true, ms: Date.now() - t0, taskId }
  } finally {
    await closeNativePeer(p1, { removeStorage: true })
    await closeNativePeer(p2, { removeStorage: true })
  }
}

async function runUc3(bases) {
  const { httpBase, wsBase, token } = bases
  const dirA = createTempDir('pardner-stress-peer-')
  const dirB = createTempDir('pardner-stress-peer-')
  let pa
  let pb
  const t0 = Date.now()
  try {
    const taskId = await createTaskHttp(httpBase, token, {
      title: 'stress UC3',
    }, bases.actorId)
    pa = await connectNativePeer({
      httpBase,
      wsBase,
      token,
      storagePath: dirA,
    })
    pb = await connectNativePeer({
      httpBase,
      wsBase,
      token,
      storagePath: dirB,
    })

    await edit(pa, taskId, { status: 'in-progress' }, bases.actorId)
    await edit(pb, taskId, { title: 'stress UC3 updated' }, bases.secondActorId)
    await waitForTaskFieldsOnHandle(
      pa.handle,
      taskId,
      { status: 'in-progress', title: 'stress UC3 updated' },
      'UC3 peer A'
    )
    await waitForTaskFieldsOnHandle(
      pb.handle,
      taskId,
      { status: 'in-progress', title: 'stress UC3 updated' },
      'UC3 peer B'
    )
    return { ok: true, ms: Date.now() - t0, taskId }
  } finally {
    await closeNativePeer(pa, { removeStorage: true })
    await closeNativePeer(pb, { removeStorage: true })
  }
}

async function edit(peer, taskId, updates, actorId) {
  const { revisions } = peer.workspace.taskContext(taskId)
  return updatePeerTask(peer, taskId, updates, actorId,
    Object.fromEntries(Object.keys(updates).map(field => [field, revisions[field]])))
}

async function runUc4(bases) {
  const { httpBase, wsBase, token } = bases
  const dir = createTempDir('pardner-stress-peer-')
  const gate = await new NetworkGate({ httpUrl: httpBase, wsUrl: `${wsBase}/automerge` }).start()
  const settings = { httpBase: gate.httpUrl, wsBase: gate.wsUrl.replace(/\/automerge$/, ''), token, storagePath: dir }
  let peer
  const t0 = Date.now()
  try {
    const taskId = await createTaskHttp(httpBase, token, { title: 'stress UC4' }, bases.actorId)
    peer = await connectNativePeer(settings)
    gate.partition()
    await edit(peer, taskId, { description: 'offline edit' }, bases.secondActorId)
    const context = await requestJson(httpBase, `/automerge/task/${taskId}/context`, { token })
    await patchTaskHttp(httpBase, token, taskId, { status: 'review' }, bases.actorId, { status: context.revisions.status })
    const identity = peer.runtime.manifest.replicaId
    await closeNativePeer(peer)
    peer = await connectNativePeer(settings)
    if (peer.runtime.manifest.replicaId !== identity || peer.workspace.taskContext(taskId).task.description !== 'offline edit') throw new Error('Offline restart lost state or identity')
    gate.partition(false)
    await waitForTaskFieldsOnHandle(peer.handle, taskId, { description: 'offline edit', status: 'review' }, 'UC4 peer')
    await waitForTaskFieldsOnHub(httpBase, token, taskId, { description: 'offline edit', status: 'review' }, 'UC4 hub')
    return { ok: true, ms: Date.now() - t0, taskId }
  } finally {
    try { await closeNativePeer(peer, { removeStorage: true }) }
    finally { await gate.close() }
  }
}

const SCENARIOS = {
  uc2: runUc2,
  uc3: runUc3,
  uc4: runUc4,
}

async function runScenario(name, bases) {
  const fn = SCENARIOS[name]
  if (!fn) throw new Error(`Unknown scenario: ${name}`)
  return fn(bases)
}

function usage() {
  console.error(`Usage:
  node scripts/stress-native-peer.js <uc2|uc3|uc4|all> [--runs N] [--hub-restart]

Local (default): in-process hub.
Remote: PARDNER_SYNC_SERVER=… PARDNER_API_TOKEN=… PARDNER_ACTOR=… PARDNER_SECOND_ACTOR=… node scripts/stress-native-peer.js uc2

--hub-restart Start a fresh in-process hub for each run (local only; no effect when remote).`)
  process.exit(1)
}

async function main() {
  const { scenario, runs, hubRestart } = parseArgs(process.argv.slice(2))
  if (!scenario) usage()

  const list =
    scenario === 'all' ? ['uc2', 'uc3', 'uc4'] : [scenario]
  for (const s of list) {
    if (!SCENARIOS[s]) {
      console.error('Unknown scenario:', s)
      usage()
    }
  }

  const remote = isRemoteMode()
  const timings = []

  if (remote) {
    if (hubRestart) {
      console.warn('Note: --hub-restart ignored in remote mode (use your process supervisor).')
    }
    const bases = basesFromEnv()
    for (let i = 0; i < runs; i += 1) {
      for (const s of list) {
        const r = await runScenario(s, bases)
        timings.push({ run: i + 1, scenario: s, ...r })
        console.log(
          `${r.ok ? 'PASS' : 'FAIL'} ${s} run ${i + 1}/${runs} ${r.ms}ms`
        )
      }
    }
  } else if (hubRestart) {
    for (let i = 0; i < runs; i += 1) {
      await withStartedServer({}, async server => {
        const bases = basesFromServer(server)
        for (const s of list) {
          const r = await runScenario(s, bases)
          timings.push({ run: i + 1, scenario: s, ...r })
          console.log(
            `${r.ok ? 'PASS' : 'FAIL'} ${s} run ${i + 1}/${runs} ${r.ms}ms`
          )
        }
      })
    }
  } else {
    await withStartedServer({}, async server => {
      const bases = basesFromServer(server)
      for (let i = 0; i < runs; i += 1) {
        for (const s of list) {
          const r = await runScenario(s, bases)
          timings.push({ run: i + 1, scenario: s, ...r })
          console.log(
            `${r.ok ? 'PASS' : 'FAIL'} ${s} run ${i + 1}/${runs} ${r.ms}ms`
          )
        }
      }
    })
  }

  const summary = {}
  for (const row of timings) {
    if (!summary[row.scenario]) summary[row.scenario] = []
    summary[row.scenario].push(row.ms)
  }
  console.log('\n--- timing summary (ms) ---')
  for (const [s, msList] of Object.entries(summary)) {
    const sum = msList.reduce((a, b) => a + b, 0)
    console.log(
      `${s}: n=${msList.length} avg=${Math.round(sum / msList.length)} min=${Math.min(...msList)} max=${Math.max(...msList)}`
    )
  }
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
