# Gameplan

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

What ships in **this repository today** is a **hub-and-spoke** deployment: a **sync server** holds the Automerge document, applies mutations, and **broadcasts document snapshots** to connected WebSocket clients. The **CLI** and any **external agent harnesses** talk to that server over **HTTP** only (no offline CLI path).

**This topology is the current supported runtime. Peer-to-peer replica sync (with partitions and automatic merge between replicas) is a product goal—not yet implemented here.**

```
┌──────────────────────────────────────────────────────────────────────┐
│                        GAMEPLAN                                │
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
        │ gp CLI  │      │ Sync Srv  │     │ UI Dev   │
        └─────────┘      └───────────┘     └──────────┘
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **gp CLI** | `bin/gp.js` | Primary interface for task management (HTTP client to sync server) |
| **Automerge Store** | `lib/automerge-store.js` | Persistence + CRDT document logic (used by the sync server) |
| **Sync Server** | `automerge-sync-server.js` | HTTP + WebSocket **hub** for the current deployment |
| **UI Dev Client** | `ui-prototype/src/MissionControlSync.jsx` | Supported **development** UI client |

### Current supported runtime

1. Start `automerge-sync-server.js` (HTTP + WebSocket).
2. Point the CLI and any external agent harnesses at that server (`GP_SYNC_SERVER` or `GP_HTTP_PORT`).
3. Run the UI through the Vite dev server proxy (`/gp-api` + `/gp-ws`).

**Note:** Anything that bypasses the sync server—including **direct `AutomergeStore` access from CLI workflows**—is **not** a supported runtime path for the shipped CLI.

## CLI Reference

### Task Management
```bash
gp tasks [--status <s>] [--assignee <name>]   # List tasks
gp show <task-id>                             # Show task details
gp task create "title" [options]              # Create task
   --priority <p0-p3>                         # Set priority
   --assignee <name>                          # Assign to someone
   --tag <tag>                                # Optional tag
gp update <task-id> [options]                 # Update task
   --status <s>                               # todo/in-progress/completed
   --assignee <name>                          # Reassign
   --title "text"                             # Rename
   --description "text"                       # Body
   --priority <p0-p3>                         # Priority
   --agent <name>                             # Actor (defaults to GP_AGENT or "unknown")
```

### Comments & Activity
```bash
gp comment <task-id> "message"    # Add comment (use @name to mention)
gp comments <task-id>             # List task comments
gp comment-delete <comment-id>    # Delete a comment by ID
gp mentions pending [--agent <name>] [--json]         # Pending @mentions
gp mentions <agent>               # Same pool, filter by agent (positional)
gp mentions claim <mention-id> [--json]               # Claim a mention lease
gp mentions claim-next --agent <name> [--json]        # Claim the next mention
gp mentions ack <mention-id> --claim-token <token>    # Mark delivered
gp mentions release <mention-id> --claim-token <token> [--error <msg>] [--json]
gp activity [--limit <n>]         # Activity feed
gp agents list                    # List registered agents
```

### Patchwork Features
```bash
gp timeline [options]             # Rich timeline view
   --agent <name>                 # Filter by actor
   --task <id>                    # Filter by task
   --limit <n>                    # Limit entries
gp diff <task-id>                 # Show task changes over time
gp branch <task-id> <name>        # Create experimental branch
gp branches <task-id>             # List branches
gp merge <branch-task-id>         # Merge branch task back into parent
```

### Agent Trace (Commit Attribution)
```bash
gp commit -m "message"            # Commit with agent attribution
   --task <id>                    # Link to Gameplan task
gp trace list [--limit <n>]       # List recent traced commits
gp trace show <hash>              # Show trace details
gp trace task <task-id>           # Commits linked to a task
```

See [docs/AGENT-TRACE.md](docs/AGENT-TRACE.md) for full documentation.

## Mention Workflow

Gameplan does not shell out to agent runtimes. External harnesses should poll and advance mention leases through `mc`.
`gp mentions claim-next` is atomic on the server: each call selects and claims at most one lease for the requested agent.

```bash
# Get work for one agent
gp mentions claim-next --agent gary --json

# If delivery succeeds, acknowledge it
gp mentions ack <mention-id> --claim-token <token> --json

# If delivery fails, release it for retry
gp mentions release <mention-id> --claim-token <token> --error "transport failed" --json
```

`GP_MENTION_CLAIM_TTL_MS` controls how long a claim stays hidden from other pollers before it becomes pending again.

## Quick Start

```bash
# Install
cd /path/to/gameplan
npm install

# Symlink for easy access
ln -s $(pwd)/bin/gp.js ~/bin/gp

# Start the sync server
export GP_API_TOKEN="$(openssl rand -hex 32)"
GP_API_TOKEN="$GP_API_TOKEN" npm run sync

# Use the CLI with the same token
GP_API_TOKEN="$GP_API_TOKEN" mc tasks

# Create a task
GP_API_TOKEN="$GP_API_TOKEN" mc task create "Fix the thing" --priority p1

# Add a comment
GP_API_TOKEN="$GP_API_TOKEN" mc comment <task-id> "Working on this now"

# Check activity
GP_API_TOKEN="$GP_API_TOKEN" mc activity --limit 10

# Optional external harness flow
GP_API_TOKEN="$GP_API_TOKEN" mc mentions claim-next --agent gary --json
GP_API_TOKEN="$GP_API_TOKEN" mc mentions ack <mention-id> --claim-token <token> --json

# Optional UI client
VITE_GP_API_TOKEN="$GP_API_TOKEN" npm run dev --prefix ui-prototype
```

By default the sync server stores data under the **current working directory**. To pin a data root (for example a dedicated folder), set `GP_STORAGE_PATH` when starting the server and use the same layout described under **Data Storage** below.

## Data Storage

### Automerge Document
Binary CRDT data lives under a `.gameplan/` directory.

- **Default** (no `GP_STORAGE_PATH`): `./.gameplan/` in the directory from which you start the sync server, with the document handle in `./.gameplan-url`.
- **With `GP_STORAGE_PATH` set:** `$GP_STORAGE_PATH/.gameplan/` for binary data, and `$GP_STORAGE_PATH/.gameplan/document-url` for the document handle (not `.gameplan-url` in the cwd).

```javascript
{
  tasks: { [id]: Task },           // Task objects
  comments: { [id]: Comment },     // Comment threads
  mentions: { [id]: Mention },     // @mention tracking + lease metadata
  agents: { [name]: Agent },       // Agent registry
  activity: Activity[],            // Activity feed
  taskHistory: { [id]: Change[] }  // Patchwork history
}
```

### Sync
See **Automerge Document** above for where the document URL file lives (`.gameplan-url` by default, or `document-url` under `.gameplan` when using `GP_STORAGE_PATH`). The sync server defaults to HTTP `8004` and WebSocket `8005` and can be configured with environment variables.

#### Security Configuration
The sync server requires an API token by default.

```bash
# Generate a token once per shell/session
export GP_API_TOKEN="$(openssl rand -hex 32)"

# Start server (binds to 127.0.0.1 by default)
GP_API_TOKEN="$GP_API_TOKEN" npm run sync

# Use the CLI or any harness wrapper with the same token
GP_API_TOKEN="$GP_API_TOKEN" mc tasks
```

Optional environment settings:
- `GP_ALLOWED_ORIGINS` (comma-separated CORS allowlist, defaults to localhost dev origins; wildcard `*` is not supported)
- `GP_BIND_HOST` (default `127.0.0.1`)
- `GP_HTTP_PORT` (default `8004`)
- `GP_WS_PORT` (default `8005`)
- `GP_SYNC_SERVER` (CLI/harness API base URL override, e.g. `http://127.0.0.1:9000`)
- `GP_STORAGE_PATH` (optional directory; store uses `$GP_STORAGE_PATH/.gameplan` and nested `document-url` as above)
- `GP_MENTION_CLAIM_TTL_MS` (optional lease length for mention delivery claims; default `30000`)
- `GP_ALLOW_INSECURE_LOCAL=1` (disables auth; local testing only)

For the Vite UI, set `VITE_GP_API_TOKEN` in `ui-prototype/.env.local`. The UI exchanges that token for a short-lived one-time WebSocket ticket via `/gp-api/automerge/ws-ticket`, so long-lived tokens are not placed in WS URLs.

Optional compatibility setting:
- `GP_ALLOW_LEGACY_WS_QUERY_TOKEN=1` (temporarily allow `?token=` WebSocket auth for old clients; disabled by default)

Behavior notes:
- Browser requests with an `Origin` header must match `GP_ALLOWED_ORIGINS`. Allowed preflight `OPTIONS` requests receive the same allowlisted CORS headers; disallowed origins are rejected with `403`.
- Originless non-browser requests (for example CLI and harness traffic) are allowed and still require auth unless `GP_ALLOW_INSECURE_LOCAL=1` is set.
- CLI commands and any harnesses that wrap them fail fast when the sync server is unreachable; they do not fall back to direct local-store access.
- The sync server logs rejected auth/origin checks with a `[security]` prefix and keeps in-memory counters for HTTP and WebSocket rejections. Those counters are available on the server instance (used by integration tests and any embedder); they are **not** exposed as a public HTTP API.

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
Same as [Quick Start](#quick-start): `GP_API_TOKEN="$GP_API_TOKEN" npm run sync` (HTTP `8004`, WebSocket `8005` by default). Run from the repo root (or set `GP_STORAGE_PATH`) so `.gameplan` lands where you expect.

## Implementation milestones (shipped)

### Phase 1: Core Infrastructure
- Automerge CRDT storage (`lib/automerge-store.js`)
- Task migration from beans (historical migration phase)
- CLI with full task management (`bin/gp.js`)
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

**Also shipped:** Agent Trace (`gp commit` / `gp trace`) — see [docs/AGENT-TRACE.md](docs/AGENT-TRACE.md).

## Future work (unprioritized)

Aligned with **Direction** above, plus practical polish:

- **Replica registry and identity**; **replica-aware** attribution in the document model
- **Peer-to-peer replica sync** and **partition-tolerant** workflows (beyond hub-and-spoke)
- **Presence** across replicas
- **Capability-gated mutations** with **cryptographically bound** identity
- **Richer co-editing** (staged after presence); likely layered on top of local-first state
- Productionize UI deployment (repo ships a **development** client)
- Broader `--json` output coverage beyond mention orchestration
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
