import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { requestJson, withBearerAuthHeaders } from '../../lib/sync-client.js'
import { activityTaskId } from '../../lib/activity-task-id.js'

// Global lastSeen map (current single-operator prototype; stored in the shared Automerge doc)
const API_TOKEN = import.meta.env.VITE_MC_API_TOKEN || null

const PRIORITIES = [
  { value: 'p0', label: 'P0', color: '#ef4444' },
  { value: 'p1', label: 'P1', color: '#f97316' },
  { value: 'p2', label: 'P2', color: '#eab308' },
  { value: 'p3', label: 'P3', color: '#666' },
]

export default function MissionControlSync() {
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [showNewTask, setShowNewTask] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [mobileActiveColumn, setMobileActiveColumn] = useState('in-progress')
  const [view, setView] = useState('board') // 'board' or 'activity'
  const wsRef = useRef(null)
  
  useEffect(() => {
    connectToSyncServer()
    return () => { if (wsRef.current) wsRef.current.close() }
  }, [])
  
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') { setSelectedTask(null); setShowNewTask(false) } }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])
  
  const connectToSyncServer = async () => {
    setLoading(true)
    if (wsRef.current) wsRef.current.close()
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ticketQuery = API_TOKEN ? `?ticket=${encodeURIComponent(await requestWebSocketTicket())}` : ''
      const ws = new WebSocket(`${wsProtocol}//${window.location.host}/mc-ws${ticketQuery}`)
      wsRef.current = ws
      ws.onopen = () => { setConnected(true); setError(null) }
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type === 'document-state' || message.type === 'document-update') {
          setDoc(message.doc)
          setLoading(false)
          // Update selected task if it changed
          if (selectedTask && message.doc.tasks[selectedTask.id]) {
            setSelectedTask(message.doc.tasks[selectedTask.id])
          }
        }
      }
      ws.onclose = () => { setConnected(false); setTimeout(connectToSyncServer, 3000) }
      ws.onerror = () => setError('Connection failed')
    } catch (error) { setError(error.message); setLoading(false) }
  }

  const requestWebSocketTicket = async () => {
    const payload = await requestJson('', '/mc-api/automerge/ws-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      token: API_TOKEN
    })
    if (!payload?.ticket) {
      throw new Error('WebSocket auth ticket response missing ticket')
    }
    return payload.ticket
  }
  
  const sendChange = useCallback((change) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'document-change', change, agent: 'depatched', timestamp: new Date().toISOString() }))
    }
  }, [])
  
  const createTask = (title, priority = 'p2') => {
    const id = 'task-' + Math.random().toString(36).substr(2, 9)
    sendChange({ type: 'task-create', task: { id, title, status: 'backlog', priority, tags: [], order: Date.now(), type: 'task', description: '', assignee: null, created_at: new Date().toISOString() } })
    setShowNewTask(false)
  }
  
  const updateTask = (taskId, updates) => {
    sendChange({ type: 'task-update', taskId, updates })
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => ({ ...prev, ...updates }))
    }
  }
  
  const addComment = (taskId, text) => {
    sendChange({ type: 'comment-add', taskId, comment: { id: 'c-' + Math.random().toString(36).substr(2, 9), text, agent: 'depatched', timestamp: new Date().toISOString() } })
  }
  
  const handleDrop = (taskId, newStatus) => {
    if (draggedTask && draggedTask.status !== newStatus) {
      updateTask(taskId, { status: newStatus })
    }
    setDraggedTask(null)
  }
  
  if (loading) return <div style={styles.centered}><div style={styles.spinner} /><p style={styles.loadingText}>Connecting...</p></div>
  if (!doc) return <div style={styles.centered}><p style={styles.loadingText}>Loading...</p></div>
  
  const tasks = Object.values(doc.tasks || {})
  const agents = Object.values(doc.agents || {})
  const comments = Object.values(doc.comments || {})
  
  const sortTasks = (taskList) => taskList.sort((a, b) => {
    const pa = PRIORITIES.findIndex(p => p.value === a.priority)
    const pb = PRIORITIES.findIndex(p => p.value === b.priority)
    if (pa !== pb) return pa - pb
    return (a.order || 0) - (b.order || 0)
  })
  
  const backlogTasks = sortTasks(tasks.filter(t => t.status === 'todo' || t.status === 'backlog'))
  const upNextTasks = sortTasks(tasks.filter(t => t.status === 'up-next'))
  const inProgressTasks = sortTasks(tasks.filter(t => t.status === 'in-progress'))
  const reviewTasks = sortTasks(tasks.filter(t => t.status === 'review'))
  const completedTasks = sortTasks(tasks.filter(t => t.status === 'completed'))
  
  const getTaskComments = (taskId) => comments.filter(c => c.taskId === taskId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  
  const getUnreadCount = (taskId) => {
    const taskComments = getTaskComments(taskId)
    if (taskComments.length === 0) return 0
    const lastSeen = doc?.lastSeen?.[taskId]
    if (!lastSeen) return taskComments.length
    return taskComments.filter(c => new Date(c.timestamp) > new Date(lastSeen)).length
  }
  
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Mission Control</h1>
        <div style={styles.headerMeta}>
          <span style={styles.stat}>{tasks.length} tasks</span>
          <button style={{ ...styles.viewToggle, ...(view === 'activity' ? styles.viewToggleActive : {}) }}
            onClick={() => setView(view === 'board' ? 'activity' : 'board')}>
            {view === 'board' ? '📋 Activity' : '📊 Board'}
          </button>
          <span style={{ ...styles.connectionDot, background: connected ? '#10b981' : '#ef4444' }} />
          <button className="mc-header-add" style={styles.addBtn} onClick={() => setShowNewTask(true)}>+ New</button>
        </div>
      </header>

      {error && (
        <div style={styles.errorBanner}>
          {error}
        </div>
      )}
      
      {view === 'board' ? (<>
      {/* Mobile column tabs */}
      <div className="mc-mobile-tabs">
        {[
          { status: 'backlog', title: 'Backlog', count: backlogTasks.length },
          { status: 'up-next', title: 'Up Next', count: upNextTasks.length },
          { status: 'in-progress', title: 'In Progress', count: inProgressTasks.length },
          { status: 'review', title: 'Review', count: reviewTasks.length },
          { status: 'completed', title: 'Done', count: completedTasks.length },
        ].map(col => (
          <button key={col.status} className={`mc-mobile-tab ${mobileActiveColumn === col.status ? 'active' : ''}`}
            onClick={() => setMobileActiveColumn(col.status)}>
            {col.title}<span className="tab-count">{col.count}</span>
          </button>
        ))}
      </div>
      
      <div className="mc-board">
        <TaskColumn title="Backlog" status="backlog" tasks={backlogTasks} onSelect={setSelectedTask} 
          onDragStart={setDraggedTask} onDrop={handleDrop} isDragging={!!draggedTask} getUnreadCount={getUnreadCount} mobileActive={mobileActiveColumn === 'backlog'} />
        <TaskColumn title="Up Next" status="up-next" tasks={upNextTasks} onSelect={setSelectedTask}
          onDragStart={setDraggedTask} onDrop={handleDrop} isDragging={!!draggedTask} getUnreadCount={getUnreadCount} mobileActive={mobileActiveColumn === 'up-next'} />
        <TaskColumn title="In Progress" status="in-progress" tasks={inProgressTasks} highlight onSelect={setSelectedTask}
          onDragStart={setDraggedTask} onDrop={handleDrop} isDragging={!!draggedTask} getUnreadCount={getUnreadCount} mobileActive={mobileActiveColumn === 'in-progress'} />
        <TaskColumn title="Review" status="review" tasks={reviewTasks} onSelect={setSelectedTask}
          onDragStart={setDraggedTask} onDrop={handleDrop} isDragging={!!draggedTask} getUnreadCount={getUnreadCount} mobileActive={mobileActiveColumn === 'review'} />
        <TaskColumn title="Done" status="completed" tasks={completedTasks} onSelect={setSelectedTask}
          onDragStart={setDraggedTask} onDrop={handleDrop} isDragging={!!draggedTask} getUnreadCount={getUnreadCount} collapsible defaultCollapsed mobileActive={mobileActiveColumn === 'completed'} />
      </div>
      
      {/* Mobile FAB */}
      <button className="mc-fab" onClick={() => setShowNewTask(true)}>+</button>
      </>) : (
        <ActivityView doc={doc} onSelectTask={setSelectedTask} />
      )}
      
      {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} onCreate={createTask} />}
      
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          comments={getTaskComments(selectedTask.id)}
          agents={agents}
          taskHistory={(doc.taskHistory || {})[selectedTask.id] || []}
          taskActivity={(doc.activity || []).filter(a => activityTaskId(a) === selectedTask.id)}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onComment={addComment}
        />
      )}
    </div>
  )
}

function TaskColumn({ title, status, tasks, highlight, onSelect, onDragStart, onDrop, isDragging, getUnreadCount, collapsible, defaultCollapsed, mobileActive }) {
  const [dragOver, setDragOver] = useState(false)
  const [collapsed, setCollapsed] = useState(defaultCollapsed || false)
  
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); if (collapsed) setCollapsed(false) }
  const handleDragLeave = () => setDragOver(false)
  const handleDrop = (e) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) onDrop(taskId, status)
    setDragOver(false)
  }
  
  const columnClass = `mc-column${collapsed ? ' mc-column-collapsed' : ''}${mobileActive ? ' mobile-active' : ''}`
  
  return (
    <div className={columnClass}
      onDragOver={handleDragOver} 
      onDragLeave={handleDragLeave} 
      onDrop={handleDrop}
      style={dragOver ? { background: '#1a1a1a' } : {}}
    >
      <div style={styles.columnHeader} onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}>
        <span style={styles.columnTitle}>{collapsed ? <span className="mc-collapsed-title">{title}</span> : title}</span>
        <span style={{ ...styles.columnCount, ...(highlight && tasks.length > 0 ? styles.columnCountHighlight : {}) }}>{tasks.length}</span>
        {collapsible && <span style={styles.collapseToggle}>{collapsed ? '›' : '‹'}</span>}
      </div>
      {!collapsed && (
        <div style={styles.columnBody}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onSelect={onSelect} onDragStart={onDragStart} unreadCount={getUnreadCount(task.id)} />
          ))}
          {tasks.length === 0 && <p style={styles.emptyText}>{isDragging ? 'Drop here' : 'No tasks'}</p>}
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, onSelect, onDragStart, unreadCount }) {
  const priority = PRIORITIES.find(p => p.value === task.priority)
  
  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id)
    onDragStart(task)
  }
  
  return (
    <div 
      className="mc-card" 
      style={{ ...styles.card, ...(unreadCount > 0 ? styles.cardUnread : {}) }} 
      onClick={() => onSelect(task)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => onDragStart(null)}
    >
      <div style={styles.cardTop}>
        {priority && <span style={{ ...styles.priorityDot, background: priority.color }} title={priority.label} />}
        <p style={styles.cardTitle}>{task.title}</p>
        {unreadCount > 0 && <span style={styles.unreadBadge}>{unreadCount}</span>}
      </div>
      <div style={styles.cardMeta}>
        {task.assignee && <span style={styles.cardAssignee}>@{task.assignee}</span>}
        {task.tags?.length > 0 && task.tags.map(tag => (
          <span key={tag} style={styles.cardTag}>{tag}</span>
        ))}
      </div>
    </div>
  )
}

function NewTaskModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('p2')
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.smallModal} onClick={e => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>New Task</h2>
        <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) onCreate(title.trim(), priority) }}>
          <input ref={inputRef} type="text" placeholder="Task title..." value={title}
            onChange={e => setTitle(e.target.value)} style={styles.input} />
          <div style={styles.priorityPicker}>
            {PRIORITIES.map(p => (
              <button key={p.value} type="button"
                style={{ ...styles.priorityBtn, ...(priority === p.value ? { background: p.color, color: '#fff' } : {}) }}
                onClick={() => setPriority(p.value)}>{p.label}</button>
            ))}
          </div>
          <div style={styles.modalActions}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.btnPrimary}>Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TaskDetailModal({ task, comments, agents, onClose, onUpdate, onComment, taskHistory, taskActivity }) {
  const [commentText, setCommentText] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [newTag, setNewTag] = useState('')
  const inputRef = useRef(null)
  const commentsEndRef = useRef(null)
  const commentsContainerRef = useRef(null)
  const prevCommentsLength = useRef(comments.length)
  
  // Mark as read when opening + when new comments arrive
  useEffect(() => {
    if (comments.length > 0) {
      const latestTimestamp = comments[comments.length - 1].timestamp
      // Sync to server (global lastSeen map in this prototype)
      fetch('/mc-api/automerge/last-seen', {
        method: 'POST',
        headers: withBearerAuthHeaders(API_TOKEN, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ taskId: task.id, timestamp: latestTimestamp })
      }).catch(() => {})
    }
  }, [task.id, comments.length])
  
  // Scroll to bottom when new comments arrive
  useEffect(() => {
    if (comments.length > prevCommentsLength.current) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevCommentsLength.current = comments.length
  }, [comments.length])
  
  const scrollToRecent = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const statusCycle = { 'todo': 'up-next', 'backlog': 'up-next', 'up-next': 'in-progress', 'in-progress': 'review', 'review': 'completed', 'completed': 'backlog' }
  const statusLabels = { 'todo': 'Backlog', 'backlog': 'Backlog', 'up-next': 'Up Next', 'in-progress': 'In Progress', 'review': 'Review', 'completed': 'Done' }
  const currentPriority = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[2]
  
  const handleCommentChange = (e) => {
    const val = e.target.value
    setCommentText(val)
    
    // Check for @ mentions
    const lastAt = val.lastIndexOf('@')
    if (lastAt !== -1 && lastAt === val.length - 1 || (lastAt !== -1 && !val.substring(lastAt).includes(' '))) {
      setShowMentions(true)
      setMentionFilter(val.substring(lastAt + 1).toLowerCase())
    } else {
      setShowMentions(false)
    }
  }
  
  const insertMention = (agentName) => {
    const lastAt = commentText.lastIndexOf('@')
    const newText = commentText.substring(0, lastAt) + '@' + agentName + ' '
    setCommentText(newText)
    setShowMentions(false)
    inputRef.current?.focus()
  }
  
  const handleComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      onComment(task.id, commentText.trim())
      setCommentText('')
    }
  }
  
  const addTag = () => {
    if (newTag.trim() && !task.tags?.includes(newTag.trim())) {
      onUpdate(task.id, { tags: [...(task.tags || []), newTag.trim().toLowerCase()] })
      setNewTag('')
    }
  }
  
  const removeTag = (tag) => {
    onUpdate(task.id, { tags: (task.tags || []).filter(t => t !== tag) })
  }
  
  const filteredAgents = agents.filter(a => a.name.toLowerCase().includes(mentionFilter))
  
  const formatTime = (ts) => {
    const d = new Date(ts), now = new Date(), diff = now - d
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
    return d.toLocaleDateString()
  }
  
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div className="mc-modal-full" style={styles.fullModal} onClick={e => e.stopPropagation()}>
        <header style={styles.detailHeader}>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
          <span style={styles.taskId}>{task.id}</span>
        </header>
        
        <div style={styles.detailContent}>
          <h1 style={styles.detailTitle}>{task.title}</h1>
          
          <div style={styles.controlsRow}>
            <button style={{ ...styles.statusBadge, ...(task.status === 'in-progress' ? styles.statusBadgeActive : {}) }}
              onClick={() => onUpdate(task.id, { status: statusCycle[task.status] })}>
              {statusLabels[task.status]} →
            </button>
            
            <div style={styles.priorityPicker}>
              {PRIORITIES.map(p => (
                <button key={p.value} type="button"
                  style={{ ...styles.priorityBtnSmall, ...(task.priority === p.value ? { background: p.color, color: '#fff' } : {}) }}
                  onClick={() => onUpdate(task.id, { priority: p.value })}>{p.label}</button>
              ))}
            </div>
            
            {task.assignee && <span style={styles.detailAssignee}>@{task.assignee}</span>}
          </div>
          
          {/* Tags */}
          <div style={styles.tagsSection}>
            {(task.tags || []).map(tag => (
              <span key={tag} style={styles.tag}>
                {tag}
                <button style={styles.tagRemove} onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
            <div style={styles.addTagWrapper}>
              <input type="text" placeholder="Add tag..." value={newTag} 
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                style={styles.tagInput} />
            </div>
          </div>
          
          {task.description && (
            <div style={styles.descriptionSection}>
              <Markdown remarkPlugins={[remarkGfm]} components={{
                p: ({children}) => <p style={styles.mdP}>{children}</p>,
                a: ({href, children}) => <a href={href} style={styles.mdLink} target="_blank" rel="noopener noreferrer">{children}</a>,
                code: ({children}) => <code style={styles.mdCode}>{children}</code>,
                pre: ({children}) => <pre style={styles.mdPre}>{children}</pre>,
                ul: ({children}) => <ul style={styles.mdList}>{children}</ul>,
                ol: ({children}) => <ol style={styles.mdList}>{children}</ol>,
                li: ({children}) => <li style={styles.mdLi}>{children}</li>,
                strong: ({children}) => <strong style={styles.mdStrong}>{children}</strong>,
                table: ({children}) => <table style={styles.mdTable}>{children}</table>,
                thead: ({children}) => <thead style={styles.mdThead}>{children}</thead>,
                tbody: ({children}) => <tbody>{children}</tbody>,
                tr: ({children}) => <tr style={styles.mdTr}>{children}</tr>,
                th: ({children}) => <th style={styles.mdTh}>{children}</th>,
                td: ({children}) => <td style={styles.mdTd}>{children}</td>,
              }}>
                {task.description}
              </Markdown>
            </div>
          )}
          
          <TaskHistory
            taskHistory={taskHistory}
            comments={comments}
            taskActivity={taskActivity}
            formatTime={formatTime}
            scrollToRecent={scrollToRecent}
            commentsContainerRef={commentsContainerRef}
            commentsEndRef={commentsEndRef}
            commentText={commentText}
            handleCommentChange={handleCommentChange}
            handleComment={handleComment}
            inputRef={inputRef}
            showMentions={showMentions}
            filteredAgents={filteredAgents}
            insertMention={insertMention}
          />
        </div>
      </div>
    </div>
  )
}

function TaskHistory({ taskHistory, comments, taskActivity, formatTime, scrollToRecent, commentsContainerRef, commentsEndRef, commentText, handleCommentChange, handleComment, inputRef, showMentions, filteredAgents, insertMention }) {
  const history = useMemo(() => {
    const items = []
    const commitHashes = new Set()

    // Commits from taskHistory
    for (const entry of (taskHistory || [])) {
      if (entry.type === 'commit') {
        commitHashes.add(entry.commit?.hash)
        items.push({ ...entry, _kind: 'commit', _sortTime: new Date(entry.timestamp || 0) })
      }
    }

    // Comments
    for (const c of comments) {
      items.push({ ...c, _kind: 'comment', _sortTime: new Date(c.timestamp || 0) })
    }

    // Activity events (status changes, branches, merges — skip commit_linked duplicates)
    for (const a of (taskActivity || [])) {
      if (a.type === 'commit_linked' && a.commitHash && commitHashes.has(a.commitHash)) continue
      if (a.type === 'comment_added') continue // already have comments
      items.push({ ...a, _kind: kindFromType(a.type), _sortTime: new Date(a.timestamp || 0) })
    }

    items.sort((a, b) => a._sortTime - b._sortTime)
    return items
  }, [taskHistory, comments, taskActivity])

  return (
    <div style={styles.commentsSection}>
      <div style={styles.commentsSectionHeader}>
        <h3 style={styles.sectionTitle}>History ({history.length})</h3>
        {history.length > 5 && (
          <button style={styles.jumpBtn} onClick={scrollToRecent}>↓ Recent</button>
        )}
      </div>

      <div ref={commentsContainerRef} style={styles.commentsContainer}>
        {history.map((entry) => {
          const bc = borderColors[entry._kind] || '#333'
          const icon = kindIcons[entry._kind] || '●'

          // Comment entry
          if (entry._kind === 'comment') {
            return (
              <div key={entry.id || `comment-${entry.timestamp}-${entry.agent}`} style={{ ...styles.comment, borderLeft: `4px solid ${borderColors.comment}` }}>
                <div style={styles.commentHeader}>
                  <span>{icon} <span style={styles.commentAuthor}>@{entry.agent}</span></span>
                  <span style={styles.commentTime}>{formatTime(entry.timestamp)}</span>
                </div>
                <div style={styles.commentBody}>
                  <Markdown components={{
                    p: ({children}) => <span>{children}</span>,
                    a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{color: '#10b981'}}>{children}</a>,
                    code: ({children}) => <code style={{background: '#1a1a1a', padding: '2px 4px', borderRadius: 3, fontSize: '0.9em'}}>{children}</code>,
                    strong: ({children}) => <strong style={{color: '#fff'}}>{children}</strong>,
                  }}>{entry.content || entry.text}</Markdown>
                </div>
              </div>
            )
          }

          // Commit entry
          if (entry._kind === 'commit' && entry.commit) {
            return (
              <div key={entry.commit?.hash || `commit-${entry.timestamp}-${entry.agent}`} style={{ ...styles.commitEntry, borderLeft: `4px solid ${borderColors.commit}` }}>
                <div style={styles.commitHeader}>
                  <span>{icon}</span>
                  <code style={styles.commitHash}>{entry.commit.shortHash}</code>
                  <span style={styles.commitAgent}>@{entry.agent}</span>
                  <span style={styles.commentTimeRight}>{formatTime(entry.timestamp)}</span>
                </div>
                <div style={styles.commitMessage}>{entry.commit.message.split('\n')[0]}</div>
                {entry.commit.diff?.shortstat && (
                  <div style={styles.commitDiff}>{entry.commit.diff.shortstat}</div>
                )}
                {entry.commit.diff?.files && entry.commit.diff.files.length > 0 && (
                  <div style={styles.commitFilesList}>
                    {entry.commit.diff.files.slice(0, 5).map((f, fi) => (
                      <div key={`${f.file}-${fi}`} style={styles.commitFileEntry}>
                        {f.file} <span style={styles.commitFileAdd}>+{f.insertions || 0}</span> <span style={styles.commitFileDel}>-{f.deletions || 0}</span>
                      </div>
                    ))}
                    {entry.commit.diff.files.length > 5 && (
                      <div style={styles.commitFilesOverflow}>...and {entry.commit.diff.files.length - 5} more files</div>
                    )}
                  </div>
                )}
              </div>
            )
          }

          // Status/branch/other activity entry
          return (
            <div key={entry.id || `activity-${entry.type}-${entry.timestamp}`} style={{ ...styles.taskHistoryEvent, borderLeft: `4px solid ${bc}` }}>
              <span>{icon}</span>
              <span style={styles.commitAgent}>@{entry.agent || 'system'}</span>
              {entry.details && <span style={styles.activityEntryDetails}>{entry.details}</span>}
              <span style={styles.commentTimeRight}>{formatTime(entry.timestamp)}</span>
            </div>
          )
        })}
        <div ref={commentsEndRef} />
      </div>

      <form onSubmit={handleComment} style={styles.commentForm}>
        <div style={styles.commentInputWrapper}>
          <input ref={inputRef} type="text" placeholder="Add a comment... (@ to mention)"
            value={commentText} onChange={handleCommentChange} style={styles.commentInput} />
          {showMentions && filteredAgents.length > 0 && (
            <div style={styles.mentionDropdown}>
              {filteredAgents.map(a => (
                <div key={a.name} style={styles.mentionItem} onClick={() => insertMention(a.name)}>
                  @{a.name} <span style={styles.mentionRole}>{a.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" style={styles.btnPrimary} disabled={!commentText.trim()}>Send</button>
      </form>
    </div>
  )
}

function ActivityView({ doc, onSelectTask }) {
  const [filters, setFilters] = React.useState({
    commit: true, comment: true, status: true, task: true, branch: true, agent: true
  })
  
  const toggleFilter = (key) => setFilters(f => ({ ...f, [key]: !f[key] }))
  
  // Build a unified timeline from all sources
  const timeline = React.useMemo(() => {
    const events = []
    const commitHashes = new Set() // track commit hashes to deduplicate commit_linked activity
    
    // 1. Gather commits from taskHistory
    for (const [taskId, history] of Object.entries(doc.taskHistory || {})) {
      for (const entry of history) {
        if (entry.type === 'commit') {
          const task = (doc.tasks || {})[taskId]
          commitHashes.add(entry.commit?.hash)
          events.push({
            ...entry,
            _kind: 'commit',
            taskId,
            taskTitle: task?.title || taskId,
            _task: task,
          })
        }
      }
    }
    
    // 2. Gather activity events (skip commit_linked if we already have the commit)
    for (const entry of (doc.activity || [])) {
      // Deduplicate: if this is a commit_linked event and we already have the commit from taskHistory, skip
      if (entry.type === 'commit_linked' && entry.commitHash) {
        if (commitHashes.has(entry.commitHash)) continue
      }
      
      const taskId = activityTaskId(entry)
      const task = taskId ? (doc.tasks || {})[taskId] : null
      
      events.push({
        ...entry,
        _kind: kindFromType(entry.type),
        taskId,
        taskTitle: task?.title || taskId,
        _task: task,
      })
    }
    
    // Sort newest first
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    return events
  }, [doc])
  
  // Apply filters
  const filtered = timeline.filter(e => filters[e._kind] !== false)
  
  const formatTime = (ts) => {
    const d = new Date(ts), now = new Date(), diff = now - d
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
    return d.toLocaleDateString()
  }
  
  const filterButtons = [
    { key: 'commit', icon: '🔗', label: 'Commits' },
    { key: 'comment', icon: '💬', label: 'Comments' },
    { key: 'status', icon: '🔄', label: 'Status' },
    { key: 'task', icon: '📋', label: 'Tasks' },
    { key: 'branch', icon: '🌿', label: 'Branches' },
    { key: 'agent', icon: '🤖', label: 'Agents' },
  ]
  
  return (
    <div style={styles.activityContainer}>
      {/* Filter bar */}
      <div style={styles.timelineFilterBar}>
        {filterButtons.map(fb => (
          <button key={fb.key}
            style={{
              ...styles.timelineFilterBtn,
              ...(filters[fb.key] ? { background: '#1a1a1a', color: '#e5e5e5', borderColor: '#333' } : { opacity: 0.4 })
            }}
            onClick={() => toggleFilter(fb.key)}>
            {fb.icon} {fb.label}
          </button>
        ))}
      </div>
      
      {/* Unified timeline */}
      <div style={styles.activityPanel}>
        <h2 style={styles.activityPanelTitle}>Timeline</h2>
        <div style={styles.activityList}>
          {/* TODO: virtualize with react-window if event count grows beyond hundreds */}
          {filtered.slice(0, 80).map((entry, i) => (
            <TimelineEntry key={entry.id || `${entry.timestamp}-${i}`} entry={entry}
              formatTime={formatTime} onSelectTask={onSelectTask} />
          ))}
          {filtered.length === 0 && (
            <div style={styles.emptyText}>No activity matches your filters</div>
          )}
        </div>
      </div>
    </div>
  )
}

function kindFromType(type) {
  switch (type) {
    case 'commit_linked': return 'commit'
    case 'comment_added': return 'comment'
    case 'status_changed': return 'status'
    case 'task_created': case 'task_updated': return 'task'
    case 'task_branched': case 'task_merged': return 'branch'
    case 'agent_registered': return 'agent'
    default: return 'other'
  }
}

const borderColors = {
  commit: '#3b82f6',
  comment: '#10b981',
  task: '#8b5cf6',
  status: '#f59e0b',
  branch: '#06b6d4',
  agent: '#6b7280',
  other: '#a855f7',
}

const kindIcons = {
  commit: '🔗',
  comment: '💬',
  task: '📋',
  status: '🔄',
  branch: '🌿',
  agent: '🤖',
  other: '●',
}

function TimelineEntry({ entry, formatTime, onSelectTask }) {
  const borderColor = borderColors[entry._kind] || '#333'
  const icon = kindIcons[entry._kind] || '●'
  
  const handleClick = () => entry._task && onSelectTask(entry._task)
  
  // Commit entries get richer rendering
  if (entry._kind === 'commit' && entry.commit) {
    return (
      <div style={{ ...styles.timelineItem, borderLeftColor: borderColor }} onClick={handleClick}>
        <div style={styles.timelineItemTop}>
          <span>{icon}</span>
          <code style={styles.commitHash}>{entry.commit.shortHash}</code>
          <span style={styles.commitAgent}>@{entry.agent}</span>
          <span style={styles.activityTime}>{formatTime(entry.timestamp)}</span>
        </div>
        <div style={styles.commitMessage}>{entry.commit.message.split('\n')[0]}</div>
        {entry.taskTitle && <div style={styles.activityTaskLink}>→ {entry.taskTitle}</div>}
        {entry.commit.diff?.shortstat && (
          <div style={styles.commitDiff}>{entry.commit.diff.shortstat}</div>
        )}
      </div>
    )
  }
  
  // All other event types
  return (
    <div style={{ ...styles.timelineItem, borderLeftColor: borderColor }} onClick={handleClick}>
      <div style={styles.timelineItemTop}>
        <span>{icon}</span>
        <span style={styles.commitAgent}>@{entry.agent || 'system'}</span>
        <span style={styles.activityTime}>{formatTime(entry.timestamp)}</span>
      </div>
      {entry.taskTitle && <div style={styles.activityTaskLink}>{entry.taskTitle}</div>}
      {entry.details && <div style={styles.activityDetails}>{entry.details}</div>}
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflowX: 'hidden', overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a' },
  spinner: { width: 24, height: 24, border: '2px solid #333', borderTopColor: '#e5e5e5', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { color: '#666', marginTop: 12, fontSize: 14 },
  
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 50 },
  logo: { fontSize: 18, fontWeight: 600, color: '#fff', margin: 0 },
  headerMeta: { display: 'flex', alignItems: 'center', gap: 16 },
  stat: { fontSize: 13, color: '#666' },
  connectionDot: { width: 8, height: 8, borderRadius: '50%' },
  addBtn: { background: '#fff', color: '#0a0a0a', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  errorBanner: { margin: '12px 20px 0', padding: '10px 12px', borderRadius: 8, border: '1px solid #ef4444', color: '#fecaca', background: 'rgba(127, 29, 29, 0.35)', fontSize: 13 },
  
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #1a1a1a' },
  columnTitle: { fontSize: 13, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' },
  columnCount: { fontSize: 12, color: '#444', background: '#1a1a1a', padding: '2px 8px', borderRadius: 10 },
  columnCountHighlight: { color: '#fff', background: '#10b981' },
  columnBody: { padding: '8px 12px', minHeight: 100 },
  collapseToggle: { fontSize: 16, color: '#444', marginLeft: 8 },
  
  card: { background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: '12px 14px', marginBottom: 8, cursor: 'grab', transition: 'border-color 0.15s, box-shadow 0.15s' },
  cardUnread: { borderColor: '#10b981', boxShadow: '0 0 0 1px #10b981' },
  unreadBadge: { marginLeft: 'auto', background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center' },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0 },
  cardTitle: { fontSize: 14, fontWeight: 400, color: '#e5e5e5', margin: 0, lineHeight: 1.4 },
  cardMeta: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  cardAssignee: { fontSize: 12, color: '#10b981' },
  cardTag: { fontSize: 11, color: '#888', background: '#1a1a1a', padding: '2px 6px', borderRadius: 4 },
  emptyText: { fontSize: 13, color: '#444', textAlign: 'center', padding: 20 },
  
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  smallModal: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400, margin: 20 },
  fullModal: { background: '#0a0a0a', borderRadius: 12, width: '100%', height: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #1a1a1a', margin: 20 },
  
  modalTitle: { fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 20px' },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8, padding: '12px 14px', color: '#e5e5e5', fontSize: 15, boxSizing: 'border-box', outline: 'none' },
  priorityPicker: { display: 'flex', gap: 8, margin: '16px 0' },
  priorityBtn: { background: '#1a1a1a', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer' },
  priorityBtnSmall: { background: '#1a1a1a', border: '1px solid #333', color: '#888', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' },
  modalActions: { display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' },
  btnPrimary: { background: '#fff', color: '#0a0a0a', border: 'none', borderRadius: 6, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  btnSecondary: { background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: 6, padding: '10px 18px', fontSize: 14, cursor: 'pointer' },
  
  detailHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1a1a1a' },
  closeBtn: { background: 'transparent', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer', padding: '4px 8px' },
  taskId: { fontSize: 12, color: '#444', fontFamily: 'monospace' },
  detailContent: { flex: 1, overflow: 'auto', padding: 24 },
  detailTitle: { fontSize: 24, fontWeight: 600, color: '#fff', margin: '0 0 16px', lineHeight: 1.3 },
  controlsRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  statusBadge: { background: '#1a1a1a', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' },
  statusBadgeActive: { background: '#10b981', borderColor: '#10b981', color: '#fff' },
  detailAssignee: { fontSize: 14, color: '#10b981' },
  
  tagsSection: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, alignItems: 'center' },
  tag: { fontSize: 12, color: '#ccc', background: '#1a1a1a', padding: '4px 10px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 },
  tagRemove: { background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: 14, padding: 0 },
  addTagWrapper: { display: 'flex' },
  tagInput: { background: 'transparent', border: '1px dashed #333', borderRadius: 4, padding: '4px 10px', color: '#888', fontSize: 12, width: 80, outline: 'none' },
  
  descriptionSection: { background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: 20, marginBottom: 24 },
  mdP: { margin: '0 0 12px', lineHeight: 1.6, color: '#ccc' },
  mdLink: { color: '#10b981', textDecoration: 'none' },
  mdCode: { background: '#1a1a1a', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace' },
  mdPre: { background: '#1a1a1a', padding: 16, borderRadius: 8, overflow: 'auto', margin: '12px 0' },
  mdList: { margin: '12px 0', paddingLeft: 24, color: '#ccc' },
  mdLi: { marginBottom: 6, lineHeight: 1.5 },
  mdStrong: { color: '#fff', fontWeight: 600 },
  mdTable: { width: '100%', borderCollapse: 'collapse', margin: '12px 0', fontSize: 13 },
  mdThead: { borderBottom: '2px solid #333' },
  mdTr: { borderBottom: '1px solid #222' },
  mdTh: { padding: '8px 12px', textAlign: 'left', color: '#888', fontWeight: 500 },
  mdTd: { padding: '8px 12px', color: '#ccc' },
  
  // View toggle
  viewToggle: { background: '#1a1a1a', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  viewToggleActive: { background: '#1a2332', borderColor: '#58a6ff', color: '#58a6ff' },
  
  // Activity view
  activityContainer: { padding: '20px', maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 },
  activityPanel: { background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 20, overflow: 'hidden' },
  activityPanelTitle: { fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 16px 0' },
  activityList: { display: 'flex', flexDirection: 'column', gap: 6 },
  activityTime: { fontSize: 12, color: '#444', marginLeft: 'auto' },
  activityTaskLink: { fontSize: 12, color: '#58a6ff', marginTop: 4 },
  activityDetails: { fontSize: 13, color: '#888', marginTop: 4 },
  
  // Unified timeline
  timelineFilterBar: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  timelineFilterBtn: { background: '#0a0a0a', border: '1px solid #222', color: '#888', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' },
  timelineItem: { background: '#0a0a0a', borderLeft: '4px solid #333', borderRadius: '0 8px 8px 0', padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s' },
  timelineItemTop: { display: 'flex', alignItems: 'center', gap: 8 },
  taskHistoryEvent: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: '0 6px 6px 0', background: '#0a0a0a', fontSize: 13, marginBottom: 8 },
  commentTimeRight: { fontSize: 12, color: '#444', marginLeft: 'auto' },
  activityEntryDetails: { color: '#888', fontSize: 13 },
  commitFilesList: { marginTop: 6 },
  commitFileEntry: { fontSize: 12, color: '#666', fontFamily: 'monospace', padding: '1px 0' },
  commitFileAdd: { color: '#10b981' },
  commitFileDel: { color: '#ef4444' },
  commitFilesOverflow: { fontSize: 11, color: '#444', fontStyle: 'italic' },

  // Commits section
  commitsSection: { marginTop: 24, marginBottom: 8 },
  commitsList: { display: 'flex', flexDirection: 'column', gap: 8 },
  commitEntry: { background: '#0d1117', border: '1px solid #1a2332', borderRadius: 8, padding: '12px 16px' },
  commitHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  commitHash: { fontSize: 13, fontWeight: 600, color: '#58a6ff', background: '#0d1117', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' },
  commitAgent: { fontSize: 13, color: '#10b981', fontWeight: 500 },
  commitMessage: { fontSize: 14, color: '#ccc', lineHeight: 1.4 },
  commitDiff: { fontSize: 12, color: '#666', marginTop: 4, fontFamily: 'monospace' },

  commentsSection: { marginTop: 24 },
  commentsSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 },
  jumpBtn: { background: '#1a1a1a', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' },
  commentsContainer: { },
  comment: { background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, padding: 16, marginBottom: 12 },
  commentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  commentAuthor: { fontSize: 13, fontWeight: 500, color: '#10b981' },
  commentTime: { fontSize: 12, color: '#444' },
  commentBody: { fontSize: 14, color: '#ccc', lineHeight: 1.5 },
  commentForm: { display: 'flex', gap: 12, marginTop: 16 },
  commentInputWrapper: { flex: 1, position: 'relative' },
  commentInput: { width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '12px 14px', color: '#e5e5e5', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  mentionDropdown: { position: 'absolute', bottom: '100%', left: 0, right: 0, background: '#111', border: '1px solid #333', borderRadius: 8, marginBottom: 4, maxHeight: 200, overflow: 'auto' },
  mentionItem: { padding: '10px 14px', cursor: 'pointer', fontSize: 14, color: '#e5e5e5' },
  mentionRole: { color: '#666', marginLeft: 8, fontSize: 12 },
}

// Global styles
if (!document.getElementById('mc-styles')) {
  const styleSheet = document.createElement('style')
  styleSheet.id = 'mc-styles'
  styleSheet.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    html, body { height: 100%; overflow: auto; -webkit-overflow-scrolling: touch; }
    .mc-board { display: flex; flex-direction: column; }
    .mc-column { flex: 1; min-width: 0; border-bottom: 1px solid #1a1a1a; }
    .mc-column-collapsed { flex: 0 0 auto; }
    .mc-column-collapsed .mc-collapsed-title { display: inline; }
    
    /* Mobile styles */
    @media (max-width: 767px) {
      .mc-column-collapsed { max-height: 48px; overflow: hidden; }
      /* Mobile tabs for columns */
      .mc-mobile-tabs { display: flex; overflow-x: auto; border-bottom: 1px solid #1a1a1a; -webkit-overflow-scrolling: touch; }
      .mc-mobile-tabs::-webkit-scrollbar { display: none; }
      .mc-mobile-tab { flex: 0 0 auto; padding: 12px 16px; color: #666; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; border: none; background: transparent; cursor: pointer; white-space: nowrap; }
      .mc-mobile-tab.active { color: #fff; border-bottom: 2px solid #10b981; }
      .mc-mobile-tab .tab-count { margin-left: 6px; background: #1a1a1a; padding: 2px 6px; border-radius: 8px; font-size: 11px; }
      .mc-mobile-tab.active .tab-count { background: #10b981; color: #fff; }
      .mc-board { display: block; height: calc(100vh - 108px); overflow-y: auto; }
      .mc-column { display: none; border-bottom: none; }
      .mc-column.mobile-active { display: block; }
      /* Larger tap targets on mobile */
      .mc-card { padding: 16px; margin-bottom: 12px; }
      .mc-card .cardTitle { font-size: 16px; }
      /* Full screen modal on mobile */
      .mc-modal-full { margin: 0 !important; max-width: 100% !important; max-height: 100% !important; border-radius: 0 !important; border: none !important; }
      /* FAB for new task */
      .mc-fab { position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px; border-radius: 28px; background: #10b981; color: #fff; border: none; font-size: 28px; font-weight: 300; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: center; justify-content: center; }
      .mc-header-add { display: none; }
    }
    
    /* Desktop styles */
    @media (min-width: 768px) {
      .mc-mobile-tabs { display: none; }
      .mc-fab { display: none; }
      .mc-board { flex-direction: row; height: calc(100vh - 60px); }
      .mc-column { display: block !important; border-bottom: none; border-right: 1px solid #1a1a1a; overflow-y: auto; }
      .mc-column:last-child { border-right: none; }
      .mc-column-collapsed { flex: 0 0 48px; min-width: 48px; max-width: 48px; overflow: hidden; cursor: pointer; }
      .mc-column-collapsed > div:first-child { flex-direction: column; padding: 12px 8px; gap: 8px; cursor: pointer; }
      .mc-column-collapsed .mc-collapsed-title { writing-mode: vertical-rl; text-orientation: mixed; }
    }
    .mc-card:hover { border-color: #333; }
    .mc-card:active { cursor: grabbing; }
    input::placeholder { color: #444; }
  `
  document.head.appendChild(styleSheet)
}
