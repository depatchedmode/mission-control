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
import cors from 'cors'

const PORT = 8004
const WS_PORT = 8005

class AutomergeSyncServer {
  constructor() {
    this.store = new AutomergeStore()
    this.connectedClients = new Set()
    this.app = express()
    this.wss = null
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
    this.app.listen(PORT, () => {
      console.log(`📡 HTTP API listening on port ${PORT}`)
      console.log(`🌐 WebSocket sync on port ${WS_PORT}`)
      console.log(`🔗 Frontend should connect to ws://localhost:${WS_PORT}`)
    })
    
    // Register default agents if not exists
    await this.initializeDefaultAgents()
  }
  
  setupHTTPAPI() {
    this.app.use(cors())
    this.app.use(express.json())
    
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
        const oldTask = doc.tasks[taskId]
        
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
    this.wss = new WebSocketServer({ port: WS_PORT })
    
    this.wss.on('connection', (ws) => {
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

// Start the server
const server = new AutomergeSyncServer()
server.start().catch(console.error)

export default AutomergeSyncServer