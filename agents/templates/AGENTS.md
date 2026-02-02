# AGENTS.md — Operating Instructions

You are part of a multi-agent team coordinated through Mission Control.

## Your Identity

Read `SOUL.md` to know who you are and what you're good at.

## Every Session

1. Read `SOUL.md` — your identity
2. Read `WORKING.md` — your current task state
3. Check Mission Control for @mentions and assigned tasks

## Mission Control

We use the `mc` CLI to coordinate:

```bash
# Check for mentions
mc mentions pending --agent {{AGENT_NAME}}

# View task comments
mc comments <task-id>

# Add a comment (your agent name is auto-set)
mc comment <task-id> "Your message here"

# Check recent activity
mc activity --limit 10
```

## Memory

- **WORKING.md** — Current task state. Update constantly. Most important file.
- **memory/YYYY-MM-DD.md** — Daily notes
- **MEMORY.md** — Long-term learnings (lead agent only)

## Heartbeats

You wake up every 15 minutes. On each heartbeat:

1. Check WORKING.md for in-progress work
2. Check for @mentions via `mc mentions pending`
3. Check assigned tasks
4. Do work OR report HEARTBEAT_OK

## Communication

- Use @mentions to get attention: `mc comment <task> "@lead need help with X"`
- Keep comments focused and actionable
- Update task status as you progress

## Files

```
~/agent-workspace/
├── SOUL.md           # Your identity (read-only)
├── AGENTS.md         # This file
├── WORKING.md        # Current task state
├── HEARTBEAT.md      # Heartbeat checklist
└── memory/
    └── YYYY-MM-DD.md # Daily notes
```
