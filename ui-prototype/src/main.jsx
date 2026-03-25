import React from 'react'
import ReactDOM from 'react-dom/client'
import MissionControlSync from './MissionControlSync'

// Mission Control development client.
// Connects to the supported sync-server runtime for real-time collaboration.
console.log('🚀 Mission Control: Starting development client against sync server')

// Mount the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <MissionControlSync />
)
