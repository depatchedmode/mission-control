import React, { useState, useEffect, useRef } from 'react'
import '@tldraw/tldraw/tldraw.css'

export default function MissionControlSync() {
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const [currentAgent] = useState('friday')
  
  // Connect to sync server on mount
  useEffect(() => {
    connectToSyncServer()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])
  
  const connectToSyncServer = async () => {
    try {
      console.log('🔄 Connecting to Automerge Sync Server...')
      
      // First, trigger backend sync with beans
      console.log('📡 Syncing backend with beans...')
      const syncResponse = await fetch('http://localhost:8004/automerge/sync-beans', {
        method: 'POST'
      })
      
      if (syncResponse.ok) {
        const syncResult = await syncResponse.json()
        console.log(`✅ Backend synced: ${syncResult.synced} tasks`)
      } else {
        console.error('⚠️ Backend sync failed, continuing with existing data...')
      }
      
      // Connect WebSocket for real-time updates
      const ws = new WebSocket('ws://localhost:8005')
      wsRef.current = ws
      
      ws.onopen = () => {
        console.log('🔌 Connected to sync server')
        setConnected(true)
        setError(null)
      }
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleSyncMessage(message)
        } catch (err) {
          console.error('❌ Failed to parse sync message:', err)
        }
      }
      
      ws.onclose = () => {
        console.log('🔌 Disconnected from sync server')
        setConnected(false)
        
        // Attempt reconnection after 3 seconds
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect...')
          connectToSyncServer()
        }, 3000)
      }
      
      ws.onerror = (err) => {
        console.error('❌ WebSocket error:', err)
        setError('Connection failed')
      }
      
    } catch (error) {
      console.error('❌ Sync server connection failed:', error)
      setError(error.message)
      setLoading(false)
    }
  }
  
  const handleSyncMessage = (message) => {
    switch (message.type) {
      case 'document-state':
      case 'document-update':
        console.log('📄 Document update received')
        setDoc(message.doc)
        setLoading(false)
        break
        
      case 'error':
        console.error('❌ Sync server error:', message.error)
        setError(message.error)
        break
        
      case 'pong':
        // Heartbeat response
        break
        
      default:
        console.log('⚠️ Unknown sync message:', message.type)
    }
  }
  
  const updateTask = (taskId, updates) => {
    // Optimistic update for immediate UI response
    setDoc(prevDoc => {
      if (!prevDoc || !prevDoc.tasks[taskId]) return prevDoc
      
      const newDoc = JSON.parse(JSON.stringify(prevDoc))
      Object.assign(newDoc.tasks[taskId], updates)
      
      // Add activity entry
      if (!newDoc.activity) newDoc.activity = []
      newDoc.activity.push({
        id: Math.random().toString(16).slice(2),
        type: 'task_moved_optimistic',
        agent: currentAgent,
        taskId,
        changes: updates,
        timestamp: new Date().toISOString()
      })
      
      return newDoc
    })
    
    // Send change to sync server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'document-change',
        change: {
          type: 'task-update',
          taskId,
          updates
        },
        agent: currentAgent,
        timestamp: new Date().toISOString()
      }))
    }
  }
  
  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#1a1a1a',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>🚀 Connecting to Mission Control...</h2>
          <p>Syncing with backend (localhost:8004)</p>
          {error && (
            <div style={{ marginTop: 20, color: '#ff4757' }}>
              ❌ {error}
            </div>
          )}
          <div style={{ marginTop: 20, fontSize: 14, color: '#4ecdc4' }}>
            {connected ? '🔗 WebSocket Connected' : '⏳ Establishing connection...'}
          </div>
        </div>
      </div>
    )
  }
  
  // Show error state
  if (error && !doc) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#1a1a1a',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>❌ Connection Error</h2>
          <p>{error}</p>
          <button 
            onClick={connectToSyncServer}
            style={{
              marginTop: 20,
              padding: '12px 24px',
              background: '#4ecdc4',
              color: 'black',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }
  
  if (!doc) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#1a1a1a',
        color: 'white'
      }}>
        <div>
          <h2>⚡ Waiting for document...</h2>
          <p>Real-time sync initializing</p>
        </div>
      </div>
    )
  }
  
  const tasks = Object.values(doc.tasks || {})
  const agents = Object.values(doc.agents || {})
  
  console.log('Rendering synchronized document:', tasks.length, 'tasks')
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      {/* Header with live sync status */}
      <div className="mission-control-header">
        <div className="mission-control-logo">
          🎯 Mission Control (Live Sync)
        </div>
        <div style={{ marginLeft: 20, fontSize: 12, color: '#888' }}>
          Backend: Real-time sync • Agent: {currentAgent} • 
          {doc.backend_sync?.last_beans_sync && (
            <span> Last sync: {new Date(doc.backend_sync.last_beans_sync).toLocaleTimeString()}</span>
          )}
        </div>
        <div className="mission-control-stats">
          <div className="stat">
            📋 {tasks.length} total
          </div>
          <div className="stat">
            👥 {agents.length} agents
          </div>
          <div className="stat">
            ⏳ {tasks.filter(t => t.status === 'todo').length} todo
          </div>
          <div className="stat">
            🔄 {tasks.filter(t => t.status === 'in-progress').length} active
          </div>
          <div className="stat">
            ✅ {tasks.filter(t => t.status === 'completed').length} done
          </div>
        </div>
      </div>
      
      {/* Connection status indicators */}
      <div style={{
        position: 'absolute',
        top: 60,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <div style={{
          background: connected ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 71, 87, 0.1)',
          border: `1px solid ${connected ? '#00ff88' : '#ff4757'}`,
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 11,
          color: connected ? '#00ff88' : '#ff4757'
        }}>
          {connected ? '🔗 Sync Server Connected' : '❌ Sync Disconnected'}
        </div>
        
        {doc.backend_sync?.tasks_imported && (
          <div style={{
            background: 'rgba(78, 205, 196, 0.1)',
            border: '1px solid #4ecdc4',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 11,
            color: '#4ecdc4'
          }}>
            📊 {doc.backend_sync.tasks_imported} tasks from backend
          </div>
        )}
      </div>
      
      {/* Agent Presence */}
      <div className="agent-presence">
        {agents.map(agent => (
          <div 
            key={agent.name}
            className={`agent-badge agent-${agent.name}`}
            style={{ borderColor: agent.color }}
          >
            {agent.name} ({agent.role})
          </div>
        ))}
      </div>
      
      {/* Main Canvas */}
      <div className="canvas-container">
        <TaskCanvas doc={doc} onUpdateTask={updateTask} currentAgent={currentAgent} />
      </div>
    </div>
  )
}

function TaskCanvas({ doc, onUpdateTask, currentAgent }) {
  const tasks = Object.values(doc.tasks || {})
  
  const TaskCard = ({ task }) => {
    const statusColor = {
      'todo': '#ffd93d',
      'in-progress': '#4ecdc4', 
      'completed': '#00ff88'
    }[task.status] || '#666'
    
    const agentColor = doc.agents?.[task.assignee]?.color || '#666'
    
    return (
      <div style={{
        position: 'absolute',
        left: task.x,
        top: task.y,
        width: task.width,
        height: task.height,
        background: 'rgba(0, 0, 0, 0.9)',
        border: `2px solid ${statusColor}`,
        borderRadius: 8,
        padding: 12,
        cursor: 'move',
        backdropFilter: 'blur(10px)',
        color: 'white',
        fontSize: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        transition: 'transform 0.1s ease' // Smooth movement
      }}
      onMouseDown={(e) => {
        const startX = e.clientX - task.x
        const startY = e.clientY - task.y
        
        const handleMouseMove = (e) => {
          const newX = Math.max(0, e.clientX - startX)
          const newY = Math.max(60, e.clientY - startY)
          onUpdateTask(task.id, { x: newX, y: newY })
        }
        
        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
        
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        e.preventDefault()
      }}
    >
      <div style={{ 
        fontWeight: 600, 
        marginBottom: 6,
        fontSize: 13,
        lineHeight: 1.2,
        color: statusColor
      }}>
        {task.title}
      </div>
      
      <div style={{ 
        fontSize: 10,
        color: '#aaa',
        marginBottom: 4
      }}>
        {task.type} • {task.id}
      </div>
      
      <div style={{ 
        fontSize: 10,
        color: '#bbb',
        marginBottom: 6,
        lineHeight: 1.3,
        maxHeight: 40,
        overflow: 'hidden'
      }}>
        {task.description}
      </div>
      
      <div style={{ 
        fontSize: 10,
        color: statusColor,
        fontWeight: 600,
        textTransform: 'uppercase',
        marginBottom: 4
      }}>
        {task.status}
      </div>
      
      {task.assignee && (
        <div style={{
          fontSize: 10,
          color: agentColor,
          fontWeight: 500
        }}>
          @{task.assignee}
        </div>
      )}
      
      <div style={{
        position: 'absolute',
        top: 6,
        right: 6,
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: statusColor,
        boxShadow: `0 0 6px ${statusColor}`
      }} />
      
      {task.priority && task.priority !== 'normal' && (
        <div style={{
          position: 'absolute',
          top: 6,
          left: 6,
          fontSize: 8,
          color: task.priority === 'high' ? '#ff4757' : '#ffa502',
          fontWeight: 600
        }}>
          {task.priority.toUpperCase()}
        </div>
      )}
    </div>
    )
  }
  
  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
    }}>
      {/* Status Column Headers */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
        padding: '0 50px',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ffd93d', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>📋 TODO</div>
          <div style={{ color: '#666', fontSize: 12 }}>{tasks.filter(t => t.status === 'todo').length} tasks</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#4ecdc4', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>🔄 IN PROGRESS</div>
          <div style={{ color: '#666', fontSize: 12 }}>{tasks.filter(t => t.status === 'in-progress').length} tasks</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#00ff88', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>✅ COMPLETED</div>
          <div style={{ color: '#666', fontSize: 12 }}>{tasks.filter(t => t.status === 'completed').length} tasks</div>
        </div>
      </div>
      
      {/* Status Column Backgrounds */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: 50,
        width: 'calc(33% - 20px)',
        height: 'calc(100vh - 120px)',
        background: 'rgba(255, 217, 61, 0.03)',
        border: '1px dashed rgba(255, 217, 61, 0.2)',
        borderRadius: 8,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: 60,
        left: 'calc(33% + 30px)',
        width: 'calc(33% - 20px)',
        height: 'calc(100vh - 120px)',
        background: 'rgba(78, 205, 196, 0.03)',
        border: '1px dashed rgba(78, 205, 196, 0.2)',
        borderRadius: 8,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: 60,
        right: 50,
        width: 'calc(33% - 20px)',
        height: 'calc(100vh - 120px)',
        background: 'rgba(0, 255, 136, 0.03)',
        border: '1px dashed rgba(0, 255, 136, 0.2)',
        borderRadius: 8,
        pointerEvents: 'none'
      }} />
      
      {/* Task Cards */}
      {tasks.map(task => (
        <TaskCard 
          key={task.id}
          task={task}
        />
      ))}
      
      {/* Real-time indicator */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '8px 12px',
        borderRadius: 6,
        border: '1px solid #00ff88',
        color: '#00ff88',
        fontSize: 11,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#00ff88',
          animation: 'pulse 1s infinite'
        }} />
        Automerge Sync Layer
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .mission-control-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50px;
          background: rgba(0, 0, 0, 0.9);
          border-bottom: 1px solid #333;
          display: flex;
          align-items: center;
          padding: 0 20px;
          z-index: 10;
        }
        .mission-control-logo {
          font-size: 18px;
          font-weight: 600;
          color: #4ecdc4;
        }
        .mission-control-stats {
          display: flex;
          gap: 20px;
          margin-left: auto;
        }
        .stat {
          font-size: 12px;
          color: #888;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .agent-presence {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 5;
        }
        .agent-badge {
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid #666;
          border-radius: 4px;
          font-size: 11px;
          color: white;
        }
        .canvas-container {
          position: absolute;
          top: 50px;
          left: 0;
          right: 0;
          bottom: 0;
        }
      `}</style>
    </div>
  )
}