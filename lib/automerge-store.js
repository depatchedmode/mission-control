/**
 * Automerge-based Mission Control Store
 * 
 * Replaces the JSONL-based store with real-time Automerge documents
 */

import { Repo } from '@automerge/automerge-repo'
import { NodeFSStorageAdapter } from '@automerge/automerge-repo-storage-nodefs'
import { randomBytes } from 'crypto'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

// Generate short ID
function genId(prefix = '') {
  return prefix + randomBytes(4).toString('hex')
}

// Parse @mentions from text
function parseMentions(text) {
  const mentions = []
  const regex = /@(\w+)/g
  let match
  while ((match = regex.exec(text)) !== null) {
    mentions.push(match[1].toLowerCase())
  }
  return [...new Set(mentions)] // dedupe
}

export class AutomergeStore {
  constructor() {
    this.repo = new Repo({
      storage: new NodeFSStorageAdapter(join(process.cwd(), '.mission-control')),
      sharePolicy: async () => false, // Local-only for now
    })
    
    this.docHandle = null
    this.initialized = false
  }
  
  async init() {
    if (this.initialized) return
    
    const urlFile = join(process.cwd(), '.mission-control-url')
    
    try {
      // Check if we have an existing document URL
      if (existsSync(urlFile)) {
        const existingUrl = readFileSync(urlFile, 'utf-8').trim()
        console.log('📂 Loading existing Mission Control document:', existingUrl)
        
        // repo.find() returns a Promise that resolves to the DocHandle
        this.docHandle = await this.repo.find(existingUrl)
        
        const doc = this.docHandle.doc()
        console.log('✅ Document loaded:', {
          tasks: Object.keys(doc.tasks || {}).length,
          agents: Object.keys(doc.agents || {}).length,
          activity: (doc.activity || []).length
        })
      } else {
        // Create new document
        console.log('🆕 Creating new Mission Control document...')
        this.docHandle = this.repo.create()
        
        // Initialize document structure
        this.docHandle.change(doc => {
          doc.name = 'Mission Control'
          doc.tasks = {}
          doc.agents = {}
          doc.comments = {}
          doc.mentions = {}
          doc.activity = []
          doc.created_at = new Date().toISOString()
        })
        
        // Persist the URL for future loads
        writeFileSync(urlFile, this.docHandle.url)
        console.log('💾 Document URL saved to .mission-control-url')
      }
      
      this.initialized = true
      console.log('🚀 Automerge store ready with URL:', this.docHandle.url)
    } catch (err) {
      throw new Error(`Failed to initialize Automerge store: ${err.message}`)
    }
  }
  
  // Ensure store is ready for operations
  async ensureReady() {
    if (!this.initialized) {
      await this.init()
    }
    // Document should be ready immediately after creation
  }
  
  // Add comment to task (replaces JSONL comments)
  async addComment(taskId, text, agent) {
    await this.ensureReady()
    
    const mentions = parseMentions(text)
    const commentId = genId('c')
    
    await this.docHandle.change(doc => {
      // Add comment
      doc.comments[commentId] = {
        id: commentId,
        task_id: taskId,
        agent,
        content: text,
        mentions,
        timestamp: new Date().toISOString()
      }
      
      // Track mentions
      mentions.forEach(mentionedAgent => {
        const mentionId = genId('m')
        doc.mentions[mentionId] = {
          id: mentionId,
          comment_id: commentId,
          task_id: taskId,
          from_agent: agent,
          to_agent: mentionedAgent,
          content: text,
          delivered: false,
          timestamp: new Date().toISOString()
        }
      })
      
      // Log activity
      doc.activity.push({
        id: genId('a'),
        type: 'comment_added',
        task_id: taskId,
        agent,
        comment_id: commentId,
        timestamp: new Date().toISOString()
      })
    })
    
    return commentId
  }
  
  // Get comments for task
  async getComments(taskId) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    
    return Object.values(doc.comments || {})
      .filter(comment => comment.task_id === taskId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }
  
  // Get pending mentions for agent
  async getPendingMentions(agent = null) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    
    let mentions = Object.values(doc.mentions || {})
      .filter(mention => !mention.delivered)
    
    if (agent) {
      mentions = mentions.filter(mention => 
        mention.to_agent === agent.toLowerCase()
      )
    }
    
    return mentions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }
  
  // Mark mention as delivered
  async markMentionDelivered(mentionId) {
    await this.ensureReady()
    
    await this.docHandle.change(doc => {
      if (doc.mentions[mentionId]) {
        doc.mentions[mentionId].delivered = true
      }
    })
  }
  
  // Get activity feed
  async getActivity(options = {}) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    
    let activity = [...(doc.activity || [])]
    
    // Apply filters
    if (options.task) {
      activity = activity.filter(item => item.task_id === options.task)
    }
    
    if (options.agent) {
      activity = activity.filter(item => item.agent === options.agent)
    }
    
    // Sort by timestamp (newest first)
    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    // Apply limit
    if (options.limit) {
      activity = activity.slice(0, options.limit)
    }
    
    return activity
  }
  
  // Agent management
  async registerAgent(name, sessionKey, role = '') {
    await this.ensureReady()
    
    await this.docHandle.change(doc => {
      doc.agents[name] = {
        name,
        session_key: sessionKey,
        role,
        status: 'idle',
        registered_at: new Date().toISOString()
      }
      
      // Log activity
      doc.activity.push({
        id: genId('a'),
        type: 'agent_registered',
        agent: name,
        timestamp: new Date().toISOString()
      })
    })
  }
  
  async getAgent(name) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    return doc.agents[name] || null
  }
  
  async getAgents() {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    return Object.values(doc.agents || {})
  }
  
  async updateAgentStatus(name, status) {
    await this.ensureReady()
    
    await this.docHandle.change(doc => {
      if (doc.agents[name]) {
        doc.agents[name].status = status
        doc.agents[name].updated_at = new Date().toISOString()
      }
    })
  }
  
  // Get current document state (for debugging)
  getDoc() {
    if (!this.docHandle) return null
    return this.docHandle.doc()
  }
  
  // Close the store
  async close() {
    if (this.repo) {
      this.repo.shutdown()
    }
  }
}