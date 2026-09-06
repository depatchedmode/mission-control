# Agent Trace

Commit attribution tracking for agent-assisted development. Every commit made through `pardner commit` gets tagged with the selected Actor and optional model/session context for future audit trails.

## Quick Start

```bash
# Instead of: git commit -m "feat: add feature"
# Use:
pardner commit --actor builder -- -m "feat: add feature"

# Link to a Pardner task
pardner commit --actor builder --task task-abc123 -- -m "fix: resolve bug"

# View recent traced commits
pardner trace list

# Show details for a specific commit
pardner trace show abc123
```

## What Gets Captured

Each trace records:

| Field | Source | Description |
|-------|--------|-------------|
| `agent.name` | `--actor`, its `--agent` alias, or `PARDNER_ACTOR` env | Who made the commit |
| `agent.model` | `--model` or `PARDNER_AGENT_MODEL` env | AI model used |
| `agent.sessionKey` | `--session` or `PARDNER_AGENT_SESSION_KEY` env | Session for context lookup |
| `task` | `--task` flag | Linked Pardner task |
| `commit.hash` | Git | Full commit SHA |
| `commit.message` | Git | Commit message |
| `commit.author` | Git | Git author |
| `diff.stat` | Git | File change summary |
| `diff.shortstat` | Git | Insertions/deletions |
| `timestamp` | System | When trace was created |

## Commands

### `pardner commit`

Run inside a Git repository. Select an Actor with `--actor` or `PARDNER_ACTOR`.
Put Pardner options before `--` and all Git commit arguments after it. Git output
goes to stderr; stdout contains one JSON result with `trace` and `receipt` fields.
Without `--task`, the receipt is `null` and no local coordination service is needed.

```bash
# Basic usage
pardner commit --actor builder -- -m "message"

# With all options
pardner commit --actor builder --task task-123 \
  --model claude-opus --session sess-abc -- -m "message"

# Arguments after -- pass through to Git
pardner commit --actor builder -- -am "message"         # Stage tracked changes and commit
pardner commit --actor builder -- --amend               # Amend previous commit
pardner commit --actor builder -- -m "msg" --no-verify   # Skip hooks
```

### `pardner trace list`

List recent traced commits in the current repo.

```bash
pardner trace list              # Last 20 traces
pardner trace list --limit 50   # Last 50 traces
```

Returns a JSON object with a `traces` array containing the stored trace records.

### `pardner trace show`

Show full details for a specific commit.

```bash
pardner trace show abc123de    # Short hash works
pardner trace show FULL_COMMIT_HASH
```

Returns a JSON object with a `trace` field containing the matching record.

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
export PARDNER_ACTOR=builder
export PARDNER_AGENT_MODEL=claude-opus
export PARDNER_AGENT_SESSION_KEY=agent:gary:main
```

Then just:
```bash
pardner commit -- -m "message"  # Uses env vars automatically
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

- Only tracks commits made via `pardner commit`
- No retroactive attribution for existing commits
- Traces accumulate indefinitely (no auto-cleanup yet)
- Session keys in traces could be sensitive if `.agent-trace/` is shared

## Patchwork Integration

When you use `--task`, Pardner reads the task from the local service before
committing, then records a `task.link-commit` operation with the selected Actor:

```bash
pardner commit --actor builder --task task-abc123 -- -m "fix: resolve bug"
```

This means:
- **`pardner show <task-id>`** includes commit evidence alongside task context
- **`pardner trace task <task-id>`** lists all commits for a task
- **`pardner timeline`** shows commit events in the activity feed

Full provenance chain: **commit → agent trace → task → conversation**

If linking fails after Git succeeds, the error includes the existing commit hash
and recovery instructions. Use `pardner link-commit` to attach that commit; do
not rerun `pardner commit` and create another commit.

## Future Plans

- [ ] `pardner trace prune` — Clean up old traces
- [ ] Line-level attribution (Phase 4)
- [ ] Retroactive attribution for existing commits
