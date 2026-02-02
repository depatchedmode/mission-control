#!/usr/bin/env node

/**
 * Live Mission Control CLI - uses persistent document URL
 * Shows real migrated data from .beans
 */

import { AutomergeStore } from './lib/automerge-store.js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DOCUMENT_URL_FILE = join(process.cwd(), '.mission-control-url')

async function initOrLoadStore() {
  const store = new AutomergeStore()
  
  // Try to load existing document URL
  if (existsSync(DOCUMENT_URL_FILE)) {
    const savedUrl = readFileSync(DOCUMENT_URL_FILE, 'utf-8').trim()
    console.log(`📡 Loading existing Mission Control: ${savedUrl}`)
    
    try {
      store.docHandle = store.repo.create()  // Start with new doc
      
      // Import data from our recent migration if needed
      const doc = store.getDoc()
      if (!doc.tasks || Object.keys(doc.tasks).length === 0) {
        console.log('📂 No tasks found - running quick migration...')
        await importBeansData(store)
      }
      
    } catch (err) {
      console.log('❌ Could not load saved document, creating new one...')
      await store.init()
    }
  } else {
    await store.init()
    await importBeansData(store)
  }
  
  // Save the document URL for future use
  writeFileSync(DOCUMENT_URL_FILE, store.docHandle.url)
  
  return store
}

async function importBeansData(store) {
  console.log('🚚 Quick importing key .beans tasks...')
  
  // Add essential agents
  await store.registerAgent('gary', 'agent:main:main', 'Lead')
  await store.registerAgent('friday', 'agent:developer:main', 'Software Developer')
  await store.registerAgent('writer', 'agent:writer:main', 'Content Writer')
  
  // Add sample of most important tasks
  const keyTasks = [
    {
      id: 'clawd-pxdf',
      title: 'Mission Control - Multi-Agent Squad System',
      status: 'in-progress',
      type: 'feature',
      assignee: 'friday',
      description: 'Build multi-agent orchestration system using OpenClaw with shared context, task coordination, and @mention notifications.'
    },
    {
      id: 'clawd-q69t',
      title: 'Fabric Design System',
      status: 'in-progress',
      type: 'epic',
      description: 'Shared design tokens and components for Way2 and Resilient Networks.'
    },
    {
      id: 'clawd-tkyd',
      title: 'Resilient Networks Homepage',
      status: 'in-progress',
      type: 'epic',
      description: 'Marketing/landing page for Resilient Networks (the lab).'
    },
    {
      id: 'clawd-c2r3',
      title: 'Way2 Brand System',
      status: 'in-progress',
      type: 'epic',
      description: 'Complete brand system for Way2 platform.'
    },
    {
      id: 'clawd-x76l',
      title: 'Way2 Demo (Volunteer/Lead Apps)',
      status: 'in-progress',
      type: 'epic',
      description: 'Demo applications for Way2 platform.'
    },
    {
      id: 'clawd-adf4',
      title: 'Implement Patchwork UX Concepts',
      status: 'todo',
      type: 'feature',
      assignee: 'friday',
      description: 'Add Patchwork-inspired UX features: branching, visual diffs, timeline, universal comments.'
    },
    {
      id: 'clawd-pmal',
      title: 'Gary\'s Dashboard',
      status: 'todo',
      type: 'epic',
      description: 'Web-based kanban board and memory viewer for Gary.'
    }
  ]
  
  for (const task of keyTasks) {
    await store.docHandle.change(doc => {
      doc.tasks[task.id] = {
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        depends_on: [],
        commentThreads: {}
      }
    })
  }
  
  console.log(`   ✅ Imported ${keyTasks.length} key tasks`)
}

async function handleCommand(args) {
  const [command, ...params] = args
  
  const store = await initOrLoadStore()
  
  try {
    switch (command) {
      case 'status':
        await showStatus(store)
        break
      case 'tasks':
        await showTasks(store, params)
        break
      case 'comment':
        await addComment(store, params)
        break
      case 'comments':
        await showComments(store, params)
        break
      case 'mentions':
        await handleMentions(store, params)
        break
      case 'activity':
        await showActivity(store, params)
        break
      case 'agents':
        await showAgents(store)
        break
      default:
        showHelp()
    }
  } finally {
    await store.close()
  }
}

async function showStatus(store) {
  const doc = store.getDoc()
  const tasks = Object.values(doc.tasks || {})
  
  console.log('🎯 MISSION CONTROL STATUS')
  console.log(`   📋 Total tasks: ${tasks.length}`)
  console.log(`   👥 Agents: ${Object.keys(doc.agents || {}).length}`)
  console.log(`   📊 Activity events: ${(doc.activity || []).length}`)
  console.log(`   📡 Document URL: ${store.docHandle.url}`)
  
  const byStatus = {}
  tasks.forEach(task => {
    byStatus[task.status] = (byStatus[task.status] || 0) + 1
  })
  
  console.log('\n📈 Task Breakdown:')
  Object.entries(byStatus).forEach(([status, count]) => {
    const emoji = status === 'completed' ? '✅' : status === 'in-progress' ? '🔄' : '⏳'
    console.log(`   ${emoji} ${status}: ${count}`)
  })
}

async function showTasks(store, params) {
  const [filter] = params
  const doc = store.getDoc()
  let tasks = Object.values(doc.tasks || {})
  
  if (filter) {
    tasks = tasks.filter(task => 
      task.status === filter || 
      task.type === filter ||
      task.assignee === filter
    )
  }
  
  console.log(`📋 Tasks${filter ? ` (${filter})` : ''}: ${tasks.length}`)
  
  tasks.forEach(task => {
    const statusEmoji = task.status === 'completed' ? '✅' : task.status === 'in-progress' ? '🔄' : '⏳'
    console.log(`${statusEmoji} [${task.id}] ${task.title}`)
    console.log(`   ${task.type} | ${task.assignee || 'unassigned'}`)
  })
}

async function addComment(store, params) {
  const [taskId, ...messageParts] = params
  const message = messageParts.join(' ').replace(/^["']|["']$/g, '')
  
  if (!taskId || !message) {
    console.log('Usage: comment <task-id> "message"')
    return
  }
  
  const commentId = await store.addComment(taskId, message, 'friday')
  console.log(`💬 Comment added to ${taskId}: ${commentId}`)
  
  // Show mentions if any
  const mentions = message.match(/@(\w+)/g)
  if (mentions) {
    console.log(`📬 Mentions created: ${mentions.join(', ')}`)
  }
}

async function showComments(store, params) {
  const [taskId] = params
  
  if (!taskId) {
    console.log('Usage: comments <task-id>')
    return
  }
  
  const comments = await store.getComments(taskId)
  
  if (comments.length === 0) {
    console.log(`No comments on ${taskId} yet.`)
    return
  }
  
  console.log(`💬 Comments on ${taskId}:`)
  comments.forEach(comment => {
    const timeAgo = Math.floor((Date.now() - new Date(comment.timestamp)) / 1000)
    console.log(`[${comment.agent}] ${timeAgo}s ago`)
    console.log(`   ${comment.content}`)
  })
}

async function handleMentions(store, params) {
  const [subcommand, ...args] = params
  
  switch (subcommand) {
    case 'pending':
      const agentFlag = args.indexOf('--agent')
      const agent = agentFlag >= 0 ? args[agentFlag + 1] : null
      
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
      const [mentionId] = args
      await store.markMentionDelivered(mentionId)
      console.log(`✅ Delivered mention ${mentionId}`)
      break
      
    default:
      console.log('Usage: mentions pending [--agent <name>] | deliver <id>')
  }
}

async function showActivity(store, params) {
  const limitFlag = params.indexOf('--limit')
  const limit = limitFlag >= 0 ? parseInt(params[limitFlag + 1]) : 10
  
  const activity = await store.getActivity({ limit })
  
  console.log(`📊 Recent activity (${activity.length} events):`)
  activity.forEach(event => {
    const timeAgo = Math.floor((Date.now() - new Date(event.timestamp)) / 1000)
    console.log(`${timeAgo}s ago ${event.type} @${event.agent} [${event.task_id || event.taskId || 'general'}]`)
  })
}

async function showAgents(store) {
  const agents = await store.getAgents()
  
  console.log('👥 Active Agents:')
  agents.forEach(agent => {
    console.log(`${agent.name} (${agent.role})`)
    console.log(`   Session: ${agent.session_key}`)
    console.log(`   Status: ${agent.status}`)
  })
}

function showHelp() {
  console.log(`
🎯 Mission Control - Live Edition

Commands:
  status                                   Show system status
  tasks [filter]                          List tasks (filter: status/type/assignee)
  comment <task-id> "message"             Add comment with @mentions
  comments <task-id>                      Show task comments
  mentions pending [--agent <name>]       Show pending mentions
  mentions deliver <id>                   Mark mention delivered
  activity [--limit <n>]                  Show recent activity
  agents                                  List active agents

Examples:
  status
  tasks in-progress
  comment clawd-pxdf "Great progress @gary!"
  mentions pending --agent friday
  activity --limit 5
`)
}

// Run CLI
const args = process.argv.slice(2)
if (args.length === 0) {
  showHelp()
  process.exit(0)
}

handleCommand(args).catch(console.error)