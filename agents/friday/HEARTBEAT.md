# HEARTBEAT.md

## Quiet Hours
Skip checks between 23:00-07:00 PST. Reply HEARTBEAT_OK.

## On Wake

### 1. Load Context
- [ ] Read WORKING.md for current task state
- [ ] Read recent memory/YYYY-MM-DD.md if exists

### 2. Check Mentions
```bash
mc mentions pending --agent friday
```
If mentions exist, process them.

### 3. Check Assigned Tasks
```bash
beans list --json | jq '.[] | select(.status == "in-progress" or .status == "todo")'
```
Look for tasks that mention "developer" or "friday" or are coding-related.

### 4. Resume or Report
- If WORKING.md has an in-progress task → continue it
- If mentions need response → respond
- If new tasks assigned → pick one up
- Otherwise → reply HEARTBEAT_OK

## Response Rules

- If actively working → update WORKING.md, do work, report progress
- If blocked → comment on task with blocker, @gary if needed
- If nothing to do → HEARTBEAT_OK
- Don't repeat same status within 1 hour unless something changed
