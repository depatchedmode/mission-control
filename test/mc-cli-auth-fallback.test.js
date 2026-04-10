#!/usr/bin/env node

import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { execSync, spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { AutomergeStore } from '../lib/automerge-store.js'
import { noopLogger } from '../support/resources.js'

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
    logger: noopLogger,
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
  const doc = store.docHandle.doc()
  await store.close()
  return doc
}

async function startJsonServer(handler) {
  const server = createServer(handler)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  stubServers.push(server)
  return `http://127.0.0.1:${server.address().port}`
}

async function startStubServer(statusCode, errorMessage) {
  return startJsonServer((req, res) => {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: errorMessage }))
  })
}

async function reserveUnusedPort() {
  const server = createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  await new Promise(resolve => server.close(resolve))
  return port
}

function createGitRepoWithStagedChange(prefix = 'mc-cli-commit-repo-') {
  const cwd = createTempDir(prefix)
  execSync('git init', { cwd, stdio: 'pipe' })
  execSync('git config user.email "test@example.com"', { cwd, stdio: 'pipe' })
  execSync('git config user.name "Test User"', { cwd, stdio: 'pipe' })

  writeFileSync(join(cwd, 'note.txt'), 'initial\n')
  execSync('git add note.txt', { cwd, stdio: 'pipe' })
  execSync('git commit -m "Initial commit"', { cwd, stdio: 'pipe' })

  writeFileSync(join(cwd, 'note.txt'), 'changed\n')
  execSync('git add note.txt', { cwd, stdio: 'pipe' })

  return cwd
}

function gitCommitCount(cwd) {
  return Number(execSync('git rev-list --count HEAD', {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
  }).trim())
}

function gitHeadCommit(cwd) {
  return execSync('git rev-parse HEAD', {
    cwd,
    encoding: 'utf-8',
    stdio: 'pipe',
  }).trim()
}

function readOnlyTraceFile(cwd) {
  const traceDir = join(cwd, '.agent-trace')
  assert.equal(existsSync(traceDir), true, 'expected trace directory to exist')

  const traceFiles = readdirSync(traceDir).filter(file => file.endsWith('.json'))
  assert.equal(traceFiles.length, 1, 'expected exactly one trace file')

  return JSON.parse(readFileSync(join(traceDir, traceFiles[0]), 'utf-8'))
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

describe('mc CLI supported runtime enforcement', () => {
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

  it('fails with supported-runtime guidance when the sync server is unreachable for read commands', async () => {
    const cwd = createTempDir()
    await seedTaskStore(cwd)
    const unusedPort = await reserveUnusedPort()

    const result = await runCli(cwd, ['tasks'], {
      MC_SYNC_SERVER: `http://127.0.0.1:${unusedPort}`,
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Could not reach sync server/)
    assert.match(result.stderr, /npm run sync/)
    assert.match(result.stderr, /MC_API_TOKEN/)
    assert.doesNotMatch(result.stdout, /Local fallback task/)
  })

  it('fails with supported-runtime guidance when the sync server is unreachable for comment writes', async () => {
    const cwd = createTempDir()
    await seedTaskStore(cwd)
    const unusedPort = await reserveUnusedPort()

    const result = await runCli(cwd, ['comment', 'local-task-1', 'offline comment'], {
      MC_SYNC_SERVER: `http://127.0.0.1:${unusedPort}`,
      MC_AGENT: 'gary',
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Could not reach sync server/)
    assert.match(result.stderr, /npm run sync/)
    assert.match(result.stderr, /MC_API_TOKEN/)

    const doc = await readStore(cwd)
    const comments = Object.values(doc.comments || {})
    assert.equal(comments.length, 0)
  })

  it('does not create a git commit when the sync server is unreachable for task-linked commits', async () => {
    const cwd = createGitRepoWithStagedChange()
    const unusedPort = await reserveUnusedPort()

    const before = gitCommitCount(cwd)
    const result = await runCli(cwd, ['commit', '--task', 'task-123', '-m', 'blocked task link'], {
      MC_SYNC_SERVER: `http://127.0.0.1:${unusedPort}`,
      MC_AGENT: 'gary',
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Could not reach sync server/)
    assert.equal(gitCommitCount(cwd), before)
  })

  it('does not create a git commit when the requested task is missing on the sync server', async () => {
    const cwd = createGitRepoWithStagedChange()
    const baseUrl = await startJsonServer((req, res) => {
      if (req.method === 'GET' && req.url === '/automerge/doc') {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: true, doc: { tasks: {} } }))
        return
      }

      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Not found' }))
    })

    const before = gitCommitCount(cwd)
    const result = await runCli(cwd, ['commit', '--task', 'task-404', '-m', 'missing task'], {
      MC_SYNC_SERVER: baseUrl,
      MC_AGENT: 'gary',
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Task task-404 not found on sync server/)
    assert.equal(gitCommitCount(cwd), before)
  })

  it('creates a trace file and task-link request when a task-linked commit succeeds', async () => {
    const cwd = createGitRepoWithStagedChange()
    const commitRequests = []
    const baseUrl = await startJsonServer(async (req, res) => {
      if (req.method === 'GET' && req.url === '/automerge/doc') {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          success: true,
          doc: {
            tasks: {
              'task-123': { id: 'task-123', title: 'Server task' },
            },
          },
        }))
        return
      }

      if (req.method === 'POST' && req.url === '/automerge/task/task-123/commit') {
        let body = ''
        for await (const chunk of req) {
          body += chunk.toString()
        }

        commitRequests.push(JSON.parse(body))

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: true, taskId: 'task-123', commitHash: 'ok' }))
        return
      }

      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Not found' }))
    })

    const before = gitCommitCount(cwd)
    const result = await runCli(cwd, ['commit', '--task', 'task-123', '-m', 'happy path commit'], {
      MC_SYNC_SERVER: baseUrl,
      MC_AGENT: 'gary',
      MC_AGENT_MODEL: 'gpt-5.4',
      MC_AGENT_SESSION_KEY: 'session-123',
    })

    assert.equal(result.status, 0)
    assert.match(result.stdout, /Trace recorded/)
    assert.match(result.stdout, /Linked to Patchwork timeline/)
    assert.equal(gitCommitCount(cwd), before + 1)
    assert.equal(commitRequests.length, 1)

    const headCommit = gitHeadCommit(cwd)
    assert.equal(commitRequests[0].agent, 'gary')
    assert.equal(commitRequests[0].commit.hash, headCommit)
    assert.equal(commitRequests[0].commit.message, 'happy path commit')

    const trace = readOnlyTraceFile(cwd)
    assert.equal(trace.commit.hash, headCommit)
    assert.equal(trace.agent.name, 'gary')
    assert.equal(trace.agent.model, 'gpt-5.4')
    assert.equal(trace.agent.sessionKey, 'session-123')
    assert.equal(trace.task, 'task-123')
  })

  it('keeps a zero exit when post-commit task linking fails after the git commit succeeds', async () => {
    const cwd = createGitRepoWithStagedChange()
    const baseUrl = await startJsonServer((req, res) => {
      if (req.method === 'GET' && req.url === '/automerge/doc') {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          success: true,
          doc: {
            tasks: {
              'task-123': { id: 'task-123', title: 'Server task' },
            },
          },
        }))
        return
      }

      if (req.method === 'POST' && req.url === '/automerge/task/task-123/commit') {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Link write failed' }))
        return
      }

      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Not found' }))
    })

    const before = gitCommitCount(cwd)
    const result = await runCli(cwd, ['commit', '--task', 'task-123', '-m', 'commit link fails'], {
      MC_SYNC_SERVER: baseUrl,
      MC_AGENT: 'gary',
    })

    assert.equal(result.status, 0)
    assert.match(result.stderr, /Mission Control was not updated/)
    assert.match(result.stderr, /Link write failed/)
    assert.equal(gitCommitCount(cwd), before + 1)
  })
})
