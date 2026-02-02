import React from 'react'
import ReactDOM from 'react-dom/client'
import MissionControlSync from './MissionControlSync'

// Mission Control with Automerge Sync Layer
// Connects to backend sync server for real-time collaboration
console.log('🚀 Mission Control: Starting with Automerge Sync Layer')

// Mount the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <MissionControlSync />
)