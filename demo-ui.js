#!/usr/bin/env node

/**
 * Demo script for Mission Control UI
 * Shows the spatial kanban interface in action
 */

import { execSync, spawn } from 'child_process'
import { existsSync } from 'fs'

console.log('🎨 MISSION CONTROL UI DEMO\n')

console.log('📋 What you\'re about to see:')
console.log('   🌐 Spatial kanban with draggable task cards')
console.log('   🔄 Real-time sync between browser tabs') 
console.log('   👥 Agent presence indicators')
console.log('   📊 Live task statistics')
console.log('   🎯 Infinite canvas for flexible task organization')
console.log('')

console.log('🎨 UI Features inspired by:')
console.log('   📐 tldraw - Infinite canvas with spatial intelligence')
console.log('   🌿 Patchwork - Version control for creative work')
console.log('   ⚡ Automerge - Real-time collaboration without conflicts')
console.log('')

// Check if dependencies are installed
const prototypeDir = './ui-prototype'

if (!existsSync(prototypeDir + '/node_modules')) {
  console.log('📦 Installing UI dependencies...')
  try {
    execSync('npm install', { 
      cwd: prototypeDir,
      stdio: 'inherit'
    })
    console.log('   ✅ Dependencies installed\n')
  } catch (err) {
    console.log('   ❌ Failed to install dependencies')
    console.log('   💡 Run: cd ui-prototype && npm install')
    process.exit(1)
  }
}

console.log('🚀 Starting Mission Control UI...')
console.log('   📍 URL: http://localhost:5174')
console.log('   🔄 Real-time sync: Open multiple tabs to see collaboration')
console.log('   🎯 Try: Drag task cards around the infinite canvas')
console.log('')

console.log('💡 Demo Features:')
console.log('   • Spatial task organization (not rigid columns)')
console.log('   • Real-time updates across browser sessions')
console.log('   • Agent assignment and status tracking')
console.log('   • Visual task clustering and relationships')
console.log('   • Foundation for Patchwork features (branching, diffs)')
console.log('')

console.log('🎮 To test real-time collaboration:')
console.log('   1. Open http://localhost:5174 in multiple browser tabs')
console.log('   2. Drag tasks around in one tab')
console.log('   3. Watch them update instantly in other tabs')
console.log('   4. Each agent gets a different colored presence indicator')
console.log('')

// Start the dev server
try {
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: prototypeDir,
    stdio: 'inherit'
  })
  
  process.on('SIGINT', () => {
    devServer.kill()
    console.log('\n👋 Mission Control UI demo stopped')
    process.exit(0)
  })
  
} catch (err) {
  console.log('❌ Failed to start UI server:', err.message)
  console.log('💡 Try: cd ui-prototype && npm run dev')
  process.exit(1)
}