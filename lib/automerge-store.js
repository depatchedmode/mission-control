/**
 * Automerge-based Mission Control Store
 * 
 * Replaces the JSONL-based store with real-time Automerge documents
 */

import { Repo } from '@automerge/automerge-repo'
import { NodeFSStorageAdapter } from './nodefs-storage-adapter.js'
import { createHash, randomBytes } from 'crypto'
import { dirname, join } from 'path'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { activityTaskId } from './activity-task-id.js'
import { taskRecordTaskId } from './task-record-task-id.js'

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

function normalizeTaskScopedRecord(record) {
  if (!record || typeof record !== 'object') return record
  const taskId = taskRecordTaskId(record)
  if (!taskId) return { ...record }

  const normalized = { ...record, taskId }
  delete normalized.task_id
  return normalized
}

function normalizeTaskScopedRecordMap(records) {
  if (!records || typeof records !== 'object') return records

  const normalized = {}
  for (const [id, record] of Object.entries(records)) {
    normalized[id] = normalizeTaskScopedRecord(record)
  }
  return normalized
}

function buildMentionIdempotencyKey(mention) {
  if (!mention || typeof mention !== 'object') return undefined

  const commentId = typeof mention.comment_id === 'string' ? mention.comment_id : ''
  const toAgent = typeof mention.to_agent === 'string' ? mention.to_agent.toLowerCase() : ''

  if (!commentId || !toAgent) return undefined

  return createHash('sha256')
    .update(`${commentId}:${toAgent}`)
    .digest('hex')
}

function normalizeMentionRecord(record) {
  const normalized = normalizeTaskScopedRecord(record)
  if (!normalized || typeof normalized !== 'object') return normalized

  const idempotencyKey = normalized.idempotency_key || buildMentionIdempotencyKey(normalized)
  if (!idempotencyKey) return normalized

  return { ...normalized, idempotency_key: idempotencyKey }
}

function normalizeMentionRecordMap(records) {
  if (!records || typeof records !== 'object') return records

  const normalized = {}
  for (const [id, record] of Object.entries(records)) {
    normalized[id] = normalizeMentionRecord(record)
  }
  return normalized
}

function parseIsoTime(value) {
  if (typeof value !== 'string' || !value) return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

function isMentionClaimActive(mention, nowMs = Date.now()) {
  if (!mention || typeof mention !== 'object') return false
  if (mention.delivered) return false
  if (typeof mention.delivery_claim_token !== 'string' || !mention.delivery_claim_token) {
    return false
  }

  const expiresAtMs = parseIsoTime(mention.delivery_claim_expires_at)
  if (expiresAtMs === null) return false
  return expiresAtMs > nowMs
}

function clearMentionClaim(mention) {
  delete mention.delivery_claim_token
  delete mention.delivery_claimed_at
  delete mention.delivery_claim_expires_at
}

function applyMentionClaim(mention, claimToken, claimExpiresAt, nowIso) {
  mention.delivery_claim_token = claimToken
  mention.delivery_claimed_at = nowIso
  mention.delivery_claim_expires_at = claimExpiresAt
  mention.delivery_attempt_count = Number(mention.delivery_attempt_count || 0) + 1
  mention.last_delivery_attempt_at = nowIso
  delete mention.last_delivery_error
}

export class AutomergeStore {
  constructor(options = {}) {
    const env = options.env ?? process.env
    const envStoragePath = env.MC_STORAGE_PATH
    this.storagePath = options.storagePath ||
      (envStoragePath ? join(envStoragePath, '.mission-control') : join(process.cwd(), '.mission-control'))
    this.urlFile = options.urlFile ??
      (options.storagePath || envStoragePath
        ? join(this.storagePath, 'document-url')
        : join(process.cwd(), '.mission-control-url'))
    this.usePersistedUrl = options.usePersistedUrl ?? Boolean(this.urlFile)
    this.logger = options.logger ?? console
    this.mentionClaimTtlMs = Number(
      options.mentionClaimTtlMs ?? env.MC_MENTION_CLAIM_TTL_MS ?? 30000
    )

    if (!Number.isInteger(this.mentionClaimTtlMs) || this.mentionClaimTtlMs <= 0) {
      throw new Error(`Invalid MC_MENTION_CLAIM_TTL_MS: ${env.MC_MENTION_CLAIM_TTL_MS}`)
    }

    this.repo = new Repo({
      storage: new NodeFSStorageAdapter(this.storagePath),
      sharePolicy: async () => false, // Local-only for now
    })
    
    this.docHandle = null
    this.initialized = false
  }
  
  async init() {
    if (this.initialized) return

    try {
      // Check if we have an existing document URL
      if (this.usePersistedUrl && existsSync(this.urlFile)) {
        const existingUrl = readFileSync(this.urlFile, 'utf-8').trim()
        this.logger.log?.('📂 Loading existing Mission Control document:', existingUrl)
        
        // repo.find() returns a Promise that resolves to the DocHandle
        this.docHandle = await this.repo.find(existingUrl)
        
        const doc = this.docHandle.doc()
        this.logger.log?.('✅ Document loaded:', {
          tasks: Object.keys(doc.tasks || {}).length,
          agents: Object.keys(doc.agents || {}).length,
          activity: (doc.activity || []).length
        })
      } else {
        // Create new document
        this.logger.log?.('🆕 Creating new Mission Control document...')
        this.docHandle = this.repo.create()
        
        // Initialize document structure
        this.docHandle.change(doc => {
          doc.name = 'Mission Control'
          doc.tasks = {}
          doc.moves = {}
          doc.games = {}
          doc.agents = {}
          doc.comments = {}
          doc.mentions = {}
          doc.activity = []
          doc.created_at = new Date().toISOString()
        })
        
        // Persist the URL for future loads
        if (this.usePersistedUrl) {
          mkdirSync(dirname(this.urlFile), { recursive: true })
          writeFileSync(this.urlFile, this.docHandle.url)
          this.logger.log?.(`💾 Document URL saved to ${this.urlFile}`)
        }
      }
      
      this.initialized = true
      this.logger.log?.('🚀 Automerge store ready with URL:', this.docHandle.url)
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
        taskId,
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
          idempotency_key: buildMentionIdempotencyKey({
            comment_id: commentId,
            to_agent: mentionedAgent,
          }),
          taskId,
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
        taskId,
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
      .filter(comment => taskRecordTaskId(comment) === taskId)
      .map(comment => normalizeTaskScopedRecord(comment))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }
  
  // Get pending mentions for agent
  async getPendingMentions(agent = null) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    const nowMs = Date.now()
    
    let mentions = Object.values(doc.mentions || {})
      .filter(mention => !mention.delivered && !isMentionClaimActive(mention, nowMs))
      .map(mention => normalizeMentionRecord(mention))
    
    if (agent) {
      mentions = mentions.filter(mention => 
        mention.to_agent === agent.toLowerCase()
      )
    }
    
    return mentions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }

  async claimMentionDelivery(mentionId) {
    await this.ensureReady()

    const nowMs = Date.now()
    const nowIso = new Date(nowMs).toISOString()
    const claimToken = randomBytes(16).toString('hex')
    const claimExpiresAt = new Date(nowMs + this.mentionClaimTtlMs).toISOString()
    const result = {
      claimed: false,
      claimToken: null,
      claimExpiresAt: null,
    }

    await this.docHandle.change(doc => {
      const mention = doc.mentions?.[mentionId]
      if (!mention || mention.delivered || isMentionClaimActive(mention, nowMs)) return

      applyMentionClaim(mention, claimToken, claimExpiresAt, nowIso)

      result.claimed = true
      result.claimToken = claimToken
      result.claimExpiresAt = claimExpiresAt
    })

    return result
  }

  async claimNextMentionDelivery(agent) {
    await this.ensureReady()

    const normalizedAgent = typeof agent === 'string' ? agent.trim().toLowerCase() : ''
    const nowMs = Date.now()
    const nowIso = new Date(nowMs).toISOString()
    const claimToken = randomBytes(16).toString('hex')
    const claimExpiresAt = new Date(nowMs + this.mentionClaimTtlMs).toISOString()
    const result = {
      mention: null,
      claimed: false,
      claimToken: null,
      claimExpiresAt: null,
    }

    if (!normalizedAgent) {
      return result
    }

    await this.docHandle.change(doc => {
      const candidates = Object.values(doc.mentions || {})
        .filter(mention => {
          if (!mention || mention.delivered) return false
          if (typeof mention.to_agent !== 'string') return false
          if (mention.to_agent.toLowerCase() !== normalizedAgent) return false
          return !isMentionClaimActive(mention, nowMs)
        })
        .sort((a, b) => {
          const timeDiff = (parseIsoTime(a.timestamp) ?? Number.MAX_SAFE_INTEGER) -
            (parseIsoTime(b.timestamp) ?? Number.MAX_SAFE_INTEGER)
          if (timeDiff !== 0) return timeDiff
          return String(a.id || '').localeCompare(String(b.id || ''))
        })

      const mention = candidates[0]
      if (!mention) return

      applyMentionClaim(mention, claimToken, claimExpiresAt, nowIso)

      result.mention = normalizeMentionRecord({ ...mention })
      result.claimed = true
      result.claimToken = claimToken
      result.claimExpiresAt = claimExpiresAt
    })

    return result
  }

  async releaseMentionDelivery(mentionId, claimToken, error = null) {
    await this.ensureReady()
    const nowMs = Date.now()

    const result = {
      released: false,
      staleClaim: false,
    }

    await this.docHandle.change(doc => {
      const mention = doc.mentions?.[mentionId]
      if (!mention || mention.delivered) return
      if (!mention.delivery_claim_token) return
      if (claimToken !== mention.delivery_claim_token) {
        result.staleClaim = true
        return
      }
      if (!isMentionClaimActive(mention, nowMs)) {
        result.staleClaim = true
        return
      }

      clearMentionClaim(mention)
      if (typeof error === 'string' && error) {
        mention.last_delivery_error = error
      }
      result.released = true
    })

    return result
  }
  
  // Mark mention as delivered
  async markMentionDelivered(mentionId, claimToken) {
    await this.ensureReady()
    const nowMs = Date.now()
    const result = {
      delivered: false,
      staleClaim: false,
    }
    
    await this.docHandle.change(doc => {
      const mention = doc.mentions?.[mentionId]
      if (!mention) return
      if (mention.delivered) {
        result.delivered = true
        return
      }
      if (!mention.delivery_claim_token) return
      if (claimToken !== mention.delivery_claim_token) {
        result.staleClaim = true
        return
      }
      if (!isMentionClaimActive(mention, nowMs)) {
        result.staleClaim = true
        return
      }

      clearMentionClaim(mention)
      delete mention.last_delivery_error
      mention.delivered = true
      result.delivered = true
    })

    return result
  }
  
  // Get activity feed
  async getActivity(options = {}) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    
    let activity = [...(doc.activity || [])]
    
    // Apply filters
    if (options.task) {
      activity = activity.filter(item => activityTaskId(item) === options.task)
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
  async registerAgent(name, role = '') {
    await this.ensureReady()
    
    await this.docHandle.change(doc => {
      const agentRecord = {
        name,
        role,
        status: 'idle',
        registered_at: new Date().toISOString()
      }
      doc.agents[name] = agentRecord
      
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
    const doc = JSON.parse(JSON.stringify(this.docHandle.doc()))
    doc.comments = normalizeTaskScopedRecordMap(doc.comments || {})
    doc.mentions = normalizeMentionRecordMap(doc.mentions || {})
    return doc
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
      activity = activity.filter(item => activityTaskId(item) === options.task)
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
    
    const activity = (doc.activity || [])
      .filter(a => activityTaskId(a) === taskId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    
    // Get explicit task history from Patchwork tracking
    const history = (doc.taskHistory || {})[taskId] || []
    
    // Filter to only entries that have actual changes
    const explicitHistory = history
      .filter(h => h.changes && h.changes.length > 0)
      .map(h => ({
        timestamp: h.timestamp,
        agent: h.agent,
        changes: h.changes
      }))
    
    // If we have explicit Patchwork history, use it as the source of truth
    if (explicitHistory.length > 0) {
      return explicitHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    }
    
    // Fall back: derive from activity entries that have structured changes
    const activityHistory = activity
      .filter(a => a.type === 'task_updated' && a.changes && a.changes.length > 0)
      .map(a => ({
        timestamp: a.timestamp,
        agent: a.agent,
        changes: a.changes
      }))
    
    if (activityHistory.length > 0) {
      return activityHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    }
    
    // Last resort: raw activity types
    if (activity.length > 0) {
      return activity.map(a => ({
        timestamp: a.timestamp,
        agent: a.agent,
        changes: [{ field: a.type, old: null, new: a.details || a.type }]
      }))
    }
    
    return []
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
  
  // Record a commit linked to a task
  async recordCommit(taskId, commitData, agent) {
    await this.ensureReady()
    
    const timestamp = new Date().toISOString()
    
    await this.docHandle.change(doc => {
      // Add to task history
      if (!doc.taskHistory) {
        doc.taskHistory = {}
      }
      if (!doc.taskHistory[taskId]) {
        doc.taskHistory[taskId] = []
      }
      
      doc.taskHistory[taskId].push({
        timestamp,
        agent,
        type: 'commit',
        commit: {
          hash: commitData.hash,
          shortHash: commitData.hash.substring(0, 8),
          message: commitData.message,
          diff: commitData.diff || null
        }
      })
      
      // Add to activity feed
      if (!doc.activity) {
        doc.activity = []
      }
      
      const msgPreview = commitData.message.split('\n')[0].substring(0, 60)
      
      doc.activity.push({
        id: `commit-${commitData.hash.substring(0, 8)}-${Date.now()}`,
        type: 'commit_linked',
        timestamp,
        agent,
        taskId,
        details: `${commitData.hash.substring(0, 8)} "${msgPreview}"`,
        commitHash: commitData.hash
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
        taskId,
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
      
      // Mark branch as merged and completed
      doc.tasks[branchId].merged = true
      doc.tasks[branchId].merged_at = new Date().toISOString()
      doc.tasks[branchId].merged_by = agent
      doc.tasks[branchId].status = 'completed'
      
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
        taskId: parentId,
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
      if (!doc.activity) doc.activity = []
      doc.activity.push({
        id: genId('a'),
        type: 'task_updated',
        taskId,
        agent,
        details: changes.map(c => `${c.field}: ${c.old} → ${c.new}`).join(', '),
        timestamp: new Date().toISOString()
      })
    })
    
    return { success: true, changes }
  }
  
  // ─────────────────────────────────────────
  // Moves & Games
  // ─────────────────────────────────────────

  // Create a move — an atomic unit of work, never larger than a branch
  async createMove({ title, description, branch, gameId, agent }) {
    await this.ensureReady()

    const moveId = genId('move-')
    const timestamp = new Date().toISOString()

    await this.docHandle.change(doc => {
      if (!doc.moves) doc.moves = {}

      doc.moves[moveId] = {
        id: moveId,
        title,
        description: description || '',
        status: 'proposed',
        branch: branch || null,
        gameId: gameId || null,
        agent: agent || null,
        created_at: timestamp,
        updated_at: timestamp
      }

      if (!doc.activity) doc.activity = []
      doc.activity.push({
        id: genId('a'),
        type: 'move_created',
        moveId,
        gameId: gameId || null,
        agent: agent || null,
        timestamp
      })
    })

    return moveId
  }

  // Get a single move by ID
  async getMove(moveId) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    return (doc.moves || {})[moveId] || null
  }

  // List moves, with optional filters
  async getMoves(options = {}) {
    await this.ensureReady()
    const doc = this.docHandle.doc()

    let moves = Object.values(doc.moves || {})

    if (options.gameId) {
      moves = moves.filter(m => m.gameId === options.gameId)
    }
    if (options.status) {
      const statuses = options.status.split(',').map(s => s.trim())
      moves = moves.filter(m => statuses.includes(m.status))
    }
    if (options.agent) {
      moves = moves.filter(m => m.agent === options.agent)
    }

    return moves.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  // Update a move and record history
  async updateMove(moveId, updates, agent) {
    await this.ensureReady()
    const doc = this.docHandle.doc()

    const move = (doc.moves || {})[moveId]
    if (!move) {
      return { success: false, error: 'Move not found' }
    }

    const changes = []
    for (const [field, value] of Object.entries(updates)) {
      if (move[field] !== value) {
        changes.push({ field, old: move[field], new: value })
      }
    }

    if (changes.length === 0) {
      return { success: true, changes: [] }
    }

    await this.docHandle.change(doc => {
      if (!doc.moves) doc.moves = {}
      for (const [field, value] of Object.entries(updates)) {
        doc.moves[moveId][field] = value
      }
      doc.moves[moveId].updated_at = new Date().toISOString()

      if (!doc.activity) doc.activity = []
      doc.activity.push({
        id: genId('a'),
        type: 'move_updated',
        moveId,
        agent,
        details: changes.map(c => `${c.field}: ${c.old} → ${c.new}`).join(', '),
        timestamp: new Date().toISOString()
      })
    })

    return { success: true, changes }
  }

  // Record a commit linked to a move
  async recordMoveCommit(moveId, commitData, agent) {
    await this.ensureReady()
    const timestamp = new Date().toISOString()

    await this.docHandle.change(doc => {
      if (!doc.activity) doc.activity = []

      const msgPreview = commitData.message.split('\n')[0].substring(0, 60)

      doc.activity.push({
        id: `commit-${commitData.hash.substring(0, 8)}-${Date.now()}`,
        type: 'commit_linked',
        timestamp,
        agent,
        moveId,
        details: `${commitData.hash.substring(0, 8)} "${msgPreview}"`,
        commitHash: commitData.hash
      })
    })
  }

  // Create a game — a collection of related moves pursuing an endgame
  async createGame({ title, description, endgame, agent }) {
    await this.ensureReady()

    const gameId = genId('game-')
    const timestamp = new Date().toISOString()

    await this.docHandle.change(doc => {
      if (!doc.games) doc.games = {}

      doc.games[gameId] = {
        id: gameId,
        title,
        description: description || '',
        endgame: endgame || '',
        status: 'active',
        agent: agent || null,
        created_at: timestamp,
        updated_at: timestamp
      }

      if (!doc.activity) doc.activity = []
      doc.activity.push({
        id: genId('a'),
        type: 'game_created',
        gameId,
        agent: agent || null,
        timestamp
      })
    })

    return gameId
  }

  // Get a single game by ID
  async getGame(gameId) {
    await this.ensureReady()
    const doc = this.docHandle.doc()
    return (doc.games || {})[gameId] || null
  }

  // List games, with optional filters
  async getGames(options = {}) {
    await this.ensureReady()
    const doc = this.docHandle.doc()

    let games = Object.values(doc.games || {})

    if (options.status) {
      const statuses = options.status.split(',').map(s => s.trim())
      games = games.filter(g => statuses.includes(g.status))
    }

    return games.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  // Update a game
  async updateGame(gameId, updates, agent) {
    await this.ensureReady()
    const doc = this.docHandle.doc()

    const game = (doc.games || {})[gameId]
    if (!game) {
      return { success: false, error: 'Game not found' }
    }

    const changes = []
    for (const [field, value] of Object.entries(updates)) {
      if (game[field] !== value) {
        changes.push({ field, old: game[field], new: value })
      }
    }

    if (changes.length === 0) {
      return { success: true, changes: [] }
    }

    await this.docHandle.change(doc => {
      if (!doc.games) doc.games = {}
      for (const [field, value] of Object.entries(updates)) {
        doc.games[gameId][field] = value
      }
      doc.games[gameId].updated_at = new Date().toISOString()

      if (!doc.activity) doc.activity = []
      doc.activity.push({
        id: genId('a'),
        type: 'game_updated',
        gameId,
        agent,
        details: changes.map(c => `${c.field}: ${c.old} → ${c.new}`).join(', '),
        timestamp: new Date().toISOString()
      })
    })

    return { success: true, changes }
  }

  // Get moves belonging to a game (derived, not stored on game)
  async getGameMoves(gameId) {
    return this.getMoves({ gameId })
  }

  // Close the store
  async close() {
    if (this.repo) {
      await this.repo.shutdown()
    }
  }
}
