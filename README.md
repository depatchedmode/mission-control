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
| **Sync Server** | `automerge-sync-server.js` | Canonical HTTP/WebSocket runtime |
| **Notification Daemon** | `daemon/index.js` | Mention delivery worker |
| **UI Prototype** | `ui-prototype/src/MissionControlSync.jsx` | React dashboard client |

### Supported Runtime Paths

Mission Control supports one runtime architecture:

1. Start `automerge-sync-server.js` (HTTP + WebSocket state authority).
2. Point CLI/daemon to that server (`MC_SYNC_SERVER` or `MC_HTTP_PORT`).
3. Run UI through Vite proxy (`/mc-api` + `/mc-ws`).

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
cd /path/to/mission-control
npm install

# Symlink for easy access
ln -s $(pwd)/bin/mc.js ~/bin/mc

# Start sync server (required for shared runtime)
export MC_API_TOKEN="$(openssl rand -hex 32)"
MC_API_TOKEN="$MC_API_TOKEN" npm run sync

# List tasks
MC_API_TOKEN="$MC_API_TOKEN" mc tasks

# Create a task
MC_API_TOKEN="$MC_API_TOKEN" mc task create "Fix the thing" --priority p1

# Add a comment
MC_API_TOKEN="$MC_API_TOKEN" mc comment <task-id> "Working on this now"

# Check activity
MC_API_TOKEN="$MC_API_TOKEN" mc activity --limit 10
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
Document URL stored in `.mission-control-url`. The sync server defaults to HTTP `8004` and WebSocket `8005` and can be configured with environment variables.

#### Security Configuration
The sync server now requires an API token by default.

```bash
# Generate a token once per shell/session
export MC_API_TOKEN="$(openssl rand -hex 32)"

# Start server (binds to 127.0.0.1 by default)
MC_API_TOKEN="$MC_API_TOKEN" npm run sync

# Use CLI/daemon with the same token
MC_API_TOKEN="$MC_API_TOKEN" mc tasks
MC_API_TOKEN="$MC_API_TOKEN" npm run daemon
```

Optional environment settings:
- `MC_ALLOWED_ORIGINS` (comma-separated CORS allowlist, defaults to localhost dev origins)
- `MC_BIND_HOST` (default `127.0.0.1`)
- `MC_HTTP_PORT` (default `8004`)
- `MC_WS_PORT` (default `8005`)
- `MC_SYNC_SERVER` (CLI/daemon API base URL override, e.g. `http://127.0.0.1:9000`)
- `MC_ALLOW_INSECURE_LOCAL=1` (disables auth; local testing only)

For the Vite UI, set `VITE_MC_API_TOKEN` in `ui-prototype/.env.local`. The UI now exchanges that token for a short-lived one-time WebSocket ticket via `/mc-api/automerge/ws-ticket`, so long-lived tokens are not placed in WS URLs.

Optional compatibility setting:
- `MC_ALLOW_LEGACY_WS_QUERY_TOKEN=1` (temporarily allow `?token=` WebSocket auth for old clients; disabled by default)

## Migration from Beans

Tasks were imported during the initial migration phase. Original IDs were preserved as `clawd-<hash>`. Beans is now deprecated.

## Development

### Testing
```bash
# Unit tests (node:test suites under test/)
npm test

# Smoke scripts (manual/runtime checks)
npm run smoke:automerge
npm run smoke:cli

# Report against an existing migrated document URL
MC_TEST_DOC_URL="<automerge-url>" npm run smoke:migrated
```

### Sync Server
```bash
# Start sync server (runs on 8004/8005)
export MC_API_TOKEN="$(openssl rand -hex 32)"
MC_API_TOKEN="$MC_API_TOKEN" npm run sync
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
