import { createServer, request } from 'node:http'
import { createServer as createTcpServer, connect } from 'node:net'

/** Real sockets cross these gates; partitioning destroys existing connections too. */
export class NetworkGate {
  constructor({ httpUrl, wsUrl }) {
    this.targetHttp = new URL(httpUrl)
    this.targetWs = new URL(wsUrl)
    this.connected = true
    this.sockets = new Set()
    this.drops = new Map()
    this.events = []
    this.http = createServer((incoming, outgoing) => {
      if (!this.connected) { incoming.socket.destroy(); return }
      const upstream = request(new URL(incoming.url, this.targetHttp), {
        method: incoming.method, headers: { ...incoming.headers, host: this.targetHttp.host, connection: 'close' },
      }, response => {
        const remaining = this.drops.get(incoming.url) || 0
        if (remaining) {
          this.drops.set(incoming.url, remaining - 1)
          response.resume()
          response.on('end', () => {
            this.events.push({ type: 'response-lost', path: incoming.url, at: Date.now() })
            outgoing.destroy()
          })
        } else {
          outgoing.writeHead(response.statusCode, response.headers)
          response.pipe(outgoing)
        }
      })
      upstream.on('socket', socket => this.track(socket))
      upstream.on('error', () => outgoing.destroy())
      incoming.on('aborted', () => upstream.destroy())
      incoming.pipe(upstream)
    })
    this.http.on('connection', socket => this.track(socket))
    this.ws = createTcpServer(socket => {
      this.track(socket)
      if (!this.connected) { socket.destroy(); return }
      const upstream = connect({ host: this.targetWs.hostname, port: Number(this.targetWs.port) })
      this.track(upstream)
      socket.pipe(upstream).pipe(socket)
      socket.on('close', () => upstream.destroy())
      upstream.on('close', () => socket.destroy())
    })
  }

  track(socket) {
    this.sockets.add(socket)
    socket.on('error', () => socket.destroy())
    socket.on('close', () => this.sockets.delete(socket))
  }

  async start() {
    await Promise.all([this.http, this.ws].map(server => new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })))
    this.httpUrl = `http://127.0.0.1:${this.http.address().port}`
    this.wsUrl = `ws://127.0.0.1:${this.ws.address().port}/automerge`
    return this
  }

  partition(blocked = true) {
    this.connected = !blocked
    this.events.push({ type: blocked ? 'partition' : 'heal', at: Date.now() })
    if (blocked) for (const socket of this.sockets) socket.destroy()
  }

  loseResponse(path, count = 1) { this.drops.set(path, count) }

  retarget({ httpUrl, wsUrl }) {
    this.targetHttp = new URL(httpUrl)
    this.targetWs = new URL(wsUrl)
  }

  async close() {
    this.partition()
    await Promise.all([this.http, this.ws].map(server => new Promise(resolve => server.close(resolve))))
  }
}
