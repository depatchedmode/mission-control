import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import { requestJson, SyncRequestError } from '../lib/sync-client.js'

describe('requestJson', () => {
  it('passes AbortSignal to fetch and rethrows AbortError', async () => {
    const controller = new AbortController()
    const fetchImpl = mock.fn(async (_url, opts) => {
      assert.strictEqual(opts.signal, controller.signal)
      const err = new Error('aborted')
      err.name = 'AbortError'
      throw err
    })

    await assert.rejects(
      () => requestJson('http://x', '/y', { fetchImpl, signal: controller.signal }),
      (e) => e.name === 'AbortError'
    )
  })

  it('wraps non-abort fetch failures as SyncRequestError', async () => {
    const fetchImpl = mock.fn(async () => {
      throw new Error('network down')
    })
    await assert.rejects(
      () => requestJson('http://x', '/y', { fetchImpl }),
      (e) => e instanceof SyncRequestError && e.isTransport === true
    )
  })
})
