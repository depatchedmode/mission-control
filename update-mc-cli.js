#!/usr/bin/env node

/**
 * Update MC CLI to use Automerge backend
 * Creates a new mc-automerge command that works with migrated data
 */

import { AutomergeStore } from './lib/automerge-store.js'

// Global store instance for CLI commands
let store = null
let initialized = false

async function initStore() {
  if (!initialized) {
    store = new AutomergeStore()
    await store.init()
    
    // Load existing agents if they exist in the document
    const doc = store.getDoc()
    if (!doc.agents || Object.keys(doc.agents).length === 0) {
      await store.registerAgent('gary', 'agent:main:main', 'Lead')
      await store.registerAgent('friday', 'agent:developer:main', 'Software Developer')
      await store.registerAgent('writer', 'agent:writer:main', 'Content Writer')
    }
    
    initialized = true
    console.log(`📡 Mission Control ready - ${Object.keys(store.getDoc().tasks || {}).length} tasks loaded`)
  }
  return store
}

async function handleCommand(args) {
  const [command, subcommand, ...params] = args
  
  try {
    const store = await initStore()
    
    switch (command) {
      case 'tasks':
        await handleTasksCommand(store, subcommand, params)
        break
      case 'comment':
        await handleCommentCommand(store, params)
        break
      case 'comments':
        await handleCommentsCommand(store, params)
        break
      case 'mentions':
        await handleMentionsCommand(store, subcommand, params)
        break
      case 'activity':
        await handleActivityCommand(store, params)
        break
      case 'agents':
        await handleAgentsCommand(store, subcommand, params)
        break
      default:
        showHelp()
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    if (store) {
      await store.close()
    }
  }
}

async function handleTasksCommand(store, subcommand, params) {
  const doc = store.getDoc()
  const tasks = Object.values(doc.tasks || {})
  
  switch (subcommand) {
    case 'list':
      const [statusFilter] = params
      let filteredTasks = tasks
      
      if (statusFilter) {
        filteredTasks = tasks.filter(task => task.status === statusFilter)
      }
      
      console.log(`📋 Tasks${statusFilter ? ` (${statusFilter})` : ''}: ${filteredTasks.length}`)
      filteredTasks.forEach(task => {
        const statusEmoji = task.status === 'completed' ? '✅' : task.status === 'in-progress' ? '🔄' : '⏳'
        console.log(`${statusEmoji} [${task.id}] ${task.title}`)
        console.log(`   Type: ${task.type} | Assignee: ${task.assignee || 'unassigned'}`)
      })
      break
      
    case 'show':
      const [taskId] = params
      const task = tasks.find(t => t.id === taskId)
      
      if (!task) {
        console.log(`❌ Task ${taskId} not found`)
        return
      }
      
      console.log(`📋 Task: ${task.title}`)
      console.log(`   ID: ${task.id}`)
      console.log(`   Status: ${task.status}`)
      console.log(`   Type: ${task.type}`)
      console.log(`   Priority: ${task.priority}`)
      console.log(`   Assignee: ${task.assignee || 'unassigned'}`)
      console.log(`   Created: ${task.created_at}`)
      console.log(`   Updated: ${task.updated_at}`)
      
      if (task.description) {
        console.log(`   Description: ${task.description}`)
      }
      
      if (task.depends_on && task.depends_on.length > 0) {
        console.log(`   Dependencies: ${task.depends_on.join(', ')}`)
      }
      break
      
    default:
      console.log('📊 Task Summary:')
      const byStatus = {}
      tasks.forEach(task => {
        byStatus[task.status] = (byStatus[task.status] || 0) + 1
      })
      
      Object.entries(byStatus).forEach(([status, count]) => {
        const emoji = status === 'completed' ? '✅' : status === 'in-progress' ? '🔄' : '⏳'
        console.log(`   ${emoji} ${status}: ${count}`)
      })
      
      console.log(`   📋 Total: ${tasks.length} tasks`)
  }
}

async function handleCommentCommand(store, params) {
  const [taskId, ...messageParts] = params
  const message = messageParts.join(' ').replace(/^["']|["']$/g, '') // Remove quotes
  
  if (!taskId || !message) {
    console.log('Usage: comment <task-id> "message"')
    return
  }
  
  const commentId = await store.addComment(taskId, message, 'friday') // Default to friday for now
  console.log(`💬 Comment added: ${commentId}`)
}

async function handleCommentsCommand(store, params) {
  const [taskId] = params
  
  if (!taskId) {
    console.log('Usage: comments <task-id>')
    return
  }
  
  const comments = await store.getComments(taskId)
  
  if (comments.length === 0) {
    console.log('No comments yet.')
    return
  }
  
  console.log(`💬 Comments for ${taskId}:`)
  comments.forEach(comment => {
    const timeAgo = Math.floor((Date.now() - new Date(comment.timestamp)) / 1000)
    console.log(`[${comment.agent}] ${timeAgo}s ago`)
    console.log(`   ${comment.content}`)
  })
}

async function handleMentionsCommand(store, subcommand, params) {
  switch (subcommand) {
    case 'pending':
      const agentFlag = params.indexOf('--agent')
      const agent = agentFlag >= 0 ? params[agentFlag + 1] : null
      
      const mentions = await store.getPendingMentions(agent)
      
      if (mentions.length === 0) {
        console.log('No pending mentions.')
        return
      }
      
      console.log(`📬 ${mentions.length} pending mention(s):`)
      mentions.forEach(mention => {
        const timeAgo = Math.floor((Date.now() - new Date(mention.timestamp)) / 1000)
        console.log(`[${mention.id}] @${mention.to_agent} from @${mention.from_agent} on ${mention.task_id}`)
        console.log(`   "${mention.content}"`)
        console.log(`   ${timeAgo}s ago`)
      })
      break
      
    case 'deliver':
      const [mentionId] = params
      if (!mentionId) {
        console.log('Usage: mentions deliver <mention-id>')
        return
      }
      
      await store.markMentionDelivered(mentionId)
      console.log(`✅ Marked ${mentionId} as delivered`)
      break
      
    default:
      console.log('Usage: mentions pending [--agent <name>] | deliver <id>')
  }
}

async function handleActivityCommand(store, params) {
  const limitFlag = params.indexOf('--limit')
  const limit = limitFlag >= 0 ? parseInt(params[limitFlag + 1]) : 20
  
  const activity = await store.getActivity({ limit })
  
  console.log(`📊 Recent activity (${activity.length} events):`)
  activity.forEach(event => {
    const timeAgo = Math.floor((Date.now() - new Date(event.timestamp)) / 1000)
    console.log(`${timeAgo}s ago ${event.type} @${event.agent} [${event.task_id || event.taskId || 'general'}]`)
  })
}

async function handleAgentsCommand(store, subcommand, params) {
  switch (subcommand) {
    case 'list':
      const agents = await store.getAgents()
      
      console.log('👥 Agents:')
      agents.forEach(agent => {
        console.log(`${agent.name} (${agent.role})`)
        console.log(`   Session: ${agent.session_key}`)
        console.log(`   Status: ${agent.status}`)
      })
      break
      
    default:
      console.log('Usage: agents list')
  }
}

function showHelp() {
  console.log(`
Mission Control CLI (Automerge Edition)

Usage:
  tasks [list [status] | show <task-id>]   List or show tasks
  comment <task-id> "message"              Add a comment
  comments <task-id>                       List task comments  
  mentions pending [--agent <name>]        List pending mentions
  mentions deliver <id>                    Mark mention as delivered
  activity [--limit <n>]                   Show activity feed
  agents list                              List agents

Examples:
  tasks list in-progress
  tasks show clawd-pxdf
  comment clawd-pxdf "Making great progress!"
  mentions pending --agent friday
  activity --limit 10
`)
}

// Run the CLI
const args = process.argv.slice(2)
if (args.length === 0) {
  showHelp()
  process.exit(0)
}

handleCommand(args)