# Agent Trace

Commit attribution tracking for agent-assisted development. Every commit made through `mc commit` gets tagged with agent context for future audit trails.

## Quick Start

```bash
# Instead of: git commit -m "feat: add feature"
# Use:
mc commit -m "feat: add feature"

# Link to a Mission Control task
mc commit -m "fix: resolve bug" --task task-abc123

# View recent traced commits
mc trace list

# Show details for a specific commit
mc trace show abc123
```

## What Gets Captured

Each trace records:

| Field | Source | Description |
|-------|--------|-------------|
| `agent.name` | `--agent` or `MC_AGENT` env | Who made the commit |
| `agent.model` | `--model` or `MC_AGENT_MODEL` env | AI model used |
| `agent.sessionKey` | `--session` or `MC_AGENT_SESSION_KEY` env | Session for context lookup |
| `task` | `--task` flag | Linked Mission Control task |
| `commit.hash` | Git | Full commit SHA |
| `commit.message` | Git | Commit message |
| `commit.author` | Git | Git author |
| `diff.stat` | Git | File change summary |
| `diff.shortstat` | Git | Insertions/deletions |
| `timestamp` | System | When trace was created |

## Commands

### `mc commit`

Drop-in replacement for `git commit`. All standard git commit flags work.

```bash
# Basic usage
mc commit -m "message"

# With all options
mc commit -m "message" \
  --task task-123 \
  --agent gary \
  --model claude-opus \
  --session sess-abc

# All other flags pass through to git
mc commit -am "message"           # Stage and commit
mc commit --amend                 # Amend previous commit
mc commit -m "msg" --no-verify    # Skip hooks
```

### `mc trace list`

List recent traced commits in the current repo.

```bash
mc trace list              # Last 20 traces
mc trace list --limit 50   # Last 50 traces
```

Output:
```
📋 Recent traced commits (3):

  abc123de @gary 2m ago
    "feat: add user authentication"
    Model: claude-opus
    Task: task-xyz
    3 files changed, 150 insertions(+), 20 deletions(-)

  def456ab @gary 1h ago
    "fix: resolve login bug"
    2 files changed, 10 insertions(+), 5 deletions(-)
```

### `mc trace show`

Show full details for a specific commit.

```bash
mc trace show abc123de    # Short hash works
mc trace show abc123...   # Full hash works too
```

Output:
```
📋 Trace: abc123def456789...
──────────────────────────────────────────────────
Timestamp:   2026-02-10T15:30:00.000Z
Message:     feat: add user authentication
Author:      gary-agent <gary@example.com>

Agent:       @gary
Model:       claude-opus
Session:     agent:gary:main
Task:        task-xyz

Diff stats:
 src/auth.js     | 100 +++++++++
 src/login.js    |  50 +++++
 tests/auth.test.js | 20 ++
 3 files changed, 150 insertions(+), 20 deletions(-)
```

## Storage

Traces are stored in `.agent-trace/` at the repository root:

```
your-repo/
├── .agent-trace/
│   ├── 2026-02-10-abc123de.json
│   ├── 2026-02-10-def456ab.json
│   └── ...
├── .gitignore  ← .agent-trace/ added automatically
└── ...
```

- **Location:** Per-repo, in `.agent-trace/`
- **Format:** JSON, one file per commit
- **Naming:** `YYYY-MM-DD-<shortHash>.json`
- **Git:** Automatically added to `.gitignore`

### Trace File Format

```json
{
  "version": 1,
  "timestamp": "2026-02-10T15:30:00.000Z",
  "commit": {
    "hash": "abc123def456789...",
    "message": "feat: add feature",
    "author": "gary-agent <gary@example.com>"
  },
  "agent": {
    "name": "gary",
    "model": "claude-opus",
    "sessionKey": "agent:gary:main"
  },
  "task": "task-xyz",
  "diff": {
    "stat": " src/file.js | 10 ++++\n 1 file changed...",
    "shortstat": " 1 file changed, 10 insertions(+)"
  }
}
```

## Environment Variables

Set these to avoid passing flags every time:

```bash
export MC_AGENT=gary
export MC_AGENT_MODEL=claude-opus
export MC_AGENT_SESSION_KEY=agent:gary:main
```

Then just:
```bash
mc commit -m "message"  # Uses env vars automatically
```

Legacy aliases remain supported for compatibility:

```bash
export OPENCLAW_MODEL=claude-opus
export OPENCLAW_SESSION_KEY=agent:gary:main
```

## Integration with External Harnesses

When running under an external agent harness, the session key can be used to look up the full conversation context later. The exact lookup path depends on the harness you are using.

This creates an audit trail from commit → agent → conversation → decisions.

## Why Use Agent Trace?

1. **Attribution** — Know which agent made which changes
2. **Audit trails** — Link commits to conversations and tasks
3. **Debugging** — When something breaks, trace back to the decision
4. **Compliance** — Demonstrate AI involvement in code changes
5. **Learning** — Analyze patterns in agent-assisted development

## Limitations

- Only tracks commits made via `mc commit`
- No retroactive attribution for existing commits
- Traces accumulate indefinitely (no auto-cleanup yet)
- Session keys in traces could be sensitive if `.agent-trace/` is shared

## Patchwork Integration

When you use `--task`, the commit is automatically linked to the task's Patchwork timeline:

```bash
mc commit -m "fix: resolve bug" --task task-abc123
# 📋 Trace recorded: abc123de
#    Agent: @gary
#    Task: task-abc123
#    📎 Linked to Patchwork timeline
```

This means:
- **`mc diff <task-id>`** shows commits alongside task status changes
- **`mc trace task <task-id>`** lists all commits for a task
- **`mc timeline`** shows commit events in the activity feed

Full provenance chain: **commit → agent trace → task → conversation**

## Future Plans

- [ ] `mc trace prune` — Clean up old traces
- [ ] Line-level attribution (Phase 4)
- [ ] Retroactive attribution for existing commits
