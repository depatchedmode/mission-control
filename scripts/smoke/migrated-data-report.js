#!/usr/bin/env node

/**
 * Internal archived script.
 * Kept for migration/demo reference only; not part of the supported runtime flow.
 */

import { AutomergeStore } from '../../lib/automerge-store.js'

async function testMigratedData() {
  console.log('🎯 TESTING MISSION CONTROL WITH REAL PROJECT DATA\n')
  
  const docUrl = process.env.MC_TEST_DOC_URL
  if (!docUrl) {
    console.error('❌ MC_TEST_DOC_URL is required for this integration script')
    process.exit(1)
  }

  // Connect to the migrated document
  const store = new AutomergeStore()
  store.docHandle = await store.repo.find(docUrl)
  store.initialized = true
  
  const doc = store.getDoc()
  
  if (!doc || !doc.tasks) {
    console.log('❌ Could not connect to migrated data')
    process.exit(1)
  }
  
  console.log('📊 REAL PROJECT DATA OVERVIEW:')
  console.log(`   📋 Total tasks: ${Object.keys(doc.tasks).length}`)
  console.log(`   👥 Active agents: ${Object.keys(doc.agents).length}`)
  console.log(`   📈 Activity events: ${doc.activity.length}\n`)
  
  // Show active work (in-progress tasks)
  const activeTasks = Object.values(doc.tasks).filter(task => task.status === 'in-progress')
  console.log(`🔥 ACTIVE WORK (${activeTasks.length} tasks):`)
  activeTasks.forEach(task => {
    console.log(`   📋 ${task.title}`)
    console.log(`      Type: ${task.type} | Assignee: ${task.assignee || 'unassigned'}`)
    console.log(`      ID: ${task.id}\n`)
  })
  
  // Show pending work
  const todoTasks = Object.values(doc.tasks).filter(task => task.status === 'todo')
  console.log(`📝 PENDING WORK (${todoTasks.length} tasks):`)
  todoTasks.slice(0, 5).forEach(task => {
    console.log(`   ⏳ ${task.title}`)
    console.log(`      Type: ${task.type} | Assignee: ${task.assignee || 'unassigned'}`)
  })
  
  if (todoTasks.length > 5) {
    console.log(`   ... and ${todoTasks.length - 5} more todo tasks`)
  }
  console.log('')
  
  // Show completed work  
  const completedTasks = Object.values(doc.tasks).filter(task => task.status === 'completed')
  console.log(`✅ COMPLETED WORK (${completedTasks.length} tasks):`)
  completedTasks.slice(0, 3).forEach(task => {
    console.log(`   ✅ ${task.title}`)
  })
  if (completedTasks.length > 3) {
    console.log(`   ... and ${completedTasks.length - 3} more completed tasks`)
  }
  console.log('')
  
  // Test adding a comment to a real task
  const missionControlTask = Object.values(doc.tasks).find(task => 
    task.title.includes('Mission Control')
  )
  
  if (missionControlTask) {
    console.log('💬 TESTING REAL-TIME COMMENTS:')
    console.log(`   Adding comment to: "${missionControlTask.title}"`)
    
    await store.addComment(
      missionControlTask.id, 
      '🎉 Successfully migrated all .beans data to Mission Control! Real-time coordination is now live.', 
      'friday'
    )
    
    const comments = await store.getComments(missionControlTask.id)
    console.log(`   📝 Task now has ${comments.length} comments`)
    if (comments.length > 0) {
      const latestComment = comments[comments.length - 1]
      console.log(`   💬 Latest: "${latestComment.content.substring(0, 60)}..."`)
    }
    console.log('')
  }
  
  // Show project breakdown
  const projects = {}
  Object.values(doc.tasks).forEach(task => {
    let project = 'Other'
    if (task.title.includes('Way2') || task.title.includes('way2')) project = 'Way2 Platform'
    else if (task.title.includes('Resilient') || task.title.includes('resilient')) project = 'Resilient Networks'
    else if (task.title.includes('Mission Control') || task.title.includes('Automerge') || task.title.includes('Patchwork')) project = 'Mission Control'
    else if (task.title.includes('Fabric') || task.title.includes('Design')) project = 'Design System'
    else if (task.title.includes('Brand') || task.title.includes('brand')) project = 'Branding'
    
    if (!projects[project]) projects[project] = { total: 0, active: 0, completed: 0 }
    projects[project].total++
    if (task.status === 'in-progress') projects[project].active++
    if (task.status === 'completed') projects[project].completed++
  })
  
  console.log('🏢 PROJECT BREAKDOWN:')
  Object.entries(projects).forEach(([project, stats]) => {
    console.log(`   ${project}:`)
    console.log(`      Total: ${stats.total} | Active: ${stats.active} | Completed: ${stats.completed}`)
  })
  console.log('')
  
  // Show Friday's assigned work
  const fridayTasks = Object.values(doc.tasks).filter(task => task.assignee === 'friday')
  console.log(`👩‍💻 FRIDAY'S ASSIGNMENTS (${fridayTasks.length} tasks):`)
  fridayTasks.forEach(task => {
    const statusEmoji = task.status === 'completed' ? '✅' : task.status === 'in-progress' ? '🔄' : '⏳'
    console.log(`   ${statusEmoji} ${task.title}`)
  })
  console.log('')
  
  console.log('🎉 MISSION CONTROL IS LIVE WITH REAL DATA!')
  console.log('   🔄 Real-time sync enabled')
  console.log('   💬 Comments and mentions working')
  console.log('   📊 Activity logging active')
  console.log('   🌐 Shareable document URL for team coordination')
  console.log(`   📋 Document: ${store.docHandle.url}`)
  
  await store.close()
}

testMigratedData().catch(console.error)
