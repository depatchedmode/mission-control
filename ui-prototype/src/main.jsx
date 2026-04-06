import React from 'react'
import ReactDOM from 'react-dom/client'
import MissionControlSync from './MissionControlSync'

// Gameplan development client.
// Connects to the supported sync-server runtime for real-time collaboration.
console.log('🚀 Gameplan: Starting development client against sync server')

// Mount the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <MissionControlSync />
)
