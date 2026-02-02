import React, { useState, useEffect } from 'react'
import { useDocument, useHandle } from '@automerge/automerge-repo-react-hooks'
import '@tldraw/tldraw/tldraw.css'

export default function MissionControl({ docUrl }) {
  const doc = useDocument(docUrl)
  const handle = useHandle(docUrl)
  const [currentAgent] = useState('friday')
  const [backendTasks, setBackendTasks] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Fetch real tasks from backend API
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        console.log('Fetching tasks from backend API...')
        const response = await fetch('http://localhost:8003/beans')
        if (response.ok) {
          const tasks = await response.json()
          console.log('Backend tasks fetched:', tasks.length)
          setBackendTasks(tasks)
          
          // Initialize Automerge document with real backend data
          if (handle && doc) {
            initializeDocumentWithBackendData(handle, tasks)
          }
        } else {
          console.error('Failed to fetch backend tasks:', response.status)
        }
      } catch (error) {
        console.error('Error fetching backend tasks:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBackendData()
  }, [])
  
  // Initialize document with backend data
  const initializeDocumentWithBackendData = (handle, tasks) => {
    handle.change(d => {
      d.name = 'Mission Control - Production (Live Data)'
      d.agents = {
        gary: { name: 'gary', role: 'Lead', status: 'active', color: '#ff6b6b' },
        friday: { name: 'friday', role: 'Developer', status: 'active', color: '#4ecdc4' },
        writer: { name: 'writer', role: 'Writer', status: 'active', color: '#45b7d1' }
      }
      
      // Convert backend tasks to spatial format
      d.tasks = {}
      tasks.forEach((task, index) => {
        // Layout tasks in a grid based on status
        const statusGroups = { 'todo': 0, 'in-progress': 1, 'completed': 2 }
        const statusGroup = statusGroups[task.status] || 0
        const itemsInGroup = tasks.filter(t => t.status === task.status)
        const indexInGroup = itemsInGroup.findIndex(t => t.id === task.id)
        
        const x = 50 + (statusGroup * 350)
        const y = 100 + (indexInGroup * 160)
        
        d.tasks[task.id] = {
          id: task.id,
          title: task.title,
          status: task.status,
          assignee: null, // Backend doesn't have assignee yet
          type: task.type || 'task',
          description: task.slug || '',
          x: x,
          y: y,
          width: 280,
          height: 140,
          priority: task.priority || 'normal',
          created_at: task.created_at,
          updated_at: task.updated_at
        }
      })
      
      d.activity = []
      d.comments = {}
      d.backend_sync = new Date().toISOString()
    })
  }
  
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
          <h2>🚀 Loading Mission Control...</h2>
          <p>Connecting to backend API (localhost:8003/beans)</p>
          <div style={{ marginTop: 20, fontSize: 14, color: '#4ecdc4' }}>
            Fetching {backendTasks.length > 0 ? `${backendTasks.length} tasks...` : 'task data...'}
          </div>
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
          <h2>⚡ Initializing Automerge...</h2>
          <p>Setting up real-time collaboration</p>
        </div>
      </div>
    )
  }
  
  const tasks = Object.values(doc.tasks || {})
  const agents = Object.values(doc.agents || {})
  
  console.log('Rendering with doc tasks:', tasks.length)
  console.log('Backend tasks available:', backendTasks.length)
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      {/* Header with real stats */}
      <div className="mission-control-header">
        <div className="mission-control-logo">
          🎯 Mission Control
        </div>
        <div style={{ marginLeft: 20, fontSize: 12, color: '#888' }}>
          Backend: {backendTasks.length} tasks • Document: {docUrl.slice(-8)}... • Agent: {currentAgent}
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
      
      {/* Backend sync indicator */}
      <div style={{
        position: 'absolute',
        top: 60,
        right: 20,
        background: 'rgba(0, 255, 136, 0.1)',
        border: '1px solid #00ff88',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 11,
        color: '#00ff88'
      }}>
        🔗 Backend API Connected ({backendTasks.length} tasks)
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
        <TaskCanvas doc={doc} handle={handle} currentAgent={currentAgent} />
      </div>
    </div>
  )
}

function TaskCanvas({ doc, handle, currentAgent }) {
  const tasks = Object.values(doc.tasks || {})
  
  console.log('TaskCanvas rendering tasks:', tasks.length)
  
  const TaskCard = ({ task, onUpdate }) => {
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
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}
      onMouseDown={(e) => {
        const startX = e.clientX - task.x
        const startY = e.clientY - task.y
        
        const handleMouseMove = (e) => {
          const newX = e.clientX - startX
          const newY = e.clientY - startY
          onUpdate(task.id, { x: newX, y: newY })
        }
        
        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
        
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
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
  
  const updateTask = (taskId, updates) => {
    handle.change(doc => {
      if (doc.tasks[taskId]) {
        Object.assign(doc.tasks[taskId], updates)
        
        // Log activity
        if (!doc.activity) doc.activity = []
        doc.activity.push({
          id: Math.random().toString(16).slice(2),
          type: 'task_moved',
          agent: currentAgent,
          taskId,
          changes: updates,
          timestamp: new Date().toISOString()
        })
      }
    })
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
          onUpdate={updateTask}
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
        Backend + Real-time Sync
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}