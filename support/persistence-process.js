import { DurableRepo as Repo } from '../lib/durable-repo.js'
import { NodeFSStorageAdapter } from '../lib/nodefs-storage-adapter.js'

const [directory, existingUrl] = process.argv.slice(2)
const repo = new Repo({ storage: new NodeFSStorageAdapter(directory), network: [] })
let compactions = 0
repo.on('doc-metrics', metric => {
  if (metric.type === 'doc-compacted') compactions++
})

try {
  const handle = existingUrl ? await repo.find(existingUrl) : repo.create({ operations: {}, counter: 0 })
  if (existingUrl) {
    process.send({ type: 'loaded', doc: handle.doc(), heads: handle.heads() })
  } else {
    for (let index = 0; index < 100; index++) {
      handle.change(doc => {
        doc.operations[`operation-${index}`] = { actor: 'builder', value: index }
        doc.counter = index + 1
      })
      await repo.flush([handle.documentId])
    }
    process.send({ type: 'saved', url: handle.url, heads: handle.heads(), compactions })
  }
  process.on('message', async message => {
    if (message !== 'append') return
    handle.change(doc => {
      doc.operations['after-restart'] = { actor: 'reviewer', value: 100 }
      doc.counter++
    })
    await repo.flush([handle.documentId])
    process.send({ type: 'saved-again', heads: handle.heads() })
  })
} catch (error) {
  process.send({ type: 'error', message: error.stack })
  process.exitCode = 1
  process.disconnect()
}
