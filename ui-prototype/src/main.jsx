import React from 'react'
import ReactDOM from 'react-dom/client'
import Pardner from './Pardner'

// Pardner development client.
// Connects to the supported sync-server runtime for real-time collaboration.
console.log('🚀 Pardner: Starting development client against sync server')

// Mount the app
ReactDOM.createRoot(document.getElementById('root')).render(<Pardner />)
