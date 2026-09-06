import { useCallback, useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './pardner.css'
import { createOperationId } from './operation-id.js'

const STATUSES = ['backlog', 'up-next', 'in-progress', 'review', 'completed']
const LABELS = {
  backlog: 'Backlog',
  'up-next': 'Up next',
  'in-progress': 'In progress',
  review: 'Review',
  completed: 'Completed',
}
const TOKEN_KEY = 'pardner-token'
const ACTOR_KEY = 'pardner-actor'
const PENDING_KEY = 'pardner-pending-operation'
const labelActor = (actor) =>
  actor ? `${actor.displayName || actor.handle} · ${actor.kind}` : 'Unassigned'

function SelectActor({
  actors,
  value,
  onChange,
  label = 'Actor',
  optional = false,
  emptyLabel,
}) {
  return (
    <label>
      {label}
      <select
        aria-label={label}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{emptyLabel || (optional ? 'Unassigned' : 'Choose an Actor')}</option>
        {Object.values(actors).map((actor) => (
          <option key={actor.id} value={actor.id}>
            {labelActor(actor)}
          </option>
        ))}
      </select>
    </label>
  )
}
function ErrorNotice({ error, retry }) {
  if (!error) return null
  return (
    <div className="error" role="alert">
      <strong>{error.message}</strong>
      <p>
        {error.code === 'STALE_UPDATE'
          ? 'Your draft is preserved. Review the latest context before making a new edit.'
          : 'Your last confirmed data remains available.'}
      </p>
      {retry && <button onClick={retry}>Retry saved request</button>}
    </div>
  )
}
function SaveStatus({ status, connected, busy, heads }) {
  let text = 'Connecting to local service'
  if (busy) text = 'Saving locally…'
  else if (!connected) text = 'Local service disconnected'
  else if (status?.storageError) text = 'Local save failed'
  else if (!status?.savedLocally || status.heads?.join(',') !== heads) text = 'Saving locally…'
  else if (status.syncPending) text = 'Saved locally · waiting for hub'
  else text = 'Saved locally · synced'
  return (
    <span
      className="save-status"
      role="status"
      data-pending={Boolean(status?.syncPending)}
    >
      {text}
    </span>
  )
}

export default function Pardner() {
  const [token, setToken] = useState(sessionStorage.getItem(TOKEN_KEY) || '')
  const [credential, setCredential] = useState('')
  const [config, setConfig] = useState(null)
  const [doc, setDoc] = useState(null)
  const [status, setStatus] = useState(null)
  const [connected, setConnected] = useState(false)
  const [actor, setActor] = useState(sessionStorage.getItem(ACTOR_KEY) || '')
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [view, setView] = useState('board')
  const [filter, setFilter] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [confirmedOperation, setConfirmedOperation] = useState(null)
  const [pending, setPending] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(PENDING_KEY))
    } catch {
      return null
    }
  })
  const inflight = useRef(false)
  useEffect(() => {
    fetch('/pardner/config')
      .then((response) => {
        if (!response.ok)
          throw new Error('Local service configuration is unavailable')
        return response.json()
      })
      .then(setConfig)
      .catch(setError)
  }, [])
  const request = useCallback(
    async (path, body) => {
      const base = import.meta.env.DEV ? '/pardner-api' : config?.apiBase || ''
      const response = await fetch(`${base}${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(10000),
      })
      const result = await response.json()
      if (!response.ok)
        throw Object.assign(new Error(result.error || 'Request failed'), {
          code: result.code,
          details: result.details,
        })
      return result
    },
    [config, token],
  )
  const refresh = useCallback(async () => {
    const [{ doc: next }, state] = await Promise.all([
      request('/automerge/doc'),
      request('/automerge/status'),
    ])
    setDoc(next)
    setStatus(state)
  }, [request])
  useEffect(() => {
    if (!token || !config) return
    let stopped = false,
      socket,
      timer
    const connect = async () => {
      try {
        await refresh()
        const { ticket } = await request('/automerge/ws-ticket', {})
        if (stopped) return
        const url = new URL(location.href)
        url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
        url.pathname = import.meta.env.DEV ? '/pardner-ws/' : config.wsPath
        if (!import.meta.env.DEV) url.port = config.wsPort
        url.search = new URLSearchParams({ ticket }).toString()
        socket = new WebSocket(url)
        socket.onopen = () => {
          setConnected(true)
          sessionStorage.setItem(TOKEN_KEY, token)
        }
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data)
          if (message.doc) setDoc(message.doc)
          if (message.status) setStatus(message.status)
        }
        socket.onclose = () => {
          setConnected(false)
          if (!stopped) timer = setTimeout(connect, 1000)
        }
        socket.onerror = () => socket.close()
      } catch (failure) {
        if (stopped) return
        setConnected(false)
        if (failure.code === 'AUTH_REQUIRED') {
          setToken('')
          sessionStorage.removeItem(TOKEN_KEY)
          setDoc(null)
          setError(failure)
        } else timer = setTimeout(connect, 1000)
      }
    }
    void connect()
    return () => {
      stopped = true
      clearTimeout(timer)
      socket?.close()
    }
  }, [token, config, refresh, request])
  const submit = async (type, payload, replay = null) => {
    if (inflight.current) return null
    if (!actor && !replay) {
      setError({ message: 'Choose the Actor making this change.' })
      return null
    }
    if (pending && !replay) {
      setError({
        message: 'Resolve the saved request before starting another change.',
      })
      return null
    }
    const operation = replay || {
      operationId: createOperationId(),
      actorId: actor,
      type,
      payload,
    }
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(operation))
    setPending(operation)
    inflight.current = true
    setBusy(true)
    setError(null)
    try {
      const receipt = await request('/automerge/operations', operation)
      setConfirmedOperation(operation)
      if (operation.type === 'task.create') {
        setCreating(false)
        setSelected(receipt.result.taskId)
      }
      sessionStorage.removeItem(PENDING_KEY)
      setPending(null)
      await refresh()
      return receipt
    } catch (failure) {
      setError(failure)
      // Definitive validation errors did not mutate; a new decision may follow.
      if (
        [
          'STALE_UPDATE',
          'CONFLICT_REQUIRES_RESOLUTION',
          'INVALID_ARGUMENT',
          'AMBIGUOUS_ACTOR',
          'NOT_FOUND',
          'OPERATION_ID_REUSED',
        ].includes(failure.code)
      ) {
        sessionStorage.removeItem(PENDING_KEY)
        setPending(null)
      }
      return null
    } finally {
      inflight.current = false
      setBusy(false)
    }
  }
  if (!token || !doc)
    return (
      <main className="connection">
        <h1>Pardner</h1>
        <p>One workspace for human and agent Actors.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setError(null)
            setToken(credential)
          }}
        >
          <label>
            Local service token
            <input
              type="password"
              autoComplete="off"
              required
              value={credential}
              onChange={(event) => setCredential(event.target.value)}
            />
          </label>
          <p className="muted">
            Use the token from your local service’s connection.json file. It
            stays in this browser tab.
          </p>
          <button className="primary" disabled={!config}>
            Connect
          </button>
        </form>
        {token && <p role="status">Opening your local workspace…</p>}
        <ErrorNotice error={error} />
      </main>
    )
  const actors = doc.actors
  const tasks = Object.values(doc.tasks).filter(
    (task) => !filter || task.assignee === filter,
  )
  const changeActor = (value) => {
    setActor(value)
    sessionStorage.setItem(ACTOR_KEY, value)
  }
  return (
    <div className="app">
      <header>
        <div>
          <h1>Pardner</h1>
          <SaveStatus status={status} connected={connected} busy={busy} heads={doc.heads.join(',')} />
        </div>
        <div className="header-controls">
          <SelectActor actors={actors} value={actor} onChange={changeActor} />
          <button
            className="primary"
            disabled={!actor || busy || Boolean(pending)}
            onClick={() => {
              setCreating(true)
              setSelected(null)
            }}
          >
            New task
          </button>
        </div>
      </header>
      <ErrorNotice
        error={error}
        retry={pending && !busy ? () => submit(null, null, pending) : null}
      />
      {pending && !error && (
        <div className="notice">
          A request is awaiting confirmation.{' '}
          <button disabled={busy} onClick={() => submit(null, null, pending)}>
            Retry saved request
          </button>
        </div>
      )}
      {!Object.keys(actors).length && (
        <div className="notice">
          Register your first human or agent Actor with{' '}
          <code>pardner actors register</code> to begin.
        </div>
      )}
      <nav aria-label="Workspace views">
        <button
          aria-pressed={view === 'board'}
          onClick={() => setView('board')}
        >
          Tasks
        </button>
        <button
          aria-pressed={view === 'activity'}
          onClick={() => setView('activity')}
        >
          Activity
        </button>
        <SelectActor
          label="Assigned to"
          emptyLabel="All Actors"
          actors={actors}
          value={filter}
          onChange={setFilter}
          optional
        />
      </nav>
      <main>
        {view === 'board' ? (
          <div className="board">
            {STATUSES.map((column) => (
              <section
                className="column"
                key={column}
                aria-label={LABELS[column]}
              >
                <h2>
                  {LABELS[column]}{' '}
                  <span>
                    {tasks.filter((task) => task.status === column).length}
                  </span>
                </h2>
                {tasks
                  .filter((task) => task.status === column)
                  .sort(
                    (a, b) =>
                      a.priority.localeCompare(b.priority) || a.order - b.order,
                  )
                  .map((task) => (
                    <button
                      className="task-card"
                      key={task.id}
                      onClick={() => {
                        setSelected(task.id)
                        setCreating(false)
                      }}
                    >
                      <span className="priority">
                        {task.priority.toUpperCase()}
                      </span>
                      <strong>{task.title}</strong>
                      <span>{labelActor(actors[task.assignee])}</span>
                      {Object.keys(task.conflicts).length > 0 && (
                        <span className="conflict-label">
                          Conflicting edits
                        </span>
                      )}
                    </button>
                  ))}
                {!tasks.some((task) => task.status === column) && (
                  <p className="empty">No tasks here</p>
                )}
              </section>
            ))}
          </div>
        ) : (
          <section className="activity">
            <h2>Workspace activity</h2>
            {Object.values(doc.operations)
              .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
              .map((event) => (
                <article key={event.operationId}>
                  <p>
                    <strong>{labelActor(actors[event.actorId])}</strong> ·{' '}
                    {event.type}
                  </p>
                  {event.taskId && (
                    <button onClick={() => setSelected(event.taskId)}>
                      {doc.tasks[event.taskId]?.title || event.taskId}
                    </button>
                  )}
                  <time>{new Date(event.timestamp).toLocaleString()}</time>
                </article>
              ))}
          </section>
        )}
      </main>
      {creating && (
        <TaskForm
          actors={actors}
          busy={busy}
          onClose={() => setCreating(false)}
          onSubmit={async (fields) => {
            const receipt = await submit('task.create', fields)
            if (receipt) {
              setCreating(false)
              setSelected(receipt.result.taskId)
            }
          }}
        />
      )}
      {selected && (
        <TaskDetail
          key={`${selected}:${actor}`}
          taskId={selected}
          actors={actors}
          actor={actor}
          heads={doc.heads.join(',')}
          request={request}
          confirmedOperation={confirmedOperation}
          submit={submit}
          busy={busy}
          status={status}
          connected={connected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function TaskForm({
  actors,
  busy,
  onClose,
  onSubmit,
  initial,
  editing = false,
}) {
  const [fields, setFields] = useState(
    initial || {
      title: '',
      description: '',
      priority: 'p2',
      status: 'backlog',
      assignee: null,
      tags: [],
    },
  )
  const set = (field, value) =>
    setFields((current) => ({ ...current, [field]: value }))
  const [tags, setTags] = useState(fields.tags.join(', '))
  return (
    <section
      className={editing ? 'editor' : 'side-panel'}
      aria-label={editing ? 'Edit task' : 'New task'}
    >
      {!editing && (
        <div className="panel-heading">
          <h2>New task</h2>
          <button onClick={onClose}>Close</button>
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void onSubmit({ ...fields, tags: tags.split(',').map(tag => tag.trim()).filter(Boolean) })
        }}
      >
        <label>
          Title
          <input
            required
            value={fields.title}
            onChange={(event) => set('title', event.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            rows={5}
            value={fields.description}
            onChange={(event) => set('description', event.target.value)}
          />
        </label>
        <div className="form-row">
          <label>
            Status
            <select
              aria-label="Status"
              value={fields.status}
              onChange={(event) => set('status', event.target.value)}
            >
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              aria-label="Priority"
              value={fields.priority}
              onChange={(event) => set('priority', event.target.value)}
            >
              {['p0', 'p1', 'p2', 'p3'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <SelectActor
          label="Assignee"
          actors={actors}
          value={fields.assignee}
          onChange={(value) => set('assignee', value || null)}
          optional
        />
        <label>
          Tags, separated by commas
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </label>
        <div className="actions">
          <button className="primary" disabled={busy}>
            {editing ? 'Save changes' : 'Create task'}
          </button>
          {editing && (
            <button type="button" onClick={onClose}>
              Cancel edit
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
function TaskDetail({
  taskId,
  actors,
  actor,
  heads,
  request,
  confirmedOperation,
  submit,
  busy,
  status,
  connected,
  onClose,
}) {
  const [context, setContext] = useState(null)
  const [draft, setDraft] = useState(null)
  const [message, setMessage] = useState('')
  const [to, setTo] = useState('')
  const [handoffStatus, setHandoffStatus] = useState('review')
  const [handoffMessage, setHandoffMessage] = useState('')
  const [failure, setFailure] = useState(null)
  const handoffBase = useRef(null)
  useEffect(() => {
    if (confirmedOperation?.payload.taskId !== taskId) return
    if (confirmedOperation.type === 'comment.add') {
      setMessage(current => current === confirmedOperation.payload.text ? '' : current)
    }
    if (confirmedOperation.type === 'task.handoff') {
      setHandoffMessage(current => current === confirmedOperation.payload.message ? '' : current)
      handoffBase.current = null
    }
  }, [confirmedOperation, taskId])
  useEffect(() => {
    let stale = false
    request(
      `/automerge/task/${taskId}/context${actor ? `?actor=${encodeURIComponent(actor)}` : ''}`,
    )
      .then((value) => {
        if (!stale) {
          setContext(value)
          setFailure(null)
        }
      })
      .catch((error) => {
        if (!stale) setFailure(error)
      })
    return () => {
      stale = true
    }
  }, [taskId, actor, heads, request])
  useEffect(() => {
    const key = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [onClose])
  if (!context)
    return (
      <aside className="side-panel">
        <button onClick={onClose}>Close</button>
        <p role="status">Opening task…</p>
        <ErrorNotice error={failure} />
      </aside>
    )
  const { task, comments, history, conflicts, revisions } = context
  const canWrite = Boolean(actor) && !busy
  return (
    <aside className="side-panel" aria-label="Task details">
      <div className="panel-heading">
        <h2>{task.title}</h2>
        <button onClick={onClose}>Close</button>
      </div>
      <SaveStatus status={status} connected={connected} busy={busy} heads={heads} />
      <p className="muted">
        {labelActor(actors[task.assignee])} · {LABELS[task.status]} ·{' '}
        {task.priority.toUpperCase()}
      </p>
      <ErrorNotice error={failure} />
      {draft ? (
        <TaskForm
          editing
          actors={actors}
          busy={busy}
          initial={draft.fields}
          onClose={() => setDraft(null)}
          onSubmit={async (fields) => {
            const updates = Object.fromEntries(
              Object.entries(fields).filter(
                ([key, value]) =>
                  JSON.stringify(value) !== JSON.stringify(draft.fields[key]),
              ),
            )
            if (!Object.keys(updates).length) {
              setDraft(null)
              return
            }
            const receipt = await submit('task.update', {
              taskId,
              updates,
              expectedRevisions: Object.fromEntries(
                Object.keys(updates).map((key) => [key, draft.revisions[key]]),
              ),
            })
            if (receipt) setDraft(null)
          }}
        />
      ) : (
        <>
          <div className="markdown">
            <Markdown remarkPlugins={[remarkGfm]}>
              {task.description || 'No description yet.'}
            </Markdown>
          </div>
          <button
            disabled={!canWrite}
            onClick={() =>
              setDraft({
                fields: Object.fromEntries(
                  [
                    'title',
                    'description',
                    'status',
                    'priority',
                    'assignee',
                    'tags',
                  ].map((field) => [field, task[field]]),
                ),
                revisions,
              })
            }
          >
            Edit task
          </button>
        </>
      )}
      {Object.entries(conflicts).map(([field, choices]) => (
        <section className="conflict" key={field}>
          <h3>Resolve {field}</h3>
          <p>Both edits are preserved. Choose the value to keep.</p>
          {choices.map((choice) => (
            <div key={choice.operationId}>
              <strong>{labelActor(actors[choice.actorId])}</strong>
              <p>
                {typeof choice.value === 'string'
                  ? choice.value
                  : JSON.stringify(choice.value)}
              </p>
              <button
                disabled={!canWrite}
                onClick={() =>
                  submit('task.resolve', {
                    taskId,
                    field,
                    value: choice.value,
                    expectedRevisions: revisions[field],
                  })
                }
              >
                Keep this {field}
              </button>
            </div>
          ))}
        </section>
      ))}
      <section>
        <h3>Hand off work</h3>
        <form
          onFocusCapture={() => {
            handoffBase.current ??= {
              assignee: revisions.assignee,
              status: revisions.status,
            }
          }}
          onSubmit={async (event) => {
            event.preventDefault()
            const receipt = await submit('task.handoff', {
              taskId,
              to,
              status: handoffStatus,
              message: handoffMessage,
              expectedRevisions: handoffBase.current,
            })
            if (receipt) {
              setHandoffMessage(current => current === handoffMessage ? '' : current)
              handoffBase.current = null
            }
          }}
        >
          <SelectActor
            label="Recipient"
            actors={actors}
            value={to}
            onChange={setTo}
          />
          <label>
            Handoff status
            <select
              value={handoffStatus}
              onChange={(event) => setHandoffStatus(event.target.value)}
            >
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Handoff message
            <textarea
              required
              value={handoffMessage}
              onChange={(event) => setHandoffMessage(event.target.value)}
            />
          </label>
          <button disabled={!canWrite || !to}>Hand off</button>
        </form>
      </section>
      <section>
        <div className="section-heading">
          <h3>
            Comments <span>{comments.length}</span>
          </h3>
          <button
            disabled={!canWrite || !context.unreadCount}
            onClick={() =>
              submit('read.mark', {
                taskId,
                comments: comments.flatMap((comment) =>
                  comment.revisionIds.map((revisionId) => ({
                    commentId: comment.id,
                    revisionId,
                  })),
                ),
              })
            }
          >
            Mark displayed comments read
          </button>
        </div>
        <p className="muted">
          {context.unreadCount} unread for{' '}
          {actors[actor]?.handle || 'this Actor'}
        </p>
        {comments.map((comment) => (
          <article className="comment" key={comment.id}>
            <strong>{labelActor(actors[comment.actorId])}</strong>
            <time>{new Date(comment.timestamp).toLocaleString()}</time>
            <div className="markdown">
              <Markdown remarkPlugins={[remarkGfm]}>{comment.content}</Markdown>
            </div>
            {comment.conflicts.map((choice) => (
              <div className="conflict" key={choice.operationId}>
                <strong>{labelActor(actors[choice.actorId])}</strong>
                <p>{choice.value}</p>
                <button
                  disabled={!canWrite}
                  onClick={() =>
                    submit('comment.resolve', {
                      commentId: comment.id,
                      text: choice.value,
                      expectedRevisions: comment.revisionIds,
                    })
                  }
                >
                  Keep this comment
                </button>
              </div>
            ))}
          </article>
        ))}
        <form
          onSubmit={async (event) => {
            event.preventDefault()
            const receipt = await submit('comment.add', {
              taskId,
              text: message,
            })
            if (receipt) setMessage(current => current === message ? '' : current)
          }}
        >
          <label>
            Comment
            <textarea
              aria-label="Comment"
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share progress or mention an Actor with @handle"
            />
          </label>
          <button className="primary" disabled={!canWrite}>
            Add comment
          </button>
        </form>
      </section>
      <section>
        <h3>Evidence</h3>
        {context.evidence.length ? (
          context.evidence.map((commit, index) => (
            <article key={`${commit.hash}:${index}`}>
              <code>{commit.hash}</code>
              <p>{commit.message}</p>
            </article>
          ))
        ) : (
          <p className="muted">No commit evidence linked yet.</p>
        )}
      </section>
      <section>
        <h3>History</h3>
        {history.map((event) => (
          <article className="history" key={event.operationId}>
            <strong>{labelActor(actors[event.actorId])}</strong> · {event.type}
            <time>{new Date(event.timestamp).toLocaleString()}</time>
            {event.changes.map((change) => (
              <p key={change.field}>
                {change.field}: {JSON.stringify(change.old)} →{' '}
                {JSON.stringify(change.new)}
              </p>
            ))}
          </article>
        ))}
      </section>
    </aside>
  )
}
