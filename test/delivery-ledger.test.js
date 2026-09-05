import { it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DeliveryLedger } from '../lib/delivery-ledger.js'

const mention = { id: 'mention-one', toActorId: 'builder', timestamp: '2026-09-04T00:00:00Z', idempotency_key: 'stable-key' }

it('persists leases, safely replays lost responses, rejects stale tokens, and retains acknowledgements', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pardner-ledger-'))
  const path = join(directory, 'deliveries.sqlite')
  let now = 1000
  let ledger = new DeliveryLedger(path, { clock: () => now })
  try {
    ledger.reconcile([mention], [mention.id])
    const first = ledger.claim('builder', 'request-one', 100)
    assert.equal(first.claimed, true)
    assert.equal(ledger.claim('builder', 'request-two').claimed, false)
    ledger.close()
    ledger = new DeliveryLedger(path, { clock: () => now })
    assert.equal(ledger.claim('builder', 'request-one').claimToken, first.claimToken)
    assert.throws(() => ledger.claim('other', 'request-one'), { code: 'OPERATION_ID_REUSED' })
    now += 101
    assert.throws(() => ledger.release('builder', mention.id, first.claimToken), { code: 'STALE_CLAIM' })
    const next = ledger.claim('builder', 'request-three')
    assert.notEqual(next.claimToken, first.claimToken)
    assert.throws(() => ledger.acknowledge('builder', mention.id, first.claimToken), { code: 'STALE_CLAIM' })
    assert.equal(ledger.acknowledge('builder', mention.id, next.claimToken).acknowledged, true)
    ledger.close()
    ledger = new DeliveryLedger(path, { clock: () => now })
    assert.equal(ledger.acknowledge('builder', mention.id, next.claimToken).replayed, true)
    ledger.reconcile([mention], [mention.id])
    assert.equal(ledger.claim('builder', 'request-four').claimed, false)
  } finally {
    ledger.close()
    await rm(directory, { recursive: true, force: true })
  }
})

it('tombstones removed mentions and never resurrects a cancelled delivery', () => {
  const ledger = new DeliveryLedger(':memory:')
  try {
    ledger.reconcile([mention], [mention.id])
    const claim = ledger.claim('builder', 'request-one')
    ledger.reconcile([mention], [])
    assert.throws(() => ledger.acknowledge('builder', mention.id, claim.claimToken), { code: 'STALE_CLAIM' })
    ledger.reconcile([mention], [mention.id])
    assert.equal(ledger.claim('builder', 'request-two').claimed, false)
  } finally { ledger.close() }
})
