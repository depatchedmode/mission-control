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
  
  // ─────────────────────────────────────────
  // Patchwork Features
  // ─────────────────────────────────────────
  
  // Enhanced timeline with comments and context
  async getTimeline(options = {}) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    
    let activity = [...(doc.activity || [])]
    
    // Apply filters
    if (options.task) {
      activity = activity.filter(item => item.task_id === options.task)
    }
    
    if (options.agent) {
      activity = activity.filter(item => item.agent === options.agent.toLowerCase())
    }
    
    // Sort by timestamp (newest first)
    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    // Apply limit
    if (options.limit) {
      activity = activity.slice(0, options.limit)
    }
    
    return activity
  }
  
  // Get task change history
  async getTaskHistory(taskId) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    
    // Get activity for this task
    const activity = (doc.activity || [])
      .filter(a => a.task_id === taskId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    
    // Get task history from snapshots if available
    const history = (doc.taskHistory || {})[taskId] || []
    
    // Combine activity with history entries
    const combined = history.map(h => ({
      timestamp: h.timestamp,
      agent: h.agent,
      changes: h.changes || []
    }))
    
    // If no explicit history, derive from activity
    if (combined.length === 0 && activity.length > 0) {
      // Return activity-based history
      return activity.map(a => ({
        timestamp: a.timestamp,
        agent: a.agent,
        changes: [{ field: a.type, old: null, new: a.details || a.type }]
      }))
    }
    
    return combined
  }
  
  // Record a task change for history tracking
  async recordTaskChange(taskId, changes, agent) {
    await this.ensureReady()
    
    await this.docHandle.change(doc => {
      if (!doc.taskHistory) {
        doc.taskHistory = {}
      }
      if (!doc.taskHistory[taskId]) {
        doc.taskHistory[taskId] = []
      }
      
      doc.taskHistory[taskId].push({
        timestamp: new Date().toISOString(),
        agent,
        changes
      })
    })
  }
  
  // Create a task branch for experimentation
  async createBranch(taskId, branchName, agent) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    
    const parentTask = doc.tasks[taskId]
    if (!parentTask) {
      return null
    }
    
    const branchId = genId('clawd-')
    
    await this.docHandle.change(doc => {
      // Create branch task (copy of parent)
      doc.tasks[branchId] = {
        ...JSON.parse(JSON.stringify(parentTask)),
        id: branchId,
        title: `[Branch: ${branchName}] ${parentTask.title}`,
        branch_of: taskId,
        branch_name: branchName,
        created_by: agent,
        created_at: new Date().toISOString(),
        merged: false
      }
      
      // Track branches on parent
      if (!doc.tasks[taskId].branches) {
        doc.tasks[taskId].branches = []
      }
      doc.tasks[taskId].branches.push(branchId)
      
      // Log activity
      doc.activity.push({
        id: genId('a'),
        type: 'task_branched',
        task_id: taskId,
        branch_id: branchId,
        branch_name: branchName,
        agent,
        timestamp: new Date().toISOString()
      })
    })
    
    return branchId
  }
  
  // Get branches of a task
  async getBranches(taskId) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    
    const task = doc.tasks[taskId]
    if (!task || !task.branches) {
      return []
    }
    
    return task.branches.map(branchId => {
      const branch = doc.tasks[branchId]
      return branch ? {
        id: branchId,
        branch_name: branch.branch_name,
        created_by: branch.created_by,
        created_at: branch.created_at,
        merged: branch.merged,
        merged_at: branch.merged_at
      } : null
    }).filter(Boolean)
  }
  
  // Merge a branch back to parent
  async mergeBranch(branchId, agent) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    
    const branch = doc.tasks[branchId]
    if (!branch || !branch.branch_of) {
      return { success: false, error: 'Not a valid branch' }
    }
    
    if (branch.merged) {
      return { success: false, error: 'Branch already merged' }
    }
    
    const parentId = branch.branch_of
    const parent = doc.tasks[parentId]
    if (!parent) {
      return { success: false, error: 'Parent task not found' }
    }
    
    // Determine what changed in branch vs parent
    const changes = []
    const fieldsToMerge = ['description', 'status', 'assignee', 'type', 'priority']
    
    for (const field of fieldsToMerge) {
      if (branch[field] !== parent[field]) {
        changes.push({
          field,
          old: parent[field],
          new: branch[field]
        })
      }
    }
    
    await this.docHandle.change(doc => {
      // Apply branch changes to parent
      for (const field of fieldsToMerge) {
        if (branch[field] !== undefined) {
          doc.tasks[parentId][field] = branch[field]
        }
      }
      
      // Mark branch as merged
      doc.tasks[branchId].merged = true
      doc.tasks[branchId].merged_at = new Date().toISOString()
      doc.tasks[branchId].merged_by = agent
      
      // Record history
      if (!doc.taskHistory) {
        doc.taskHistory = {}
      }
      if (!doc.taskHistory[parentId]) {
        doc.taskHistory[parentId] = []
      }
      doc.taskHistory[parentId].push({
        timestamp: new Date().toISOString(),
        agent,
        type: 'merge',
        from_branch: branchId,
        changes
      })
      
      // Log activity
      doc.activity.push({
        id: genId('a'),
        type: 'task_merged',
        task_id: parentId,
        branch_id: branchId,
        agent,
        details: `Merged branch: ${branch.branch_name}`,
        timestamp: new Date().toISOString()
      })
    })
    
    return { success: true, parentId, changes }
  }
  
  // Update a task and record history
  async updateTask(taskId, updates, agent) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    
    const task = doc.tasks[taskId]
    if (!task) {
      return { success: false, error: 'Task not found' }
    }
    
    const changes = []
    for (const [field, value] of Object.entries(updates)) {
      if (task[field] !== value) {
        changes.push({ field, old: task[field], new: value })
      }
    }
    
    if (changes.length === 0) {
      return { success: true, changes: [] }
    }
    
    await this.docHandle.change(doc => {
      // Apply updates
      for (const [field, value] of Object.entries(updates)) {
        doc.tasks[taskId][field] = value
      }
      doc.tasks[taskId].updated_at = new Date().toISOString()
      
      // Record history
      if (!doc.taskHistory) {
        doc.taskHistory = {}
      }
      if (!doc.taskHistory[taskId]) {
        doc.taskHistory[taskId] = []
      }
      doc.taskHistory[taskId].push({
        timestamp: new Date().toISOString(),
        agent,
        changes
      })
      
      // Log activity
      doc.activity.push({
        id: genId('a'),
        type: 'task_updated',
        task_id: taskId,
        agent,
        details: changes.map(c => `${c.field}: ${c.old} → ${c.new}`).join(', '),
        timestamp: new Date().toISOString()
      })
    })
    
    return { success: true, changes }
  }
  
  // Close the store
  async close() {
    if (this.repo) {
      this.repo.shutdown()
    }
  }
}