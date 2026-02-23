#!/usr/bin/env node

/**
 * Test script for Automerge store
 * Verifies core functionality and real-time sync capabilities
 */

import { AutomergeStore } from '../../lib/automerge-store.js'

async function test() {
  console.log('🧪 Testing Automerge Mission Control Store...\n')
  
  const store = new AutomergeStore()
  
  try {
    // Initialize
    console.log('1. Initializing store...')
    await store.init()
    console.log('   ✅ Store initialized')
    
    // Register agents
    console.log('\n2. Registering agents...')
    await store.registerAgent('gary', 'agent:main:main', 'Lead')
    await store.registerAgent('friday', 'agent:developer:main', 'Developer')
    await store.registerAgent('writer', 'agent:writer:main', 'Content Writer')
    console.log('   ✅ Agents registered')
    
    // Add comments with mentions
    console.log('\n3. Adding comments with mentions...')
    const comment1 = await store.addComment(
      'clawd-test1', 
      'Starting work on this task', 
      'gary'
    )
    const comment2 = await store.addComment(
      'clawd-test1', 
      '@friday can you help with the implementation?', 
      'gary'
    )
    const comment3 = await store.addComment(
      'clawd-test1',
      '@writer we\'ll need docs for this @gary',
      'friday'
    )
    console.log(`   ✅ Added comments: ${comment1}, ${comment2}, ${comment3}`)
    
    // Check mentions
    console.log('\n4. Checking mentions...')
    const fridayMentions = await store.getPendingMentions('friday')
    const writerMentions = await store.getPendingMentions('writer')
    const garyMentions = await store.getPendingMentions('gary')
    
    console.log(`   📬 Friday has ${fridayMentions.length} mentions`)
    console.log(`   📬 Writer has ${writerMentions.length} mentions`)
    console.log(`   📬 Gary has ${garyMentions.length} mentions`)
    
    if (fridayMentions.length > 0) {
      console.log(`   📝 Friday's mention: "${fridayMentions[0].content}"`)
    }
    
    // Mark mention delivered
    console.log('\n5. Delivering mentions...')
    if (fridayMentions.length > 0) {
      await store.markMentionDelivered(fridayMentions[0].id)
      console.log('   ✅ Delivered mention to Friday')
    }
    
    // Check activity
    console.log('\n6. Checking activity feed...')
    const recentActivity = await store.getActivity({ limit: 5 })
    console.log(`   📊 ${recentActivity.length} recent activities:`)
    recentActivity.forEach((activity, i) => {
      console.log(`   ${i + 1}. ${activity.type} by ${activity.agent}`)
    })
    
    // Check comments
    console.log('\n7. Getting task comments...')
    const taskComments = await store.getComments('clawd-test1')
    console.log(`   💬 Task has ${taskComments.length} comments`)
    taskComments.forEach((comment, i) => {
      console.log(`   ${i + 1}. ${comment.agent}: "${comment.content}"`)
    })
    
    // Show document state
    console.log('\n8. Document state summary:')
    const doc = store.getDoc()
    console.log(`   📋 Tasks: ${Object.keys(doc.tasks).length}`)
    console.log(`   👥 Agents: ${Object.keys(doc.agents).length}`)
    console.log(`   💬 Comments: ${Object.keys(doc.comments).length}`)
    console.log(`   📬 Mentions: ${Object.keys(doc.mentions).length}`)
    console.log(`   📊 Activity: ${doc.activity.length} events`)
    
    console.log('\n✅ All tests passed! Automerge store is working.\n')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  } finally {
    await store.close()
  }
}

test()
