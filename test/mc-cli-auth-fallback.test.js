#!/usr/bin/env node

import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { AutomergeStore } from '../lib/automerge-store.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CLI_PATH = join(__dirname, '..', 'bin', 'mc.js')
const tempDirs = []
const stubServers = []

function createTempDir(prefix = 'mc-cli-test-') {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

function storePaths(cwd) {
  return {
    storagePath: join(cwd, '.mission-control'),
    urlFile: join(cwd, '.mission-control-url'),
    usePersistedUrl: true,
  }
}

async function seedTaskStore(cwd) {
  const store = new AutomergeStore(storePaths(cwd))
  await store.init()
  await store.docHandle.change(doc => {
    if (!doc.tasks) doc.tasks = {}
    doc.tasks['local-task-1'] = {
      id: 'local-task-1',
      title: 'Local fallback task',
      status: 'todo',
      priority: 'p1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  })
  await store.close()
}

async function readStore(cwd) {
  const store = new AutomergeStore(storePaths(cwd))
  await store.init()
  const doc = store.getDoc()
  await store.close()
  return doc
}

async function startStubServer(statusCode, errorMessage) {
  const server = createServer((req, res) => {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: errorMessage }))
  })

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  stubServers.push(server)
  return `http://127.0.0.1:${server.address().port}`
}

async function reserveUnusedPort() {
  const server = createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  await new Promise(resolve => server.close(resolve))
  return port
}

function runCli(cwd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI_PATH, ...args], {
      cwd,
      env: {
        ...process.env,
        MC_API_TOKEN: '',
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
  while (stubServers.length > 0) {
    const server = stubServers.pop()
    await new Promise(resolve => server.close(resolve))
  }

  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop(), { recursive: true, force: true })
  }
})

describe('mc CLI sync-server fallback hardening', () => {
  it('does not fall back to the local store for reachable server HTTP errors on read commands', async () => {
    const cwd = createTempDir()
    await seedTaskStore(cwd)

    const cases = [
      { statusCode: 401, message: 'Unauthorized' },
      { statusCode: 403, message: 'Forbidden' },
      { statusCode: 500, message: 'Server exploded' },
    ]

    for (const testCase of cases) {
      const baseUrl = await startStubServer(testCase.statusCode, testCase.message)
      const result = await runCli(cwd, ['tasks'], { MC_SYNC_SERVER: baseUrl })

      assert.notEqual(result.status, 0, `Expected non-zero exit for HTTP ${testCase.statusCode}`)
      assert.match(result.stderr, new RegExp(testCase.message))
      assert.doesNotMatch(result.stdout, /Local fallback task/)
    }
  })

  it('does not fall back to the local store for reachable server auth failures on comment writes', async () => {
    const cwd = createTempDir()
    await seedTaskStore(cwd)
    const baseUrl = await startStubServer(401, 'Unauthorized')

    const result = await runCli(cwd, ['comment', 'local-task-1', 'blocked comment'], {
      MC_SYNC_SERVER: baseUrl,
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Unauthorized/)

    const doc = await readStore(cwd)
    assert.equal(Object.keys(doc.comments || {}).length, 0)
  })

  it('falls back to the local store when the sync server is unreachable for read commands', async () => {
    const cwd = createTempDir()
    await seedTaskStore(cwd)
    const unusedPort = await reserveUnusedPort()

    const result = await runCli(cwd, ['tasks'], {
      MC_SYNC_SERVER: `http://127.0.0.1:${unusedPort}`,
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /Local fallback task/)
  })

  it('falls back to the local store when the sync server is unreachable for comment writes', async () => {
    const cwd = createTempDir()
    await seedTaskStore(cwd)
    const unusedPort = await reserveUnusedPort()

    const result = await runCli(cwd, ['comment', 'local-task-1', 'offline comment'], {
      MC_SYNC_SERVER: `http://127.0.0.1:${unusedPort}`,
      MC_AGENT: 'gary',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /\(via store\)/)

    const doc = await readStore(cwd)
    const comments = Object.values(doc.comments || {})
    assert.equal(comments.length, 1)
    assert.equal(comments[0].content, 'offline comment')
  })
})
