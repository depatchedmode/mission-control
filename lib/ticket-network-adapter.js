import { NetworkAdapter } from '@automerge/automerge-repo'
import { WebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'

/** Own retry and ticket renewal; the underlying adapter retries a fixed URL. */
export class TicketNetworkAdapter extends NetworkAdapter {
  constructor({ getUrl, retryMs = 1000 }) {
    super()
    this.getUrl = getUrl
    this.retryMs = retryMs
    this.stopped = true
    this.generation = 0
    this.ready = false
    this.readyPromise = new Promise(resolve => { this.resolveReady = resolve })
    this.state = 'offline'
  }

  isReady() { return this.ready }
  whenReady() { return this.readyPromise }

  markReady() {
    this.ready = true
    this.resolveReady()
  }

  setState(state, error = null) {
    this.state = state
    this.emit('transport-state', { state, error: error?.message ?? null })
  }

  connect(peerId, peerMetadata) {
    this.disconnect()
    this.stopped = false
    this.peerId = peerId
    this.peerMetadata = peerMetadata
    void this.attempt()
  }

  async attempt() {
    if (this.stopped) return
    const generation = ++this.generation
    this.controller = new AbortController()
    this.setState('connecting')
    try {
      const url = await this.getUrl(this.controller.signal)
      if (this.stopped || generation !== this.generation) return
      // Retry timers and errors are owned here so every attempt gets a new URL.
      const child = new WebSocketClientAdapter(url, 2 ** 31 - 1)
      this.child = child
      child.onClose = () => this.retry(generation)
      child.onError = event => this.retry(generation, event.error ?? new Error('WebSocket connection failed'))
      for (const event of ['peer-candidate', 'peer-disconnected', 'message']) {
        child.on(event, payload => this.emit(event, payload))
      }
      child.on('peer-candidate', () => {
        this.markReady()
        this.setState('connected')
      })
      child.connect(this.peerId, this.peerMetadata)
      child.whenReady().then(() => {
        if (generation === this.generation) this.markReady()
      })
    } catch (error) {
      this.retry(generation, error)
    }
  }

  retry(generation, error = null) {
    if (this.stopped || generation !== this.generation) return
    this.generation++
    this.dropChild()
    this.markReady()
    this.setState('offline', error)
    clearTimeout(this.retryTimer)
    this.retryTimer = setTimeout(() => { void this.attempt() }, this.retryMs)
  }

  dropChild() {
    if (!this.child) return
    const socket = this.child.socket
    if (socket?.readyState === 0) {
      // ws reports cancellation as an error after the adapter removes listeners.
      socket.once('error', () => {})
    }
    this.child.disconnect()
    this.child.removeAllListeners()
    this.child = null
  }

  disconnect() {
    this.stopped = true
    this.generation++
    this.controller?.abort()
    clearTimeout(this.retryTimer)
    this.dropChild()
    this.setState('offline')
  }

  send(message) { this.child?.send(message) }
}
