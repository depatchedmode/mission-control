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
    
    // Sync with beans backend (import tasks)
    this.app.post('/automerge/sync-beans', async (req, res) => {
      try {
        console.log('🔄 Syncing with beans backend...')
        
        // Fetch tasks from beans API
        const beansResponse = await fetch('http://localhost:8003/beans')
        if (!beansResponse.ok) {
          throw new Error(`Beans API error: ${beansResponse.status}`)
        }
        
        const tasks = await beansResponse.json()
        console.log(`📋 Retrieved ${tasks.length} tasks from beans`)
        
        // Update Automerge document with backend tasks
        await this.store.docHandle.change(doc => {
          // Initialize structure if needed
          if (!doc.tasks) doc.tasks = {}
          if (!doc.backend_sync) doc.backend_sync = {}
          
          // Update each task
          tasks.forEach((task, index) => {
            const existingTask = doc.tasks[task.id]
            
            // Preserve spatial layout if task exists
            let x = 50, y = 100
            if (existingTask) {
              x = existingTask.x
              y = existingTask.y
            } else {
              // New task: position based on status
              const statusGroups = { 'todo': 0, 'in-progress': 1, 'completed': 2 }
              const statusGroup = statusGroups[task.status] || 0
              const itemsInGroup = tasks.filter(t => t.status === task.status)
              const indexInGroup = itemsInGroup.findIndex(t => t.id === task.id)
              
              x = 50 + (statusGroup * 350)
              y = 100 + (indexInGroup * 160)
            }
            
            doc.tasks[task.id] = {
              id: task.id,
              title: task.title,
              status: task.status,
              assignee: existingTask?.assignee || null,
              type: task.type || 'task',
              description: task.slug || '',
              x: x,
              y: y,
              width: existingTask?.width || 280,
              height: existingTask?.height || 140,
              priority: task.priority || 'normal',
              created_at: task.created_at,
              updated_at: task.updated_at
            }
          })
          
          doc.backend_sync.last_beans_sync = new Date().toISOString()
          doc.backend_sync.tasks_imported = tasks.length
        })
        
        console.log('✅ Backend sync complete')
        
        // Broadcast update to connected clients
        this.broadcastDocumentUpdate()
        
        res.json({ 
          success: true, 
          synced: tasks.length,
          timestamp: new Date().toISOString()
        })
        
      } catch (error) {
        console.error('❌ Beans sync failed:', error)
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
        // Apply change from frontend to backend store
        console.log('🔄 Applying frontend change to backend')
        
        // For now, we'll handle specific change types
        if (data.change && data.change.type === 'task-update') {
          await this.store.docHandle.change(doc => {
            const { taskId, updates } = data.change
            if (doc.tasks[taskId]) {
              Object.assign(doc.tasks[taskId], updates)
              
              // Log activity
              if (!doc.activity) doc.activity = []
              doc.activity.push({
                id: Math.random().toString(16).slice(2),
                type: 'task_updated_frontend',
                agent: data.agent || 'unknown',
                taskId,
                changes: updates,
                timestamp: new Date().toISOString()
              })
            }
          })
          
          // Broadcast to other clients
          this.broadcastDocumentUpdate(ws) // exclude sender
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