# Mission Control

Task tracking and coordination system built on Automerge CRDTs. Replaces beans with real-time sync, comments, activity feeds, and timeline features.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        MISSION CONTROL                                │
│   Activity Feed · Task Board · Comments · Timeline · Patchwork       │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
              ┌────────────────────────────────────┐
              │        AUTOMERGE STORE             │
              │  (CRDT: tasks, comments, activity) │
              └────────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
        ┌─────────┐      ┌───────────┐     ┌──────────┐
        │ mc CLI  │      │ Sync Srv  │     │ UI Proto │
        └─────────┘      └───────────┘     └──────────┘
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **mc CLI** | `bin/mc.js` | Primary interface for task management |
| **Automerge Store** | `lib/automerge-store.js` | CRDT-based persistent storage |
| **Sync Server** | `automerge-sync-server.js` | WebSocket real-time sync |
| **UI Prototype** | `ui-prototype/` | React dashboard (WIP) |

## CLI Reference

### Task Management
```bash
mc tasks [--status <s>]           # List tasks
mc show <task-id>                 # Show task details
mc task create "title" [options]  # Create task
   --priority <p0-p3>             # Set priority
   --assignee <name>              # Assign to someone
mc update <task-id> [options]     # Update task
   --status <s>                   # todo/in-progress/completed
```

### Comments & Activity
```bash
mc comment <task-id> "message"    # Add comment (use @name to mention)
mc comments <task-id>             # List task comments
mc activity [--limit <n>]         # Activity feed
```

### Patchwork Features
```bash
mc timeline [options]             # Rich timeline view
   --task <id>                    # Filter by task
   --limit <n>                    # Limit entries
mc diff <task-id>                 # Show task changes over time
mc branch <task-id> <name>        # Create experimental branch
mc branches <task-id>             # List branches
mc merge <branch-id>              # Merge branch back
```

### Agent Trace (Commit Attribution)
```bash
mc commit -m "message"            # Commit with agent attribution
   --task <id>                    # Link to Mission Control task
mc trace list [--limit <n>]       # List recent traced commits
mc trace show <hash>              # Show trace details
```

See [docs/AGENT-TRACE.md](docs/AGENT-TRACE.md) for full documentation.

## Quick Start

```bash
# Install
cd ~/clawd/mission-control
npm install

# Symlink for easy access
ln -s $(pwd)/bin/mc.js ~/bin/mc

# List tasks
mc tasks

# Create a task
mc task create "Fix the thing" --priority p1

# Add a comment
mc comment <task-id> "Working on this now"

# Check activity
mc activity --limit 10
```

## Data Storage

### Automerge Document
Located at `.mission-control/` (binary CRDT data)

```javascript
{
  tasks: { [id]: Task },           // Task objects
  comments: { [id]: Comment },     // Comment threads
  mentions: { [id]: Mention },     // @mention tracking
  agents: { [name]: Agent },       // Agent registry
  activity: Activity[],            // Activity feed
  taskHistory: { [id]: Change[] }  // Patchwork history
}
```

### Sync
Document URL stored in `.mission-control-url`. The sync server on ports 8004/8005 enables real-time collaboration between sessions.

## Migration from Beans

Tasks were imported during the initial migration phase. Original IDs were preserved as `clawd-<hash>`. Beans is now deprecated.

## Development

### Testing
```bash
# Run all tests
npm test
```

### Sync Server
```bash
# Start sync server (runs on 8004/8005)
node automerge-sync-server.js
```

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for details.

**Status:**
- ✅ Automerge CRDT storage
- ✅ CLI with full task management
- ✅ Comments, mentions, activity
- ✅ Real-time sync (WebSocket)
- ✅ Patchwork timeline/branching
- ✅ Agent Trace (commit attribution)
- 🔄 UI prototype (built, not deployed)

## License

MIT
