# Agent Trace Integration Plan

## Overview

Integrate the [Agent Trace spec](https://github.com/cursor/agent-trace) with OpenClaw agents to provide visibility into "who did what" via code attribution.

---

## Current State

**How agents work now:**
1. Agent receives task/message
2. Agent edits files (via `write`, `edit` tools)
3. Agent commits changes (via `exec` → `git commit`)
4. No attribution metadata recorded

**Problem:** Can't easily answer "what did Friday write?" or "which model generated this code?"

---

## Integration Approach

### Where to generate traces

| Approach | Pros | Cons |
|----------|------|------|
| **At commit time** | Simple, aligns with git workflow | Only captures committed work |
| **At edit time** | More granular, captures WIP | Complex, lots of data |
| **Via OpenClaw hook** | Automatic, no agent changes | Requires OpenClaw changes |

**Recommendation:** Start with **commit-time traces**, optionally add edit-time later.

---

## Proposed Implementation

### 1. Trace Generation Script

Create a wrapper that agents use for commits:

```bash
# Instead of: git commit -m "message"
# Agents use: mc commit -m "message"
```

`mc commit` will:
1. Run `git commit` normally
2. Generate Agent Trace record
3. Store trace in `.agent-trace/` directory

### 2. Trace Record Format

```json
{
  "version": "1.0",
  "id": "trace-a1b2c3d4",
  "timestamp": "2026-02-02T15:20:00Z",
  "vcs": {
    "type": "git",
    "revision": "abc123def",
    "repository": "mission-control"
  },
  "tool": {
    "name": "openclaw",
    "version": "1.0.0"
  },
  "contributor": {
    "type": "ai",
    "agent": "friday",
    "model": "claude-opus-4-5",
    "session": "agent:friday:main"
  },
  "context": {
    "task_id": "clawd-pxdf",
    "message_id": "msg-123"
  },
  "files": [
    {
      "path": "src/component.jsx",
      "contributor": "ai",
      "ranges": [
        { "start": 1, "end": 50, "type": "added" }
      ]
    }
  ],
  "metadata": {
    "commit_message": "Add new component",
    "tokens_used": 1500
  }
}
```

### 3. Storage Structure

```
repository/
  .agent-trace/
    traces/
      2026-02-02/
        trace-a1b2c3d4.json
        trace-e5f6g7h8.json
    index.json          # Quick lookup index
    config.json         # Agent Trace settings
```

### 4. CLI Commands

```bash
# Commit with trace (agents use this)
mc commit -m "message" --task clawd-pxdf

# View recent traces
mc trace list [--agent friday] [--since yesterday]

# Show trace for specific commit
mc trace show abc123

# Attribution summary
mc trace summary --since "1 week ago"
# Output:
#   friday: 45 commits, 1,234 lines
#   gary: 12 commits, 456 lines
#   human: 8 commits, 234 lines
```

---

## Integration Points

### A. Agent AGENTS.md Update

Add to agent instructions:

```markdown
## Git Commits

When committing code changes, use `mc commit` instead of `git commit`:

    mc commit -m "your message" --task <task-id>

This ensures your work is properly attributed.
```

### B. Mission Control UI

Add trace visibility to the UI:

- **Task view:** Show traces/commits linked to task
- **Agent view:** Show recent traces by agent  
- **Timeline:** Include trace events in activity feed

### C. Querying

```javascript
// Get traces for a task
const traces = await store.getTracesForTask('clawd-pxdf');

// Get agent activity
const fridayWork = await store.getTracesByAgent('friday', { since: '2026-02-01' });

// Attribution stats
const stats = await store.getAttributionStats({ period: 'week' });
```

---

## Implementation Phases

### Phase 1: Basic Trace Generation (1 day)
- [ ] Create `mc commit` command
- [ ] Generate trace records on commit
- [ ] Store in `.agent-trace/` directory
- [ ] Basic `mc trace list` command

### Phase 2: Agent Integration (0.5 day)
- [ ] Update agent AGENTS.md files
- [ ] Test with Friday making commits
- [ ] Verify traces are generated

### Phase 3: Querying & Visibility (1 day)
- [ ] `mc trace summary` command
- [ ] Filter by agent, date, task
- [ ] Add to Mission Control UI

### Phase 4: Rich Attribution (optional)
- [ ] Line-level granularity
- [ ] Edit-time tracking (not just commits)
- [ ] Model/token tracking

---

## Open Questions

1. **Where do traces live?**
   - Option A: In each repo's `.agent-trace/` (distributed)
   - Option B: Centralized in Mission Control (single source)
   - **Recommendation:** Per-repo, with MC aggregating

2. **Git hooks vs explicit command?**
   - Hooks are automatic but harder to debug
   - Explicit `mc commit` is clear but requires agent compliance
   - **Recommendation:** Start explicit, add hooks later

3. **What about non-code work?**
   - Agents also write docs, configs, etc.
   - Trace all file changes? Or just code?
   - **Recommendation:** Trace everything, filter in queries

4. **Retroactive attribution?**
   - Can we attribute past commits?
   - Could use git author + heuristics
   - **Recommendation:** Future-only for now

---

## Success Criteria

**Phase 1 done when:**
- [ ] `mc commit` generates valid trace records
- [ ] Traces stored and retrievable
- [ ] Can answer "what commits did Friday make today?"

**Full integration done when:**
- [ ] All agents use `mc commit`
- [ ] UI shows trace data on tasks
- [ ] Can generate attribution reports
- [ ] Traces link to Mission Control tasks

---

## Example Workflow

1. Ryan assigns task to Friday via Mission Control
2. Friday receives @mention, starts work
3. Friday edits files, then runs:
   ```
   mc commit -m "Implement feature X" --task clawd-abc123
   ```
4. Trace record generated with:
   - Agent: friday
   - Model: claude-opus-4-5
   - Task: clawd-abc123
   - Files changed + line ranges
5. Ryan checks Mission Control:
   - Sees commit on task timeline
   - Can click to view full trace
   - Can run `mc trace summary` for weekly report

---

## Next Step

Approve this plan, and I'll implement Phase 1: basic `mc commit` with trace generation.
