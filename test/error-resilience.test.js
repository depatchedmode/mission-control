#!/usr/bin/env node

/**
 * Fitness Test: Error Resilience
 *
 * Validates that the system handles invalid inputs, missing resources,
 * and edge cases with clear errors — not crashes or 500s.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  withStartedServer,
  authedFetch,
  authedPost,
  authedPatch,
  authedDelete,
  httpUrl,
} from '../support/resources.js'

describe('error resilience', () => {
  // ─── Missing Resources ───

  it('PATCH nonexistent task returns 404', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPatch(server, '/automerge/task/nonexistent', {
        status: 'in-progress',
        agent: 'gary',
      })
      assert.equal(result.httpStatus, 404)
      assert.match(result.error, /not found/i)
    })
  })

  it('POST commit to nonexistent task returns 404', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/task/nonexistent/commit', {
        agent: 'gary',
        commit: { hash: 'abc123', message: 'test' },
      })
      assert.equal(result.httpStatus, 404)
    })
  })

  it('POST branch on nonexistent task returns 404', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/task/nonexistent/branch', {
        branchName: 'test',
        agent: 'gary',
      })
      assert.equal(result.httpStatus, 404)
    })
  })

  it('POST merge nonexistent branch returns 400', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/branch/nonexistent/merge', {
        agent: 'gary',
      })
      assert.equal(result.httpStatus, 400)
    })
  })

  it('DELETE nonexistent comment returns 404', async () => {
    await withStartedServer({}, async server => {
      const result = await authedDelete(server, '/automerge/comment/nonexistent')
      assert.equal(result.httpStatus, 404)
    })
  })

  it('PATCH nonexistent comment returns 404', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPatch(server, '/automerge/comment/nonexistent', {
        content: 'updated',
      })
      assert.equal(result.httpStatus, 404)
    })
  })

  // ─── Missing Required Fields ───

  it('POST task without title returns 400', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/task', {
        agent: 'gary',
      })
      assert.equal(result.httpStatus, 400)
      assert.match(result.error, /title/i)
    })
  })

  it('POST branch without branchName returns 400', async () => {
    await withStartedServer({}, async server => {
      // First create a task to branch
      const { taskId } = await authedPost(server, '/automerge/task', {
        title: 'Branch me',
        agent: 'gary',
      })

      const result = await authedPost(server, `/automerge/task/${taskId}/branch`, {
        agent: 'gary',
      })
      assert.equal(result.httpStatus, 400)
      assert.match(result.error, /branchName/i)
    })
  })

  it('POST agent without required fields returns 400', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/agent', {})
      assert.equal(result.httpStatus, 400)
    })
  })

  it('POST commit without hash returns 400', async () => {
    await withStartedServer({}, async server => {
      const { taskId } = await authedPost(server, '/automerge/task', {
        title: 'Commit test',
        agent: 'gary',
      })

      const result = await authedPost(server, `/automerge/task/${taskId}/commit`, {
        agent: 'gary',
        commit: { message: 'no hash' },
      })
      assert.equal(result.httpStatus, 400)
    })
  })

  it('POST last-seen without taskId returns 400', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/last-seen', {})
      assert.equal(result.httpStatus, 400)
      assert.match(result.error, /taskId/i)
    })
  })

  // ─── Auth Sweep ───

  it('all endpoints reject unauthorized requests', async () => {
    await withStartedServer({}, async server => {
      // Keep in sync with routes in automerge-sync-server.js setupHTTPAPI().
      // Currently 17 endpoints — if you add a route, add it here too.
      const endpoints = [
        ['GET', '/automerge/doc'],
        ['GET', '/automerge/url'],
        ['GET', '/automerge/mentions/pending'],
        ['POST', '/automerge/comment'],
        ['POST', '/automerge/task'],
        ['POST', '/automerge/agent'],
        ['POST', '/automerge/last-seen'],
        ['POST', '/automerge/ws-ticket'],
        ['POST', '/automerge/mentions/fake/deliver'],
        ['PATCH', '/automerge/task/fake'],
        ['PATCH', '/automerge/comment/fake'],
        ['DELETE', '/automerge/comment/fake'],
        ['GET', '/automerge/task/fake/history'],
        ['GET', '/automerge/task/fake/branches'],
        ['POST', '/automerge/task/fake/branch'],
        ['POST', '/automerge/task/fake/commit'],
        ['POST', '/automerge/branch/fake/merge'],
      ]

      for (const [method, path] of endpoints) {
        const url = httpUrl(server, path)
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method !== 'GET' ? '{}' : undefined,
        })

        assert.equal(
          res.status,
          401,
          `${method} ${path} should return 401 without auth, got ${res.status}`
        )
      }
    })
  })

  // ─── Deliver Nonexistent Mention ───

  it('delivering a nonexistent mention does not crash', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/mentions/fake-id/deliver', {})
      // Should succeed silently (mark operation on missing key is a no-op)
      assert.ok(result.success)
    })
  })

  // ─── Edge Cases ───

  it('creating a task with empty string title is rejected', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/task', {
        title: '',
        agent: 'gary',
      })
      assert.equal(result.httpStatus, 400)
    })
  })

  it('GET endpoints return valid JSON on empty state', async () => {
    await withStartedServer({}, async server => {
      const doc = await authedFetch(server, '/automerge/doc').then(r => r.json())
      assert.ok(doc.success)
      assert.ok(doc.doc)

      const mentions = await authedFetch(server, '/automerge/mentions/pending').then(r =>
        r.json()
      )
      assert.ok(mentions.success)
      assert.ok(Array.isArray(mentions.mentions))

      const history = await authedFetch(server, '/automerge/task/none/history').then(r =>
        r.json()
      )
      assert.ok(Array.isArray(history.history))

      const branches = await authedFetch(server, '/automerge/task/none/branches').then(r =>
        r.json()
      )
      assert.ok(Array.isArray(branches.branches))
    })
  })
})
