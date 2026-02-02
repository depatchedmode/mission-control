#!/usr/bin/env node

/**
 * Migrate all .beans tasks to Mission Control Automerge system
 * Real-world test with actual project data
 */

import { AutomergeStore } from './lib/automerge-store.js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'

function parseMarkdownFile(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)
  
  if (!match) {
    console.warn(`No frontmatter found in ${filePath}`)
    return null
  }
  
  try {
    const metadata = yaml.load(match[1])
    const description = match[2].trim()
    
    return {
      ...metadata,
      description
    }
  } catch (err) {
    console.error(`Failed to parse ${filePath}:`, err.message)
    return null
  }
}

async function migrateBeansToMissionControl() {
  console.log('🚚 MISSION CONTROL MIGRATION: .beans → Automerge\n')
  
  const beansDir = join(process.cwd(), '.beans')
  const store = new AutomergeStore()
  
  console.log('📡 Initializing Mission Control...')
  await store.init()
  console.log(`   📋 Document URL: ${store.docHandle.url}\n`)
  
  // Register existing agents
  console.log('👥 Registering team agents...')
  await store.registerAgent('gary', 'agent:main:main', 'Lead')
  await store.registerAgent('friday', 'agent:developer:main', 'Software Developer') 
  await store.registerAgent('writer', 'agent:writer:main', 'Content Writer')
  console.log('   ✅ Agents registered\n')
  
  // Read all .beans files
  const beansFiles = readdirSync(beansDir).filter(f => f.endsWith('.md'))
  console.log(`📂 Found ${beansFiles.length} .beans files to migrate...\n`)
  
  const migrationResults = {
    success: 0,
    errors: 0,
    skipped: 0
  }
  
  // Migrate each task
  for (const file of beansFiles) {
    const filePath = join(beansDir, file)
    console.log(`🔄 Migrating ${file}...`)
    
    const taskData = parseMarkdownFile(filePath)
    if (!taskData) {
      console.log(`   ❌ Failed to parse, skipping`)
      migrationResults.skipped++
      continue
    }
    
    try {
      // Add task to Automerge store
      await store.docHandle.change(doc => {
        const taskId = taskData['#'] || file.replace('.md', '')
        
        doc.tasks[taskId] = {
          id: taskId,
          title: taskData.title || 'Untitled Task',
          status: taskData.status || 'todo',
          type: taskData.type || 'task',
          priority: taskData.priority || 'normal',
          assignee: taskData.assignee || null,
          description: taskData.description || '',
          created_at: taskData.created_at || new Date().toISOString(),
          updated_at: taskData.updated_at || new Date().toISOString(),
          depends_on: taskData.depends_on || [],
          commentThreads: {}
        }
        
        // Log migration activity
        doc.activity.push({
          id: `migration-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: 'task_migrated',
          agent: 'system',
          taskId: taskId,
          timestamp: new Date().toISOString(),
          metadata: { source: 'beans', file: file }
        })
      })
      
      console.log(`   ✅ ${taskData.title}`)
      console.log(`      Status: ${taskData.status} | Type: ${taskData.type || 'task'} | Assignee: ${taskData.assignee || 'unassigned'}`)
      
      migrationResults.success++
    } catch (err) {
      console.log(`   ❌ Migration failed: ${err.message}`)
      migrationResults.errors++
    }
  }
  
  console.log(`\n📊 Migration Results:`)
  console.log(`   ✅ Successfully migrated: ${migrationResults.success}`)
  console.log(`   ❌ Errors: ${migrationResults.errors}`)
  console.log(`   ⏭️  Skipped: ${migrationResults.skipped}`)
  
  // Show final state
  const doc = store.getDoc()
  console.log(`\n🎯 Mission Control State:`)
  console.log(`   📋 Total tasks: ${Object.keys(doc.tasks).length}`)
  console.log(`   👥 Agents: ${Object.keys(doc.agents).length}`)
  console.log(`   📊 Activity events: ${doc.activity.length}`)
  
  // Show breakdown by status
  const tasksByStatus = {}
  Object.values(doc.tasks).forEach(task => {
    tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1
  })
  
  console.log(`\n📈 Task Breakdown:`)
  Object.entries(tasksByStatus).forEach(([status, count]) => {
    console.log(`   ${status}: ${count} tasks`)
  })
  
  // Show recent activity
  console.log(`\n📰 Recent Migration Activity:`)
  doc.activity.slice(-5).forEach((event, i) => {
    console.log(`   ${i + 1}. ${event.type} - ${event.taskId}`)
  })
  
  console.log(`\n🎉 Migration Complete! All .beans tasks now in Mission Control.`)
  console.log(`   📋 Document URL: ${store.docHandle.url}`)
  console.log(`   🔄 Real-time sync enabled`)
  console.log(`   🌐 Shareable across all agent sessions`)
  
  await store.close()
}

// Install js-yaml if not present
try {
  await import('js-yaml')
} catch (err) {
  console.error('js-yaml not found. Installing...')
  const { execSync } = await import('child_process')
  execSync('npm install js-yaml', { stdio: 'inherit' })
  console.log('js-yaml installed. Please run the script again.')
  process.exit(0)
}

migrateBeansToMissionControl().catch(console.error)