#!/usr/bin/env node

/**
 * Live Demo: Multi-Agent Real-Time Coordination
 * Shows Automerge Mission Control in action with multiple agents
 */

import { AutomergeStore } from './lib/automerge-store.js'

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function demo() {
  console.log('🎬 LIVE DEMO: Mission Control Real-Time Agent Coordination\n')
  
  // Create two separate stores (simulating different agent sessions)
  const garyStore = new AutomergeStore()
  const fridayStore = new AutomergeStore()
  
  console.log('📡 Setting up agent sessions...')
  
  // Gary starts a new mission control session
  await garyStore.init()
  console.log('   👨‍💼 Gary: Connected to Mission Control')
  console.log(`   📋 Gary's doc URL: ${garyStore.docHandle.url}`)
  
  // Friday joins the SAME session using Gary's URL
  fridayStore.docHandle = fridayStore.repo.find(garyStore.docHandle.url)
  await delay(500) // Allow sync time
  console.log('   👩‍💻 Friday: Joined Gary\'s session')
  
  await delay(1000)
  
  // Register agents
  console.log('\n🏢 Registering team members...')
  await garyStore.registerAgent('gary', 'agent:main:main', 'Lead')
  await delay(500)
  await fridayStore.registerAgent('friday', 'agent:developer:main', 'Developer')
  await delay(500)
  await garyStore.registerAgent('writer', 'agent:writer:main', 'Content Writer')
  
  await delay(1000)
  
  // Gary starts planning
  console.log('\n🎯 Gary starts project planning...')
  await garyStore.addComment('auth-system', 'Starting work on authentication system', 'gary')
  await delay(500)
  
  await garyStore.addComment('auth-system', '@friday Can you handle the JWT implementation? We need secure token handling.', 'gary')
  await delay(800)
  
  // Friday sees Gary's mention in real-time!
  console.log('\n📬 Friday checks mentions...')
  const fridayMentions = await fridayStore.getPendingMentions('friday')
  console.log(`   🔔 Friday received ${fridayMentions.length} real-time mentions:`)
  fridayMentions.forEach(mention => {
    console.log(`      💬 From @${mention.from_agent}: "${mention.content}"`)
  })
  
  await delay(1000)
  
  // Friday responds immediately  
  console.log('\n⚡ Friday responds in real-time...')
  await fridayStore.addComment('auth-system', '@gary Absolutely! I\'ll start with Passport.js integration. @writer we\'ll need API docs.', 'friday')
  await delay(500)
  
  // Gary sees Friday's response instantly
  console.log('\n👁️ Gary sees Friday\'s response instantly...')
  const authComments = await garyStore.getComments('auth-system')
  console.log(`   💬 Auth system discussion (${authComments.length} comments):`)
  authComments.forEach((comment, i) => {
    console.log(`      ${i + 1}. @${comment.agent}: "${comment.content}"`)
  })
  
  await delay(1000)
  
  // Writer joins and gets mentioned
  console.log('\n📝 Writer joins and checks mentions...')
  const writerStore = new AutomergeStore()
  writerStore.docHandle = writerStore.repo.find(garyStore.docHandle.url)
  await delay(500)
  
  const writerMentions = await writerStore.getPendingMentions('writer')
  console.log(`   🔔 Writer has ${writerMentions.length} mentions waiting:`)
  writerMentions.forEach(mention => {
    console.log(`      💬 From @${mention.from_agent}: "${mention.content}"`)
  })
  
  await delay(800)
  
  // Show real-time activity feed
  console.log('\n📊 Real-time activity feed across all agents...')
  const activity = await garyStore.getActivity({ limit: 8 })
  activity.forEach((event, i) => {
    const timeAgo = Math.floor((Date.now() - new Date(event.timestamp)) / 1000)
    console.log(`   ${i + 1}. [${timeAgo}s ago] ${event.type} by @${event.agent}`)
  })
  
  await delay(1000)
  
  // Parallel collaboration
  console.log('\n🔄 Parallel collaboration in action...')
  console.log('   👨‍💼 Gary: Adding new task while Friday works...')
  console.log('   👩‍💻 Friday: Updating progress while Gary plans...')
  
  // Both agents work simultaneously - no conflicts!
  await Promise.all([
    garyStore.addComment('dashboard-ui', 'Need to design the dashboard interface', 'gary'),
    fridayStore.addComment('auth-system', 'JWT implementation 50% complete, passport integration working', 'friday')
  ])
  
  await delay(500)
  
  // Show final state
  console.log('\n🎉 Final Mission Control state:')
  const doc = garyStore.getDoc()
  console.log(`   👥 Active agents: ${Object.keys(doc.agents).length}`)
  console.log(`   💬 Total comments: ${Object.keys(doc.comments).length}`)
  console.log(`   📬 Pending mentions: ${Object.values(doc.mentions).filter(m => !m.delivered).length}`)
  console.log(`   📊 Activity events: ${doc.activity.length}`)
  console.log(`   📋 Document URL: ${garyStore.docHandle.url}`)
  
  console.log('\n✨ Demo complete! This shows:')
  console.log('   🔄 Real-time sync between agent sessions')
  console.log('   ⚡ Instant mention notifications')
  console.log('   🤝 Conflict-free parallel collaboration')
  console.log('   📱 Shared document state across all agents')
  console.log('   🌐 URL-based session sharing')
  
  console.log('\n🆚 VS Current beans system:')
  console.log('   ❌ Current: File polling, conflicts, no real-time sync')
  console.log('   ✅ Automerge: Instant updates, automatic conflict resolution, live collaboration')
  
  // Cleanup
  await garyStore.close()
  await fridayStore.close()
  await writerStore.close()
}

demo().catch(console.error)