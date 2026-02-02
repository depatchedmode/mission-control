import React, { useState, useEffect } from 'react'
import { useDocument, useHandle } from '@automerge/automerge-repo-react-hooks'
import { Tldraw, createShapeId } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

export default function MissionControl({ docUrl }) {
  const doc = useDocument(docUrl)
  const handle = useHandle(docUrl)
  const [currentAgent] = useState('friday') // Default agent for demo
  
  // Initialize document with tasks if empty
  useEffect(() => {
    if (doc && handle && (!doc.tasks || Object.keys(doc.tasks).length === 0)) {
      console.log('Initializing empty document with tasks...')
      handle.change(d => {
        d.name = 'Mission Control - Production'
        d.agents = {
          gary: { name: 'gary', role: 'Lead', status: 'active', color: '#ff6b6b' },
          friday: { name: 'friday', role: 'Software Developer', status: 'active', color: '#4ecdc4' },
          writer: { name: 'writer', role: 'Content Writer', status: 'active', color: '#45b7d1' }
        }
        
        d.tasks = {
          'clawd-pxdf': {
            id: 'clawd-pxdf',
            title: 'Mission Control - Multi-Agent Squad System',
            status: 'in-progress',
            assignee: 'friday',
            type: 'feature',
            description: 'Multi-agent orchestration using OpenClaw',
            x: 120, y: 150, width: 220, height: 140
          },
          'clawd-q69t': {
            id: 'clawd-q69t', 
            title: 'Fabric Design System',
            status: 'in-progress',
            assignee: null,
            type: 'epic',
            description: 'Shared design tokens and components',
            x: 400, y: 150, width: 220, height: 140
          },
          'clawd-tkyd': {
            id: 'clawd-tkyd',
            title: 'Resilient Networks Homepage', 
            status: 'in-progress',
            assignee: null,
            type: 'epic',
            description: 'Marketing/landing page for Resilient Networks',
            x: 680, y: 150, width: 220, height: 140
          },
          'clawd-adf4': {
            id: 'clawd-adf4',
            title: 'Implement Patchwork UX Concepts',
            status: 'todo',
            assignee: 'friday',
            type: 'feature', 
            description: 'Add branching, visual diffs, timeline',
            x: 120, y: 350, width: 220, height: 140
          },
          'clawd-pmal': {
            id: 'clawd-pmal',
            title: "Gary's Dashboard",
            status: 'todo',
            assignee: null,
            type: 'epic',
            description: 'Web-based kanban board and memory viewer',
            x: 400, y: 350, width: 220, height: 140
          }
        }
        
        d.activity = []
        d.comments = {}
        d.created_at = new Date().toISOString()
      })
    }
  }, [doc, handle])
  
  if (!doc) {
    return (
      <div style={{ 
        display: 'flex', 
        items: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#1a1a1a',
        color: 'white'
      }}>
        <div>
          <h2>🚀 Loading Mission Control...</h2>
          <p>Connecting to real-time agent coordination system</p>
        </div>
      </div>
    )
  }
  
  const tasks = Object.values(doc.tasks || {})
  const agents = Object.values(doc.agents || {})
  
  // Debug logging
  console.log('Doc:', doc)
  console.log('Tasks:', tasks)
  console.log('Agents:', agents)
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      {/* Header */}
      <div className="mission-control-header">
        <div className="mission-control-logo">
          🎯 Mission Control
        </div>
        <div style={{ marginLeft: 20, fontSize: 12, color: '#888' }}>
          Document: {docUrl.slice(-8)}... • Agent: {currentAgent}
        </div>
        <div className="mission-control-stats">
          <div className="stat">
            📋 {tasks.length} tasks
          </div>
          <div className="stat">
            👥 {agents.length} agents
          </div>
          <div className="stat">
            🔄 {tasks.filter(t => t.status === 'in-progress').length} active
          </div>
          <div className="stat">
            ⏳ {tasks.filter(t => t.status === 'todo').length} todo
          </div>
          <div className="stat">
            ✅ {tasks.filter(t => t.status === 'completed').length} done
          </div>
        </div>
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
  
  // Custom task card component for the canvas
  const TaskCard = ({ task, onUpdate }) => {
    const statusColor = {
      'todo': '#ffd93d',
      'in-progress': '#4ecdc4', 
      'completed': '#00ff88'
    }[task.status] || '#666'
    
    const agentColor = doc.agents[task.assignee]?.color || '#666'
    
    return (
      <div style={{
        position: 'absolute',
        left: task.x,
        top: task.y,
        width: task.width,
        height: task.height,
        background: 'rgba(0, 0, 0, 0.8)',
        border: `2px solid ${statusColor}`,
        borderRadius: 8,
        padding: 12,
        cursor: 'move',
        backdropFilter: 'blur(10px)',
        color: 'white',
        fontSize: 12
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
        marginBottom: 4,
        fontSize: 13,
        lineHeight: 1.2
      }}>
        {task.title}
      </div>
      
      <div style={{ 
        fontSize: 10,
        color: '#aaa',
        marginBottom: 6
      }}>
        {task.type} • {task.id}
      </div>
      
      <div style={{ 
        fontSize: 10,
        color: statusColor,
        marginBottom: 4
      }}>
        {task.status.toUpperCase()}
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
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: statusColor
      }} />
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
          type: 'task_updated',
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
      {/* Status Columns */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 50,
        right: 50,
        display: 'flex',
        justifyContent: 'space-between',
        pointerEvents: 'none'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ffd93d', fontSize: 16, fontWeight: 600 }}>📋 TODO</div>
          <div style={{ color: '#666', fontSize: 12 }}>{tasks.filter(t => t.status === 'todo').length} tasks</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#4ecdc4', fontSize: 16, fontWeight: 600 }}>🔄 IN PROGRESS</div>
          <div style={{ color: '#666', fontSize: 12 }}>{tasks.filter(t => t.status === 'in-progress').length} tasks</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#00ff88', fontSize: 16, fontWeight: 600 }}>✅ COMPLETED</div>
          <div style={{ color: '#666', fontSize: 12 }}>{tasks.filter(t => t.status === 'completed').length} tasks</div>
        </div>
      </div>
      
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
        Real-time sync active
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