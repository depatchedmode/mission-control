#!/usr/bin/env node

/**
 * Automerge Sync Server
 * 
 * Bridges frontend Automerge (browser) with backend AutomergeStore (Node.js)
 * Provides real-time sync between UI and backend data persistence
 */

import { WebSocketServer } from 'ws'
import { AutomergeStore } from './lib/automerge-store.js'
import express from 'express'
import crypto from 'crypto'
import { createServer } from 'node:http'
import { fileURLToPath } from 'url'

const DEFAULT_HTTP_PORT = 8004
const DEFAULT_WS_PORT = 8005

function defaultAllowedOrigins(httpPort) {
  return [
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    `http://localhost:${httpPort}`,
    `http://127.0.0.1:${httpPort}`
  ]
}

function parseAllowedOrigins(value, defaults) {
  if (value instanceof Set) return new Set(value)
  if (Array.isArray(value)) {
    return new Set(value.map(origin => origin.trim()).filter(Boolean))
  }
  if (!value) return new Set(defaults)
  return new Set(
    String(value)
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  )
}

function parsePort(value, name) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${name}: ${value}`)
  }
  return parsed
}

function appendHeaderValue(existing, value) {
  if (!existing) return value
  const values = String(existing)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  if (values.includes(value)) return String(existing)
  return `${existing}, ${value}`
}

function getBearerToken(authorizationHeader = '') {
  if (!authorizationHeader.startsWith('Bearer ')) return null
  return authorizationHeader.slice('Bearer '.length).trim()
}

class AutomergeSyncServer {
  constructor(options = {}) {
    const env = options.env ?? process.env
    const storeOptions = {}
    if (options.storagePath !== undefined) storeOptions.storagePath = options.storagePath
    if (options.urlFile !== undefined) storeOptions.urlFile = options.urlFile
    if (options.usePersistedUrl !== undefined) storeOptions.usePersistedUrl = options.usePersistedUrl

    this.store = options.store || new AutomergeStore(storeOptions)
    this.connectedClients = new Set()
    this.app = express()
    this.wss = null
    this.httpServer = null
    this.wsHttpServer = null
    this.host = options.host ?? env.MC_BIND_HOST ?? '127.0.0.1'
    this.httpPort = parsePort(options.httpPort ?? env.MC_HTTP_PORT ?? DEFAULT_HTTP_PORT, 'MC_HTTP_PORT')
    this.wsPort = parsePort(options.wsPort ?? env.MC_WS_PORT ?? DEFAULT_WS_PORT, 'MC_WS_PORT')
    this.apiToken = options.apiToken ?? env.MC_API_TOKEN ?? ''
    this.allowInsecureLocal = options.allowInsecureLocal ?? env.MC_ALLOW_INSECURE_LOCAL === '1'
    this.allowLegacyWsQueryToken = options.allowLegacyWsQueryToken ?? env.MC_ALLOW_LEGACY_WS_QUERY_TOKEN === '1'
    this.wsTicketTtlMs = Number(
      options.wsTicketTtlMs ?? env.MC_WS_TICKET_TTL_MS ?? 60000
    )
    this.logger = options.logger ?? console
    this.wsTickets = new Map()
    this.securityCounters = {
      httpUnauthorized: 0,
      httpOriginRejected: 0,
      wsUnauthorized: 0,
      wsOriginRejected: 0
    }
    this.allowedOrigins = parseAllowedOrigins(
      options.allowedOrigins ?? env.MC_ALLOWED_ORIGINS ?? '',
      defaultAllowedOrigins(this.httpPort)
    )

    if (!this.apiToken && !this.allowInsecureLocal) {
      throw new Error(
        'MC_API_TOKEN is required. To bypass for local-only testing, set MC_ALLOW_INSECURE_LOCAL=1.'
      )
    }
    if (this.allowedOrigins.has('*')) {
      throw new Error(
        'MC_ALLOWED_ORIGINS must be an explicit comma-separated allowlist. Wildcard "*" is not supported.'
      )
    }
    if (!Number.isInteger(this.wsTicketTtlMs) || this.wsTicketTtlMs <= 0) {
      throw new Error(`Invalid MC_WS_TICKET_TTL_MS: ${env.MC_WS_TICKET_TTL_MS}`)
    }
  }
  
  async start() {
    console.log('🚀 Starting Automerge Sync Server...')
    
    // Initialize backend store
    await this.store.init()
    console.log('✅ Backend AutomergeStore initialized')
    
    // Setup Express for HTTP API
    this.setupHTTPAPI()
    
    // Setup WebSocket for real-time sync
    this.setupWebSocketServer()
    
    // Start HTTP server
    this.httpServer = await new Promise((resolve, reject) => {
      const server = this.app.listen(this.httpPort, this.host, () => resolve(server))
      server.once('error', reject)
    })
    this.httpPort = this.getBoundPort(this.httpServer, this.httpPort)

    this.wsHttpServer = await new Promise((resolve, reject) => {
      const server = this.wsHttpServer.listen(this.wsPort, this.host, () => resolve(this.wsHttpServer))
      server.once('error', reject)
    })
    this.wsPort = this.getBoundPort(this.wsHttpServer, this.wsPort)

    console.log(`📡 HTTP API listening on ${this.host}:${this.httpPort}`)
    console.log(`🌐 WebSocket sync on ${this.host}:${this.wsPort}`)
    console.log(`🔐 Auth mode: ${this.apiToken ? 'token required' : 'disabled (unsafe local mode)'}`)
    console.log(`🌍 Allowed CORS origins: ${this.allowedOrigins.size === 0 ? '(none)' : [...this.allowedOrigins].join(', ')}`)
    
    // Register default agents if not exists
    await this.initializeDefaultAgents()
  }

  getBoundPort(server, fallbackPort) {
    const address = server?.address?.()
    if (address && typeof address === 'object' && Number.isInteger(address.port)) {
      return address.port
    }
    return fallbackPort
  }

  async stop() {
    for (const client of this.connectedClients) {
      try {
        client.terminate()
      } catch {
        // Ignore client shutdown errors during teardown.
      }
    }
    this.connectedClients.clear()

    if (this.wss) {
      await new Promise(resolve => this.wss.close(() => resolve()))
      this.wss = null
    }

    await this.closeServer(this.wsHttpServer)
    await this.closeServer(this.httpServer)
    this.wsHttpServer = null
    this.httpServer = null

    await this.store.close()
  }

  async closeServer(server) {
    if (!server?.listening) return
    await new Promise((resolve, reject) => {
      server.close(error => {
        if (error) return reject(error)
        resolve()
      })
    })
  }

  isAllowedOrigin(origin) {
    if (!origin) return true
    return this.allowedOrigins.has(origin)
  }

  applyCorsHeaders(res, origin) {
    if (!origin) return
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-MC-Token')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Max-Age', '600')
    res.setHeader('Vary', appendHeaderValue(res.getHeader('Vary'), 'Origin'))
  }

  recordSecurityEvent(type, message) {
    if (type in this.securityCounters) {
      this.securityCounters[type] += 1
    }
    this.logger.warn?.(`[security] ${message}`)
  }

  getSecurityCounters() {
    return { ...this.securityCounters }
  }

  originMiddleware(req, res, next) {
    const origin = req.headers.origin
    if (!this.isAllowedOrigin(origin)) {
      this.recordSecurityEvent(
        'httpOriginRejected',
        `Rejected HTTP ${req.method} ${req.url} from origin ${origin}`
      )
      return res.status(403).json({ error: `Origin not allowed: ${origin}` })
    }

    this.applyCorsHeaders(res, origin)

    if (req.method === 'OPTIONS') {
      return res.status(204).end()
    }

    return next()
  }

  tokenFromRequest(req, options = {}) {
    const { allowLegacyWsQueryToken = false } = options
    const bearerToken = getBearerToken(req.headers?.authorization || '')
    if (bearerToken) return bearerToken

    const headerToken = req.headers?.['x-mc-token']
    if (headerToken) return String(headerToken)

    if (allowLegacyWsQueryToken && this.allowLegacyWsQueryToken) {
      try {
        const url = new URL(req.url || '', `http://${this.host}:${this.httpPort}`)
        const queryToken = url.searchParams.get('token')
        if (queryToken) return queryToken
      } catch {
        // Ignore malformed URL values and continue unauthenticated.
      }
    }

    return null
  }

  wsTicketFromRequest(req) {
    try {
      const url = new URL(req.url || '', `http://${this.host}:${this.httpPort}`)
      const ticket = url.searchParams.get('ticket')
      if (ticket) return ticket
    } catch {
      // Ignore malformed URL values and continue unauthenticated.
    }

    return null
  }

  mintWsTicket() {
    const ticket = crypto.randomBytes(32).toString('hex')
    this.wsTickets.set(ticket, Date.now() + this.wsTicketTtlMs)
    return ticket
  }

  consumeWsTicket(ticket) {
    if (!ticket) return false
    const expiresAt = this.wsTickets.get(ticket)
    if (!expiresAt) return false
    this.wsTickets.delete(ticket)
    return expiresAt > Date.now()
  }

  cleanupExpiredWsTickets() {
    const now = Date.now()
    for (const [ticket, expiresAt] of this.wsTickets) {
      if (expiresAt <= now) this.wsTickets.delete(ticket)
    }
  }

  isAuthorizedRequest(req) {
    if (!this.apiToken) return true
    const token = this.tokenFromRequest(req)
    return token === this.apiToken
  }

  isAuthorizedWebSocketRequest(req) {
    if (!this.apiToken) return true

    const token = this.tokenFromRequest(req, { allowLegacyWsQueryToken: true })
    if (token === this.apiToken) return true

    const ticket = this.wsTicketFromRequest(req)
    return this.consumeWsTicket(ticket)
  }

  authMiddleware(req, res, next) {
    if (this.isAuthorizedRequest(req)) {
      return next()
    }
    this.recordSecurityEvent(
      'httpUnauthorized',
      `Rejected unauthorized HTTP ${req.method} ${req.url}`
    )
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  setupHTTPAPI() {
    this.app.use((req, res, next) => this.originMiddleware(req, res, next))
    this.app.use(express.json())
    this.app.use((req, res, next) => this.authMiddleware(req, res, next))
    
    // Get current document state
    this.app.get('/automerge/doc', async (req, res) => {
      try {
        const doc = this.store.getDoc()
        res.json({ success: true, doc })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    // Get document URL for frontend connection
    this.app.get('/automerge/url', async (req, res) => {
      try {
        const url = this.store.docHandle?.url
        res.json({ success: true, url })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    // Mark mention as delivered
    this.app.post('/automerge/mentions/:id/deliver', async (req, res) => {
      try {
        const mentionId = req.params.id
        await this.store.markMentionDelivered(mentionId)
        this.broadcastDocumentUpdate()
        res.json({ success: true, mentionId })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    // Get pending mentions
    this.app.get('/automerge/mentions/pending', async (req, res) => {
      try {
        const agent = req.query.agent
        const mentions = await this.store.getPendingMentions(agent)
        res.json({ success: true, mentions })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    // Add comment (from CLI or other sources)
    this.app.post('/automerge/comment', async (req, res) => {
      try {
        const { taskId, text, agent } = req.body
        const commentId = await this.store.addComment(taskId, text, agent)
        
        // Broadcast update
        this.broadcastDocumentUpdate()
        
        res.json({ success: true, commentId })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    this.app.post('/automerge/ws-ticket', async (req, res) => {
      try {
        this.cleanupExpiredWsTickets()
        const ticket = this.mintWsTicket()
        res.json({ success: true, ticket, expiresInMs: this.wsTicketTtlMs })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // Update comment (e.g., fix attribution)
    this.app.patch('/automerge/comment/:commentId', async (req, res) => {
      try {
        const { commentId } = req.params
        const updates = req.body
        
        const doc = this.store.getDoc()
        if (!doc.comments?.[commentId]) {
          return res.status(404).json({ error: 'Comment not found' })
        }
        
        await this.store.docHandle.change(doc => {
          const comment = doc.comments[commentId]
          if (updates.agent) comment.agent = updates.agent
          if (updates.content) comment.content = updates.content
        })
        
        this.broadcastDocumentUpdate()
        res.json({ success: true, commentId })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    // Delete comment
    this.app.delete('/automerge/comment/:commentId', async (req, res) => {
      try {
        const { commentId } = req.params
        
        const doc = this.store.getDoc()
        if (!doc.comments?.[commentId]) {
          return res.status(404).json({ error: 'Comment not found' })
        }
        
        // Find mentions that reference this comment
        const mentionsToDelete = Object.entries(doc.mentions || {})
          .filter(([_, mention]) => mention.comment_id === commentId)
          .map(([mentionId]) => mentionId)
        
        await this.store.docHandle.change(doc => {
          // Delete the comment
          delete doc.comments[commentId]
          
          // Delete associated mentions
          if (doc.mentions) {
            mentionsToDelete.forEach(mentionId => {
              delete doc.mentions[mentionId]
            })
          }
        })
        
        this.broadcastDocumentUpdate()
        res.json({ 
          success: true, 
          commentId,
          mentionsDeleted: mentionsToDelete.length 
        })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    // Update last-seen timestamp for a task (for read/unread sync - single user, global state)
    this.app.post('/automerge/last-seen', async (req, res) => {
      try {
        const { taskId, timestamp } = req.body
        if (!taskId) {
          return res.status(400).json({ error: 'taskId is required' })
        }
        
        const ts = timestamp || new Date().toISOString()
        
        await this.store.docHandle.change(doc => {
          if (!doc.lastSeen) doc.lastSeen = {}
          doc.lastSeen[taskId] = ts
        })
        
        this.broadcastDocumentUpdate()
        res.json({ success: true, taskId, timestamp: ts })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // Register agent
    this.app.post('/automerge/agent', async (req, res) => {
      try {
        const { name, sessionKey, role } = req.body
        if (!name || !sessionKey) {
          return res.status(400).json({ error: 'Name and sessionKey are required' })
        }
        
        await this.store.registerAgent(name, sessionKey, role || 'Agent')
        this.broadcastDocumentUpdate()
        
        res.json({ success: true, name })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    // Create task (from CLI or other sources)
    this.app.post('/automerge/task', async (req, res) => {
      try {
        const { title, description, priority, assignee, tags, status, agent } = req.body
        if (!title) {
          return res.status(400).json({ error: 'Title is required' })
        }
        
        const taskId = 'task-' + Math.random().toString(36).substr(2, 9)
        await this.store.docHandle.change(doc => {
          if (!doc.tasks) doc.tasks = {}
          doc.tasks[taskId] = {
            id: taskId,
            title,
            description: description || '',
            priority: priority || 'p2',
            assignee: assignee || null,
            tags: tags || [],
            status: status || 'todo',
            type: 'task',
            order: Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          if (!doc.activity) doc.activity = []
          doc.activity.push({
            id: Math.random().toString(16).slice(2),
            type: 'task_created',
            agent: agent || 'api',
            taskId,
            timestamp: new Date().toISOString()
          })
        })
        
        // Broadcast update
        this.broadcastDocumentUpdate()
        
        res.json({ success: true, taskId })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    // Update task (from CLI or other sources)
    this.app.patch('/automerge/task/:taskId', async (req, res) => {
      try {
        const { taskId } = req.params
        const { status, assignee, title, description, priority, agent } = req.body
        
        const doc = this.store.getDoc()
        if (!doc.tasks?.[taskId]) {
          return res.status(404).json({ error: `Task ${taskId} not found` })
        }
        
        const changes = []
        
        await this.store.docHandle.change(doc => {
          if (status && doc.tasks[taskId].status !== status) {
            changes.push({ field: 'status', old: doc.tasks[taskId].status, new: status })
            doc.tasks[taskId].status = status
          }
          if (assignee !== undefined && doc.tasks[taskId].assignee !== assignee) {
            changes.push({ field: 'assignee', old: doc.tasks[taskId].assignee, new: assignee })
            doc.tasks[taskId].assignee = assignee || null
          }
          if (title && doc.tasks[taskId].title !== title) {
            changes.push({ field: 'title', old: doc.tasks[taskId].title, new: title })
            doc.tasks[taskId].title = title
          }
          if (description !== undefined && doc.tasks[taskId].description !== description) {
            changes.push({ field: 'description', old: doc.tasks[taskId].description, new: description })
            doc.tasks[taskId].description = description
          }
          if (priority && doc.tasks[taskId].priority !== priority) {
            changes.push({ field: 'priority', old: doc.tasks[taskId].priority, new: priority })
            doc.tasks[taskId].priority = priority
          }
          
          if (changes.length > 0) {
            doc.tasks[taskId].updated_at = new Date().toISOString()
            
            if (!doc.activity) doc.activity = []
            doc.activity.push({
              id: Math.random().toString(16).slice(2),
              type: 'task_updated',
              agent: agent || 'api',
              taskId,
              // Detailed changes tracked in taskHistory, not here
              timestamp: new Date().toISOString()
            })
          }
        })
        
        // Record to taskHistory for Patchwork diff tracking
        if (changes.length > 0) {
          await this.store.recordTaskChange(taskId, changes, agent || 'api')
        }
        
        this.broadcastDocumentUpdate()
        res.json({ success: true, taskId, changes })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    // ─── Patchwork: Task History ───
    this.app.get('/automerge/task/:taskId/history', async (req, res) => {
      try {
        const { taskId } = req.params
        const history = await this.store.getTaskHistory(taskId)
        res.json({ history })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // ─── Patchwork: Create Branch ───
    this.app.post('/automerge/task/:taskId/branch', async (req, res) => {
      try {
        const { taskId } = req.params
        const { branchName, agent } = req.body
        if (!branchName) {
          return res.status(400).json({ error: 'branchName required' })
        }
        const branchId = await this.store.createBranch(taskId, branchName, agent || 'api')
        if (!branchId) {
          return res.status(404).json({ error: `Task ${taskId} not found` })
        }
        this.broadcastDocumentUpdate()
        res.json({ success: true, branchId, parentId: taskId, branchName })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // ─── Patchwork: List Branches ───
    this.app.get('/automerge/task/:taskId/branches', async (req, res) => {
      try {
        const { taskId } = req.params
        const branches = await this.store.getBranches(taskId)
        res.json({ branches })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // ─── Patchwork: Merge Branch ───
    this.app.post('/automerge/branch/:branchId/merge', async (req, res) => {
      try {
        const { branchId } = req.params
        const { agent } = req.body
        const result = await this.store.mergeBranch(branchId, agent || 'api')
        if (!result.success) {
          return res.status(400).json({ error: result.error })
        }
        this.broadcastDocumentUpdate()
        res.json(result)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    console.log('🌐 HTTP API routes configured')
  }
  
  setupWebSocketServer() {
    this.wss = new WebSocketServer({ noServer: true })
    this.wsHttpServer = createServer((req, res) => {
      const origin = req.headers.origin

      if (!this.isAllowedOrigin(origin)) {
        this.recordSecurityEvent(
          'wsOriginRejected',
          `Rejected WS HTTP request ${req.method} ${req.url} from origin ${origin}`
        )
        res.statusCode = 403
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: `Origin not allowed: ${origin}` }))
        return
      }

      this.applyCorsHeaders(res, origin)
      res.statusCode = 426
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Expected WebSocket upgrade' }))
    })

    this.wsHttpServer.on('upgrade', (req, socket, head) => {
      socket.on('error', () => {})
      this.cleanupExpiredWsTickets()

      const origin = req.headers.origin
      if (!this.isAllowedOrigin(origin)) {
        this.recordSecurityEvent(
          'wsOriginRejected',
          `Rejected WS upgrade ${req.url} from origin ${origin}`
        )
        this.rejectWebSocketUpgrade(socket, 403, 'Forbidden', { error: `Origin not allowed: ${origin}` })
        return
      }

      if (!this.isAuthorizedWebSocketRequest(req)) {
        this.recordSecurityEvent(
          'wsUnauthorized',
          `Rejected unauthorized WS upgrade ${req.url}`
        )
        this.rejectWebSocketUpgrade(socket, 401, 'Unauthorized', { error: 'Unauthorized' })
        return
      }

      this.wss.handleUpgrade(req, socket, head, ws => {
        this.wss.emit('connection', ws, req)
      })
    })
    
    this.wss.on('connection', (ws, req) => {
      console.log('🔌 Frontend client connected')
      this.connectedClients.add(ws)
      
      // Send current document state immediately
      const doc = this.store.getDoc()
      ws.send(JSON.stringify({
        type: 'document-state',
        doc: doc
      }))
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString())
          await this.handleClientMessage(ws, data)
        } catch (error) {
          console.error('❌ WebSocket message error:', error)
          ws.send(JSON.stringify({
            type: 'error',
            error: error.message
          }))
        }
      })
      
      ws.on('close', () => {
        console.log('🔌 Frontend client disconnected')
        this.connectedClients.delete(ws)
      })
    })
    
    console.log('🔄 WebSocket server configured')
  }

  rejectWebSocketUpgrade(socket, statusCode, statusText, payload) {
    const body = JSON.stringify(payload)
    socket.write(
      `HTTP/1.1 ${statusCode} ${statusText}\r\n` +
      'Connection: close\r\n' +
      'Content-Type: application/json\r\n' +
      `Content-Length: ${Buffer.byteLength(body)}\r\n` +
      '\r\n' +
      body
    )
    socket.destroy()
  }
  
  async handleClientMessage(ws, data) {
    switch (data.type) {
      case 'document-change':
        console.log('🔄 Applying frontend change:', data.change?.type)
        
        if (!data.change) break
        
        // Handle task update
        if (data.change.type === 'task-update') {
          await this.store.docHandle.change(doc => {
            const { taskId, updates } = data.change
            if (doc.tasks[taskId]) {
              Object.assign(doc.tasks[taskId], updates)
              doc.tasks[taskId].updated_at = new Date().toISOString()
              
              if (!doc.activity) doc.activity = []
              doc.activity.push({
                id: Math.random().toString(16).slice(2),
                type: 'task_updated',
                agent: data.agent || 'ui',
                taskId,
                changes: updates,
                timestamp: new Date().toISOString()
              })
            }
          })
          this.broadcastDocumentUpdate(ws)
        }
        
        // Handle task create
        if (data.change.type === 'task-create') {
          await this.store.docHandle.change(doc => {
            const { task } = data.change
            if (!doc.tasks) doc.tasks = {}
            doc.tasks[task.id] = {
              ...task,
              created_at: task.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            if (!doc.activity) doc.activity = []
            doc.activity.push({
              id: Math.random().toString(16).slice(2),
              type: 'task_created',
              agent: data.agent || 'ui',
              taskId: task.id,
              timestamp: new Date().toISOString()
            })
          })
          console.log('✅ Task created:', data.change.task.id)
          this.broadcastDocumentUpdate(ws)
        }
        
        // Handle comment add
        if (data.change.type === 'comment-add') {
          const { taskId, comment } = data.change
          await this.store.addComment(taskId, comment.text, comment.agent)
          console.log('✅ Comment added to task:', taskId)
          // Don't exclude sender - UI doesn't do optimistic updates for comments
          this.broadcastDocumentUpdate(null)
        }
        break
        
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break
        
      default:
        console.log('⚠️ Unknown message type:', data.type)
    }
  }
  
  broadcastDocumentUpdate(excludeClient = null) {
    const doc = this.store.getDoc()
    const message = JSON.stringify({
      type: 'document-update',
      doc: doc,
      timestamp: new Date().toISOString()
    })
    
    this.connectedClients.forEach(client => {
      if (client !== excludeClient && client.readyState === client.OPEN) {
        client.send(message)
      }
    })
  }
  
  async initializeDefaultAgents() {
    try {
      // Check if agents already exist
      const existingAgents = await this.store.getAgents()
      if (existingAgents.length > 0) {
        console.log(`✅ ${existingAgents.length} agents already registered`)
        return
      }
      
      // Register default agents
      await this.store.registerAgent('gary', 'agent:main:main', 'Lead')
      await this.store.registerAgent('friday', 'agent:developer:main', 'Developer')
      await this.store.registerAgent('writer', 'agent:writer:main', 'Content Writer')
      
      console.log('✅ Default agents registered')
    } catch (error) {
      console.error('❌ Failed to initialize agents:', error)
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = new AutomergeSyncServer()
  server.start().catch(console.error)
}

export default AutomergeSyncServer
