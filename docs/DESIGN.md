# Mission Control Design

## Approach: Companion Layer

Rather than forking beans, we build a **companion layer** that adds collaboration features without modifying the beans codebase.

### Data Storage

```
.beans/
├── *.md                    # Bean files (unchanged)
├── comments.jsonl          # NEW: All comments
├── activity.jsonl          # NEW: Activity log
└── agents.json             # NEW: Agent registry
```

### Comments Schema

```jsonl
{"id":"c1","task_id":"clawd-pxdf","agent":"gary","content":"Starting on this now","mentions":[],"ts":"2026-02-02T00:25:00Z"}
{"id":"c2","task_id":"clawd-pxdf","agent":"writer","content":"@gary I can help with the docs","mentions":["gary"],"ts":"2026-02-02T00:30:00Z"}
```

### Activity Schema

```jsonl
{"type":"task_created","task_id":"clawd-pxdf","agent":"gary","ts":"2026-02-02T00:16:00Z"}
{"type":"comment_added","task_id":"clawd-pxdf","agent":"writer","comment_id":"c2","ts":"2026-02-02T00:30:00Z"}
{"type":"status_changed","task_id":"clawd-pxdf","agent":"gary","from":"todo","to":"in-progress","ts":"2026-02-02T00:35:00Z"}
```

### Agent Registry

```json
{
  "agents": {
    "gary": {
      "session_key": "agent:main:main",
      "role": "Lead",
      "status": "active"
    },
    "writer": {
      "session_key": "agent:writer:main",
      "role": "Content Writer",
      "status": "idle"
    }
  }
}
```

## CLI Commands

```bash
# Comments
mc comment <task-id> "message"          # Add comment
mc comments <task-id>                   # List comments
mc comments --mentions <agent>          # Find @mentions

# Activity
mc activity                             # Recent activity
mc activity --task <task-id>            # Activity for task
mc activity --agent <agent>             # Activity by agent

# Agents
mc agents list                          # List all agents
mc agents register <name> <session-key> # Add agent
mc agents status <name> <status>        # Update status

# Notifications (daemon uses these)
mc mentions pending                     # Undelivered mentions
mc mentions deliver <id>                # Mark delivered
```

## Integration Points

### 1. Agent Heartbeats

On each heartbeat, agent checks:
```bash
# Check for @mentions
mentions=$(mc mentions pending --agent $AGENT_NAME)
if [ -n "$mentions" ]; then
  # Process mentions
fi

# Check activity on assigned tasks
activity=$(mc activity --since "15 minutes ago")
```

### 2. Notification Daemon

```
┌─────────────────────────────────────┐
│       Notification Daemon           │
├─────────────────────────────────────┤
│ 1. Poll: mc mentions pending        │
│ 2. For each mention:                │
│    - Look up agent session key      │
│    - openclaw sessions send         │
│    - mc mentions deliver <id>       │
│ 3. Sleep 2s, repeat                 │
└─────────────────────────────────────┘
```

### 3. Dashboard API

Expose data via HTTP:
- `GET /api/tasks` — Tasks with comment counts
- `GET /api/comments/:taskId` — Comments for task
- `GET /api/activity` — Activity feed
- `GET /api/agents` — Agent statuses
- `POST /api/comments` — Add comment

## Implementation

Built as Node.js CLI for quick iteration:
- `mc` command installed globally
- Uses same `.beans/` directory as beans
- JSON/JSONL for storage (simple, grep-able)
- No external DB dependencies
