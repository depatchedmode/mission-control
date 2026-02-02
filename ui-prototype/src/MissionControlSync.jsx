import React, { useState, useEffect, useRef } from 'react'

// Project configurations - each project has its own Automerge doc
const PROJECTS = {
  'mission-control': {
    name: 'Mission Control',
    emoji: '🎯',
    docUrl: 'automerge:3Zto2gxmr3aZFEVLEbwXbVDhzYHF'
  },
  // Add more projects here as needed
  // 'other-project': { name: 'Other Project', emoji: '📦', docUrl: 'automerge:xxx' }
}

const DEFAULT_PROJECT = 'mission-control'

export default function MissionControlSync() {
  const [currentProject, setCurrentProject] = useState(DEFAULT_PROJECT)
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [showNewTask, setShowNewTask] = useState(false)
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const wsRef = useRef(null)
  
  useEffect(() => {
    connectToSyncServer()
    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [currentProject])
  
  const connectToSyncServer = async () => {
    setLoading(true)
    if (wsRef.current) wsRef.current.close()
    
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsBase = `${wsProtocol}//${window.location.host}/mc-ws`
      
      console.log('🔄 Connecting to:', wsBase)
      const ws = new WebSocket(wsBase)
      wsRef.current = ws
      
      ws.onopen = () => {
        console.log('🔌 Connected')
        setConnected(true)
        setError(null)
      }
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'document-state' || message.type === 'document-update') {
            setDoc(message.doc)
            setLoading(false)
          }
        } catch (err) {
          console.error('Parse error:', err)
        }
      }
      
      ws.onclose = () => {
        setConnected(false)
        setTimeout(connectToSyncServer, 3000)
      }
      
      ws.onerror = () => setError('Connection failed')
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }
  
  const sendChange = (change) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'document-change',
        change,
        agent: 'ui',
        timestamp: new Date().toISOString()
      }))
    }
  }
  
  const createTask = (title, status = 'todo') => {
    const id = 'task-' + Math.random().toString(36).substr(2, 9)
    sendChange({
      type: 'task-create',
      task: {
        id,
        title,
        status,
        type: 'task',
        description: '',
        assignee: null,
        created_at: new Date().toISOString()
      }
    })
    setShowNewTask(false)
  }
  
  const updateTaskStatus = (taskId, newStatus) => {
    sendChange({
      type: 'task-update',
      taskId,
      updates: { status: newStatus }
    })
  }
  
  const addComment = (taskId, text) => {
    sendChange({
      type: 'comment-add',
      taskId,
      comment: {
        id: 'c-' + Math.random().toString(36).substr(2, 9),
        text,
        agent: 'ryan',
        timestamp: new Date().toISOString()
      }
    })
  }
  
  if (loading) {
    return (
      <div style={styles.centered}>
        <h2>🚀 Connecting...</h2>
        <p style={{ color: '#888' }}>{PROJECTS[currentProject]?.name}</p>
        {error && <p style={{ color: '#ff4757' }}>❌ {error}</p>}
      </div>
    )
  }
  
  if (!doc) {
    return <div style={styles.centered}><h2>⏳ Loading...</h2></div>
  }
  
  const tasks = Object.values(doc.tasks || {})
  const agents = Object.values(doc.agents || {})
  const todoTasks = tasks.filter(t => t.status === 'todo')
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const project = PROJECTS[currentProject]
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div 
          style={styles.logo} 
          onClick={() => setShowProjectPicker(!showProjectPicker)}
        >
          {project.emoji} {project.name} ▾
        </div>
        <div style={styles.headerRight}>
          <span style={{ color: connected ? '#00ff88' : '#ff4757', fontSize: 12 }}>
            {connected ? '●' : '○'}
          </span>
          <button style={styles.addBtn} onClick={() => setShowNewTask(true)}>＋</button>
        </div>
      </div>
      
      {/* Project Picker */}
      {showProjectPicker && (
        <div style={styles.picker}>
          {Object.entries(PROJECTS).map(([key, proj]) => (
            <div 
              key={key}
              style={{
                ...styles.pickerItem,
                background: key === currentProject ? '#333' : 'transparent'
              }}
              onClick={() => {
                setCurrentProject(key)
                setShowProjectPicker(false)
              }}
            >
              {proj.emoji} {proj.name}
            </div>
          ))}
          <div style={styles.pickerDivider} />
          <div style={styles.pickerItem}>
            ➕ Add Project...
          </div>
        </div>
      )}
      
      {/* New Task Modal */}
      {showNewTask && (
        <NewTaskModal 
          onClose={() => setShowNewTask(false)}
          onCreate={createTask}
        />
      )}
      
      {/* Stats */}
      <div style={styles.stats}>
        <span>📋 {tasks.length}</span>
        <span>👥 {agents.length}</span>
        <span>⏳ {todoTasks.length}</span>
        <span>🔄 {inProgressTasks.length}</span>
        <span>✅ {completedTasks.length}</span>
      </div>
      
      {/* Columns */}
      <div style={styles.columns}>
        <TaskColumn 
          title="📋 TODO" 
          tasks={todoTasks} 
          color="#ffd93d"
          agents={agents}
          onStatusChange={updateTaskStatus}
          onComment={addComment}
        />
        <TaskColumn 
          title="🔄 IN PROGRESS" 
          tasks={inProgressTasks} 
          color="#4ecdc4"
          agents={agents}
          onStatusChange={updateTaskStatus}
          onComment={addComment}
        />
        <TaskColumn 
          title="✅ DONE" 
          tasks={completedTasks} 
          color="#00ff88"
          agents={agents}
          onStatusChange={updateTaskStatus}
          onComment={addComment}
        />
      </div>
    </div>
  )
}

function NewTaskModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      onCreate(title.trim())
    }
  }
  
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px', color: '#4ecdc4' }}>New Task</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={styles.input}
            autoFocus
          />
          <div style={styles.modalButtons}>
            <button type="button" style={styles.btnCancel} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.btnCreate}>Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TaskColumn({ title, tasks, color, agents, onStatusChange, onComment }) {
  return (
    <div style={styles.column}>
      <div style={{ ...styles.columnHeader, borderColor: color, color }}>
        {title} ({tasks.length})
      </div>
      <div style={styles.taskList}>
        {tasks.length === 0 && (
          <div style={styles.emptyColumn}>No tasks</div>
        )}
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            color={color}
            agents={agents}
            onStatusChange={onStatusChange}
            onComment={onComment}
          />
        ))}
      </div>
    </div>
  )
}

function TaskCard({ task, color, agents, onStatusChange, onComment }) {
  const [expanded, setExpanded] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [commentText, setCommentText] = useState('')
  
  const statusCycle = {
    'todo': 'in-progress',
    'in-progress': 'completed',
    'completed': 'todo'
  }
  
  const handleStatusChange = (e) => {
    e.stopPropagation()
    onStatusChange(task.id, statusCycle[task.status])
  }
  
  const handleComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      onComment(task.id, commentText.trim())
      setCommentText('')
      setShowComment(false)
    }
  }
  
  return (
    <div style={{ ...styles.card, borderColor: color }}>
      <div style={styles.cardHeader} onClick={() => setExpanded(!expanded)}>
        <div style={styles.cardTitle}>{task.title}</div>
        <button style={styles.statusBtn} onClick={handleStatusChange}>
          {task.status === 'todo' ? '▶' : task.status === 'in-progress' ? '✓' : '↺'}
        </button>
      </div>
      
      {task.assignee && (
        <div style={styles.assignee}>@{task.assignee}</div>
      )}
      
      {expanded && (
        <div style={styles.cardDetails}>
          {task.description && (
            <div style={styles.cardDesc}>{task.description}</div>
          )}
          <div style={styles.cardMeta}>{task.type} • {task.id}</div>
          
          {/* Comments */}
          {task.comments && task.comments.length > 0 && (
            <div style={styles.comments}>
              {task.comments.map(c => (
                <div key={c.id} style={styles.comment}>
                  <span style={styles.commentAuthor}>@{c.agent}</span>: {c.text}
                </div>
              ))}
            </div>
          )}
          
          {/* Add comment */}
          {showComment ? (
            <form onSubmit={handleComment} style={styles.commentForm}>
              <input
                type="text"
                placeholder="Add comment... (use @agent to mention)"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                style={styles.commentInput}
                autoFocus
              />
              <button type="submit" style={styles.commentBtn}>Send</button>
            </form>
          ) : (
            <button 
              style={styles.addCommentBtn} 
              onClick={(e) => { e.stopPropagation(); setShowComment(true) }}
            >
              💬 Comment
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#1a1a1a',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    paddingBottom: 40,
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#1a1a1a',
    color: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #333',
    position: 'sticky',
    top: 0,
    background: '#1a1a1a',
    zIndex: 100,
  },
  logo: {
    fontSize: 16,
    fontWeight: 600,
    color: '#4ecdc4',
    cursor: 'pointer',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  addBtn: {
    background: '#4ecdc4',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: 6,
    width: 32,
    height: 32,
    fontSize: 20,
    fontWeight: 600,
    cursor: 'pointer',
  },
  picker: {
    position: 'absolute',
    top: 50,
    left: 16,
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: 8,
    padding: 8,
    zIndex: 200,
    minWidth: 200,
  },
  pickerItem: {
    padding: '10px 12px',
    borderRadius: 4,
    cursor: 'pointer',
  },
  pickerDivider: {
    height: 1,
    background: '#444',
    margin: '8px 0',
  },
  stats: {
    display: 'flex',
    gap: 16,
    padding: '8px 16px',
    fontSize: 13,
    borderBottom: '1px solid #333',
    background: '#222',
    overflowX: 'auto',
  },
  columns: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 16,
  },
  column: {
    background: '#222',
    borderRadius: 8,
    overflow: 'hidden',
  },
  columnHeader: {
    padding: '10px 12px',
    fontWeight: 600,
    fontSize: 14,
    borderLeft: '3px solid',
    background: '#2a2a2a',
  },
  taskList: {
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  emptyColumn: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
  },
  card: {
    background: '#1a1a1a',
    border: '1px solid',
    borderRadius: 6,
    padding: 12,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    cursor: 'pointer',
  },
  cardTitle: {
    fontWeight: 500,
    fontSize: 14,
    flex: 1,
    paddingRight: 8,
  },
  statusBtn: {
    background: '#333',
    border: 'none',
    borderRadius: 4,
    color: 'white',
    width: 28,
    height: 28,
    fontSize: 14,
    cursor: 'pointer',
  },
  assignee: {
    fontSize: 12,
    color: '#4ecdc4',
    marginTop: 4,
  },
  cardDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #333',
  },
  cardDesc: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
    lineHeight: 1.4,
  },
  cardMeta: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
  },
  comments: {
    marginTop: 8,
    padding: 8,
    background: '#252525',
    borderRadius: 4,
  },
  comment: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
  },
  commentAuthor: {
    color: '#4ecdc4',
    fontWeight: 500,
  },
  commentForm: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    background: '#333',
    border: '1px solid #444',
    borderRadius: 4,
    padding: '8px 10px',
    color: 'white',
    fontSize: 13,
  },
  commentBtn: {
    background: '#4ecdc4',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: 4,
    padding: '8px 12px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  addCommentBtn: {
    background: 'transparent',
    border: '1px solid #444',
    borderRadius: 4,
    padding: '6px 10px',
    color: '#888',
    fontSize: 12,
    cursor: 'pointer',
    marginTop: 8,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  input: {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: 6,
    padding: '12px 14px',
    color: 'white',
    fontSize: 15,
    boxSizing: 'border-box',
  },
  modalButtons: {
    display: 'flex',
    gap: 12,
    marginTop: 16,
    justifyContent: 'flex-end',
  },
  btnCancel: {
    background: 'transparent',
    border: '1px solid #444',
    borderRadius: 6,
    padding: '10px 16px',
    color: '#888',
    cursor: 'pointer',
  },
  btnCreate: {
    background: '#4ecdc4',
    border: 'none',
    borderRadius: 6,
    padding: '10px 20px',
    color: '#1a1a1a',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
