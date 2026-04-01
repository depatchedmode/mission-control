# Mission Control

Local-first task tracking and coordination for humans and agents, built on **Automerge CRDTs** (tasks, comments, mentions, activity, timeline / patchwork, and optional git commit attribution).

## Direction

This section describes **product intent**. The **Current implementation** section below describes what this repository runs today.

### Today (user experience)

- One workspace of tasks, comments, activity, and history—**usable offline** on any device that holds a **replica** of the data.
- **Multiple replicas** (for example laptop + cloud) should **catch up automatically** when a network path exists. If something cannot be merged safely, the system should **surface that clearly** and offer a **manual / explicit** fallback.
- **Many humans and agents** contribute. **Concurrent structured edits** should **merge** without requiring Google Docs–style live co-editing of the same field.
- **Coarse access control** for now: a **shared workspace secret**, effectively **flat permissions** for everyone who has it.
- **Attribution** should be **hard to mess up by accident** (for example multiple agent personas in the same shell or wrong git metadata) and should move toward **self-verifying** actor identity over time.

### Tomorrow (user experience)

- A larger mix of humans and agents across **many sites**; **optional relays** (any node may opt in to help routing). **Intelligent routing** is expected to lean on the **sync ecosystem / dependencies**, not this repo alone.
- **Presence**: see who is “around” in the work—**including across replicas**—before or alongside deeper collaboration features.
- **Capabilities-style authorization** (for example UCAN / Keyhive-shaped ideas) with **cryptographically bound identity**. **Reads** remain broadly available to everyone admitted to the workspace (no emphasis on filtered / constrained read replicas).
- **Rich real-time co-editing** should feel **continuous** with the same local-first model. **Live editing** may assume a **shared session or live network path** between editors, while the **underlying data layer** still tolerates **offline work and partitions** elsewhere.
- **Replica-aware authorship**: part of identity is **which replica** produced a change. **Replicas** have **identity and metadata** (for example **where** they run—region, host—and **form factor**: phone, laptop, cloud VM).

### Key concepts

- **Replicas** are the unit of **storage**, **sync**, and **partition tolerance**.
- **Actors** (humans and agents) are **not bound** to a single replica; they should be able to **act from different places**, with state **converging** across replicas.
- Holding a **full replica** is **opt-in**: for **local-first authoring**, **backup / stewardship**, or running infrastructure—not a requirement for every participant.

## Current implementation

What ships in **this repository today** is a **hub-and-spoke** deployment: a **sync server** holds the Automerge document, applies mutations, and **broadcasts document snapshots** to connected WebSocket clients. The **CLI** and **daemon** talk to that server over **HTTP** only (no offline CLI path).

**This topology is the current supported runtime. Peer-to-peer replica sync (with partitions and automatic merge between replicas) is a product goal—not yet implemented here.**

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
        │ mc CLI  │      │ Sync Srv  │     │ UI Dev   │
        └─────────┘      └───────────┘     └──────────┘
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **mc CLI** | `bin/mc.js` | Primary interface for task management (HTTP client to sync server) |
| **Automerge Store** | `lib/automerge-store.js` | Persistence + CRDT document logic (used by the sync server) |
| **Sync Server** | `automerge-sync-server.js` | HTTP + WebSocket **hub** for the current deployment |
| **Notification Daemon** | `daemon/index.js` | Mention-delivery worker (OpenClaw-oriented) |
| **UI Dev Client** | `ui-prototype/src/MissionControlSync.jsx` | Supported **development** UI client |

### Current supported runtime

1. Start `automerge-sync-server.js` (HTTP + WebSocket).
2. Point CLI and daemon at that server (`MC_SYNC_SERVER` or `MC_HTTP_PORT`).
3. Run the UI through the Vite dev server proxy (`/mc-api` + `/mc-ws`).

**Note:** Anything that bypasses the sync server—including **direct `AutomergeStore` access from CLI workflows**—is **not** a supported runtime path for the shipped CLI.

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

# Start the sync server
export MC_API_TOKEN="$(openssl rand -hex 32)"
MC_API_TOKEN="$MC_API_TOKEN" npm run sync

# Use the CLI with the same token
MC_API_TOKEN="$MC_API_TOKEN" mc tasks

# Create a task
MC_API_TOKEN="$MC_API_TOKEN" mc task create "Fix the thing" --priority p1

# Add a comment
MC_API_TOKEN="$MC_API_TOKEN" mc comment <task-id> "Working on this now"

# Check activity
MC_API_TOKEN="$MC_API_TOKEN" mc activity --limit 10

# Optional workers/clients
MC_API_TOKEN="$MC_API_TOKEN" npm run daemon
VITE_MC_API_TOKEN="$MC_API_TOKEN" npm run dev --prefix ui-prototype
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
The sync server requires an API token by default.

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
- `MC_ALLOWED_ORIGINS` (comma-separated CORS allowlist, defaults to localhost dev origins; wildcard `*` is not supported)
- `MC_BIND_HOST` (default `127.0.0.1`)
- `MC_HTTP_PORT` (default `8004`)
- `MC_WS_PORT` (default `8005`)
- `MC_SYNC_SERVER` (CLI/daemon API base URL override, e.g. `http://127.0.0.1:9000`)
- `MC_ALLOW_INSECURE_LOCAL=1` (disables auth; local testing only)

For the Vite UI, set `VITE_MC_API_TOKEN` in `ui-prototype/.env.local`. The UI exchanges that token for a short-lived one-time WebSocket ticket via `/mc-api/automerge/ws-ticket`, so long-lived tokens are not placed in WS URLs.

Optional compatibility setting:
- `MC_ALLOW_LEGACY_WS_QUERY_TOKEN=1` (temporarily allow `?token=` WebSocket auth for old clients; disabled by default)

Behavior notes:
- Browser requests with an `Origin` header must match `MC_ALLOWED_ORIGINS`. Allowed preflight `OPTIONS` requests receive the same allowlisted CORS headers; disallowed origins are rejected with `403`.
- Originless non-browser requests (for example CLI and daemon traffic) are allowed and still require auth unless `MC_ALLOW_INSECURE_LOCAL=1` is set.
- CLI and daemon commands fail fast when the sync server is unreachable; they do not fall back to direct local-store access.
- The sync server logs rejected auth/origin checks with a `[security]` prefix and keeps in-memory counters for HTTP and WebSocket rejections, which are exposed for integration tests and runtime diagnostics.

## Development

### Testing
```bash
# Supported passing suites
npm test

# Opt-in roadmap/gap specs (may fail until the product catches up)
npm run test:gaps

# Install UI dependencies once, then verify the Vite build from repo root
npm install --prefix ui-prototype
npm run ui:build
```

`GAP:`-prefixed suites under `test/` are reserved for intentionally failing roadmap/specification checks. They remain runnable through `npm run test:gaps`, but `npm test` excludes them by default.

### Sync Server
```bash
# Start sync server (runs on 8004/8005)
export MC_API_TOKEN="$(openssl rand -hex 32)"
MC_API_TOKEN="$MC_API_TOKEN" npm run sync
```

## Implementation milestones (shipped)

### Phase 1: Core Infrastructure
- Automerge CRDT storage (`lib/automerge-store.js`)
- Task migration from beans (historical migration phase)
- CLI with full task management (`bin/mc.js`)
- Comments with @mentions
- Activity feed and timeline
- Agent registry

### Phase 2: Real-Time Sync (current hub)
- WebSocket sync server (`automerge-sync-server.js`)
- Multi-session document sync over WebSockets
- Conflict-free concurrent structured edits at the CRDT layer (server-side)

### Phase 3: Patchwork Features
- Timeline view with rich context
- Task history tracking
- Branch/merge for task experimentation
- Diff visualization

### Phase 4: UI Development Client
- React dashboard dev client (`ui-prototype/`)
- Task board with sync
- Activity feed view

**Also shipped:** Agent Trace (`mc commit` / `mc trace`) — see [docs/AGENT-TRACE.md](docs/AGENT-TRACE.md).

## Future work (unprioritized)

Aligned with **Direction** above, plus practical polish:

- **Replica registry and identity**; **replica-aware** attribution in the document model
- **Peer-to-peer replica sync** and **partition-tolerant** workflows (beyond hub-and-spoke)
- **Presence** across replicas
- **Capability-gated mutations** with **cryptographically bound** identity
- **Richer co-editing** (staged after presence); likely layered on top of local-first state
- Productionize UI deployment (repo ships a **development** client)
- `--json` output for CLI scripting
- Timestamp tracking for stale task detection
- Backup / export
- UI timeline visualization, diff viewer, branch management
- Optional automation (digests, alerts)—out of core scope unless prioritized

## History

- Original design was a **companion layer to beans**; the project **pivoted** to a full **Automerge-backed** system.
- Tasks were imported during migration; original IDs were preserved as `clawd-<hash>`. **Beans is deprecated.**
- **2026-02-02:** Initial multi-agent coordination features landed.
- **2026-02-08:** Operating deployment was **consolidated** around a **single-operator** workflow; multi-agent infrastructure may still exist in the data model and code paths.

## License

MIT
