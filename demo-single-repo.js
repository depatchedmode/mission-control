#!/usr/bin/env node

/**
 * Live Demo: Multi-Agent Coordination on Single Repo
 * Shows Automerge Mission Control with simulated agent sessions
 */

import { AutomergeStore } from './lib/automerge-store.js'

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function demo() {
  console.log('🎬 LIVE DEMO: Mission Control Agent Coordination\n')
  
  const store = new AutomergeStore()
  await store.init()
  
  console.log('📡 Mission Control session started')
  console.log(`   📋 Document URL: ${store.docHandle.url}`)
  console.log('   🔄 All agents share this document in real-time\n')
  
  await delay(500)
  
  // Register team
  console.log('🏢 Team joining Mission Control...')
  await store.registerAgent('gary', 'agent:main:main', 'Lead')
  await delay(300)
  await store.registerAgent('friday', 'agent:developer:main', 'Developer')
  await delay(300)
  await store.registerAgent('writer', 'agent:writer:main', 'Content Writer')
  console.log('   ✅ All agents registered and ready\n')
  
  await delay(800)
  
  // Gary starts coordinating
  console.log('👨‍💼 Gary: Starting project coordination...')
  await store.addComment('auth-system', 'Team, we need to build authentication. High priority.', 'gary')
  await delay(400)
  
  await store.addComment('auth-system', '@friday Can you take the lead on JWT implementation?', 'gary')
  await delay(400)
  
  await store.addComment('auth-system', '@writer We\'ll need comprehensive API documentation for this.', 'gary')
  console.log('   💬 Gary posted 3 comments with agent assignments\n')
  
  await delay(800)
  
  // Check mentions in real-time
  console.log('📬 Checking real-time mentions...')
  const fridayMentions = await store.getPendingMentions('friday')
  const writerMentions = await store.getPendingMentions('writer')
  
  console.log(`   🔔 Friday has ${fridayMentions.length} new mentions`)
  if (fridayMentions.length > 0) {
    console.log(`      💬 "${fridayMentions[0].content}"`)
  }
  
  console.log(`   🔔 Writer has ${writerMentions.length} new mentions`)
  if (writerMentions.length > 0) {
    console.log(`      💬 "${writerMentions[0].content}"`)
  }
  console.log('')
  
  await delay(800)
  
  // Friday responds immediately
  console.log('👩‍💻 Friday: Responding to assignment...')
  await store.addComment('auth-system', '@gary Perfect! I\'ll use Passport.js + JWT. Starting implementation now.', 'friday')
  await delay(400)
  
  await store.addComment('auth-system', 'Initial research complete. Will need bcrypt for password hashing.', 'friday')
  console.log('   ✅ Friday accepted assignment and started work\n')
  
  await delay(600)
  
  // Writer joins the conversation
  console.log('📝 Writer: Joining the discussion...')
  await store.addComment('auth-system', '@gary @friday I\'ll document the auth flow. Need the API endpoints list when ready.', 'writer')
  console.log('   📚 Writer coordinating documentation\n')
  
  await delay(600)
  
  // Show live conversation thread
  console.log('💬 Live conversation thread on auth-system:')
  const comments = await store.getComments('auth-system')
  comments.forEach((comment, i) => {
    const timeAgo = Math.floor((Date.now() - new Date(comment.timestamp)) / 1000)
    console.log(`   ${i + 1}. [${timeAgo}s ago] @${comment.agent}: "${comment.content}"`)
  })
  console.log('')
  
  await delay(800)
  
  // Parallel work coordination
  console.log('🔄 Agents working in parallel...')
  console.log('   👨‍💼 Gary: Planning next sprint while team codes...')
  console.log('   👩‍💻 Friday: Updating progress on auth work...')
  console.log('   📝 Writer: Creating documentation outline...')
  
  // All agents work simultaneously - no conflicts!
  await Promise.all([
    store.addComment('sprint-2', '@friday After auth, we need the dashboard UI', 'gary'),
    store.addComment('auth-system', 'Progress update: JWT middleware 70% complete', 'friday'),
    store.addComment('docs-auth', 'Created auth documentation outline with endpoints', 'writer')
  ])
  
  console.log('   ⚡ All updates synchronized instantly!\n')
  
  await delay(600)
  
  // Show activity feed
  console.log('📊 Real-time activity feed (last 6 events):')
  const activity = await store.getActivity({ limit: 6 })
  activity.forEach((event, i) => {
    const timeAgo = Math.floor((Date.now() - new Date(event.timestamp)) / 1000)
    console.log(`   ${i + 1}. [${timeAgo}s ago] ${event.type} by @${event.agent}`)
  })
  console.log('')
  
  await delay(600)
  
  // Demonstrate mention delivery
  console.log('📨 Processing mention deliveries...')
  if (fridayMentions.length > 0) {
    await store.markMentionDelivered(fridayMentions[0].id)
    console.log('   ✅ Delivered mention to Friday')
  }
  if (writerMentions.length > 0) {
    await store.markMentionDelivered(writerMentions[0].id)
    console.log('   ✅ Delivered mention to Writer')
  }
  
  const remainingMentions = await store.getPendingMentions()
  console.log(`   📬 ${remainingMentions.length} mentions still pending\n`)
  
  await delay(600)
  
  // Final state summary
  const doc = store.getDoc()
  console.log('🎯 Mission Control Final State:')
  console.log(`   👥 Active agents: ${Object.keys(doc.agents).length}`)
  console.log(`   💬 Total comments: ${Object.keys(doc.comments).length}`)
  console.log(`   📬 Total mentions: ${Object.keys(doc.mentions).length}`)
  console.log(`   📊 Activity events: ${doc.activity.length}`)
  console.log(`   📋 Document URL: ${store.docHandle.url}`)
  console.log('')
  
  console.log('✨ What this demonstrates:')
  console.log('   🔄 Real-time coordination between agents')
  console.log('   💬 Threaded discussions on specific tasks')
  console.log('   📬 Automatic @mention detection and tracking')
  console.log('   📊 Complete activity logging')
  console.log('   🤝 Conflict-free parallel work')
  console.log('   🌐 Shareable document URLs for team sync')
  console.log('')
  
  console.log('🆚 Improvement over current beans system:')
  console.log('   ❌ Old: Static files, polling, conflicts, no real-time updates')
  console.log('   ✅ New: Live documents, instant sync, automatic conflict resolution')
  console.log('   ❌ Old: Separate JSONL files for comments/mentions/activity')  
  console.log('   ✅ New: Unified document with rich data relationships')
  console.log('   ❌ Old: No branching, no collaboration on task approaches')
  console.log('   ✅ New: Ready for Patchwork-style task branching & merging')
  
  await store.close()
}

demo().catch(console.error)