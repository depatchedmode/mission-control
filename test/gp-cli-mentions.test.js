#!/usr/bin/env node

import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  TEST_TOKEN,
  authedGet,
  authedPost,
  cleanupTempDir,
  createServer,
  createTask,
  createTempDir,
} from '../support/resources.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CLI_PATH = join(__dirname, '..', 'bin', 'gp.js')
const tempDirs = []
const servers = []

function makeTempDir(prefix = 'gp-cli-mentions-') {
  const dir = createTempDir(prefix)
  tempDirs.push(dir)
  return dir
}

async function startServer() {
  const storagePath = makeTempDir('gp-cli-mentions-store-')
  const server = createServer(storagePath, {})
  await server.start()
  servers.push(server)
  return server
}

function runCli(cwd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI_PATH, ...args], {
      cwd,
      env: {
        ...process.env,
        GP_API_TOKEN: TEST_TOKEN,
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    const timeout = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`CLI timed out: ${args.join(' ')}`))
    }, 5000)

    child.stdout.on('data', chunk => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })

    child.on('error', error => {
      clearTimeout(timeout)
      reject(error)
    })

    child.on('close', (code, signal) => {
      clearTimeout(timeout)
      resolve({ status: code, signal, stdout, stderr })
    })
  })
}

afterEach(async () => {
  while (servers.length > 0) {
    const server = servers.pop()
    await server.stop().catch(() => {})
  }

  while (tempDirs.length > 0) {
    cleanupTempDir(tempDirs.pop())
  }
})

describe('mc CLI mention orchestration', () => {
  it('claims the next pending mention for an agent over the CLI', async () => {
    const server = await startServer()
    const cwd = makeTempDir()
    const taskId = await createTask(server)

    await authedPost(server, '/automerge/comment', {
      taskId,
      text: '@bob first mention',
      agent: 'alice',
    })
    await authedPost(server, '/automerge/comment', {
      taskId,
      text: '@bob second mention',
      agent: 'charlie',
    })

    const result = await runCli(cwd, ['mentions', 'claim-next', '--agent', 'bob', '--json'], {
      GP_SYNC_SERVER: `http://${server.host}:${server.httpPort}`,
    })

    assert.equal(result.status, 0, result.stderr)

    const claim = JSON.parse(result.stdout)
    assert.equal(claim.claimed, true)
    assert.equal(claim.mention.to_agent, 'bob')
    assert.equal(typeof claim.claimToken, 'string')
    assert.equal(typeof claim.claimExpiresAt, 'string')

    const { mentions } = await authedGet(server, '/automerge/mentions/pending?agent=bob')
    assert.equal(mentions.length, 1, 'The claimed mention should be hidden from future polls')
    assert.notEqual(mentions[0].id, claim.mention.id)
  })

  it('acknowledges and releases claimed mentions over the CLI', async () => {
    const server = await startServer()
    const cwd = makeTempDir()
    const taskId = await createTask(server)

    await authedPost(server, '/automerge/comment', {
      taskId,
      text: '@bob please review',
      agent: 'alice',
    })

    const { mentions: initialMentions } = await authedGet(server, '/automerge/mentions/pending?agent=bob')
    const mentionId = initialMentions[0].id

    const claimResult = await runCli(cwd, ['mentions', 'claim', mentionId, '--json'], {
      GP_SYNC_SERVER: `http://${server.host}:${server.httpPort}`,
    })
    assert.equal(claimResult.status, 0, claimResult.stderr)

    const claim = JSON.parse(claimResult.stdout)
    assert.equal(claim.claimed, true)

    const releaseResult = await runCli(
      cwd,
      ['mentions', 'release', mentionId, '--claim-token', claim.claimToken, '--json'],
      { GP_SYNC_SERVER: `http://${server.host}:${server.httpPort}` }
    )
    assert.equal(releaseResult.status, 0, releaseResult.stderr)

    const release = JSON.parse(releaseResult.stdout)
    assert.equal(release.released, true)

    const { mentions: afterRelease } = await authedGet(server, '/automerge/mentions/pending?agent=bob')
    assert.equal(afterRelease.length, 1, 'Released mentions should reappear in the pending pool')

    const secondClaimResult = await runCli(cwd, ['mentions', 'claim', mentionId, '--json'], {
      GP_SYNC_SERVER: `http://${server.host}:${server.httpPort}`,
    })
    const secondClaim = JSON.parse(secondClaimResult.stdout)

    const ackResult = await runCli(
      cwd,
      ['mentions', 'ack', mentionId, '--claim-token', secondClaim.claimToken, '--json'],
      { GP_SYNC_SERVER: `http://${server.host}:${server.httpPort}` }
    )
    assert.equal(ackResult.status, 0, ackResult.stderr)

    const ack = JSON.parse(ackResult.stdout)
    assert.equal(ack.delivered, true)

    const { mentions: finalMentions } = await authedGet(server, '/automerge/mentions/pending?agent=bob')
    assert.equal(finalMentions.length, 0, 'Acknowledged mentions should leave the pending pool')
  })
})
