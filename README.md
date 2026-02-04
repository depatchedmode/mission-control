# Mission Control

Multi-agent orchestration system built on OpenClaw. AI agents working as a team with shared context, task coordination, and @mention notifications.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        MISSION CONTROL                                │
│   Activity Feed · Task Board · Agent Status · @Mention System        │
└──────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
             ┌─────────┐  ┌─────────┐  ┌─────────┐
             │  Gary   │  │ Friday  │  │ Writer  │
             │  (Lead) │  │  (Dev)  │  │(Content)│
             └────┬────┘  └────┬────┘  └────┬────┘
                  │            │            │
                  └────────────┼────────────┘
                               ▼
              ┌────────────────────────────────────┐
              │        AUTOMERGE STORE             │
              │  (CRDT: tasks, comments, mentions) │
              └────────────────────────────────────┘
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **mc CLI** | `bin/mc.js` | Agent interface to Mission Control |
| **Automerge Store** | `lib/automerge-store.js` | CRDT-based persistent storage |
| **Agent Workspaces** | `~/.openclaw/workspace-*` | Per-agent memory & state |
| **Heartbeat Crons** | OpenClaw Gateway | Wake agents every 15 minutes |
| **UI Prototype** | `ui-prototype/` | React dashboard (WIP) |

### Data Flow

1. **Agent wakes** via heartbeat cron (every 15 minutes, staggered)
2. **Reads WORKING.md** to restore context
3. **Checks @mentions** via `mc mentions pending --agent <name>`
4. **Does work** or reports `HEARTBEAT_OK`
5. **Updates state** in Automerge (comments, task status)
6. Other agents see changes on their next wake

### Agent Heartbeats

| Agent | Cron Expression | Schedule |
|-------|-----------------|----------|
| Friday (Dev) | `4,19,34,49 * * * *` | :04, :19, :34, :49 |
| Gary (Lead) | `7,22,37,52 * * * *` | :07, :22, :37, :52 |
| Writer | Not configured | — |

Staggered by 3 minutes to avoid conflicts. Each agent runs in an isolated session per heartbeat.

## CLI Reference

### Core Commands
```bash
mc tasks [--status <s>]           # List tasks
mc show <task-id>                 # Show task details
mc comment <task-id> "message"    # Add comment (use @name to mention)
mc comments <task-id>             # List task comments
mc mentions pending [--agent <n>] # Check @mentions
mc activity [--limit <n>]         # Activity feed
mc agents                         # List registered agents
```

### Patchwork Features (Timeline & Branching)
```bash
mc timeline [--agent <n>] [--task <id>] [--limit <n>]  # Rich timeline
mc diff <task-id>                 # Visual task changes
mc update <task-id> --status <s>  # Update with history tracking
mc branch <task-id> <name>        # Create experimental branch
mc branches <task-id>             # List branches
mc merge <branch-id>              # Merge branch back
```

### Environment
```bash
export MC_AGENT=friday   # Set your agent name
```

## Data Storage

### Automerge Document
Located at `.mission-control/` (binary CRDT data)

**Structure:**
```javascript
{
  tasks: { [id]: Task },           // Task objects (from beans)
  comments: { [id]: Comment },     // Comment threads
  mentions: { [id]: Mention },     // @mention tracking
  agents: { [name]: Agent },       // Agent registry
  activity: Activity[],            // Activity feed
  taskHistory: { [id]: Change[] }  // Patchwork history
}
```

### Document URL
Stored in `.mission-control-url` for sync resumption.

## Agent Workspaces

Each agent has:
```
~/.openclaw/workspace-<name>/
├── SOUL.md        # Identity & personality
├── AGENTS.md      # Operating instructions
├── WORKING.md     # Current task state (updated constantly)
├── HEARTBEAT.md   # Heartbeat protocol
├── TOOLS.md       # Local tool config
└── memory/        # Daily notes & learnings
```

### Key File: WORKING.md
```markdown
# WORKING.md

## Current Task
<task-id>: Brief description

## Status
What's done, what's in progress

## Blockers
Anything stopping progress

## Next Steps
1. Immediate next action
```

## Development

### Prerequisites
- Node.js 18+
- OpenClaw configured with agents

### Setup
```bash
cd ~/clawd/mission-control
npm install
```

### Testing
```bash
# Run the CLI
./bin/mc.js tasks
./bin/mc.js timeline --limit 5

# Test Automerge store
node test-automerge.js
```

## Integration Points

### OpenClaw
- **Heartbeat Crons**: Configured via Gateway config
- **Session Keys**: `agent:<name>:main` for main sessions
- **Isolated Sessions**: `agent:<name>:cron:<id>` for heartbeats

### Beans (Task Tracker)
- Tasks imported via `migrate-beans.js`
- IDs preserved as `clawd-<hash>`

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full plan.

### Current Focus
- ✅ Phase 1: Comments, mentions, activity
- ✅ Phase 2: Automerge CRDT storage  
- ✅ Phase 3: Multi-agent heartbeats
- 🔄 Phase 4: UI dashboard
- ⬜ Phase 5: Real-time sync between agents

## License

MIT
