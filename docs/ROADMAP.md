# Mission Control Roadmap

## Phase 1: Beans Extensions ⏳
Add collaboration features to beans task tracker.

### 1.1 Comments/Messages
- [ ] Add `comments` field to bean schema
- [ ] `beans comment <id> "message"` CLI command
- [ ] Comments stored in bean markdown file
- [ ] Timestamp and author tracking

### 1.2 @Mentions
- [ ] Parse @agent-name in comments
- [ ] Store mentions in structured format
- [ ] `beans mentions list --agent <name>` to query

### 1.3 Activity Log
- [ ] Track all bean changes (created, updated, commented, status change)
- [ ] `beans activity` command to list recent activity
- [ ] Activity stored in `.beans/activity.jsonl`

### 1.4 REST API
- [ ] HTTP server for beans operations
- [ ] Endpoints: GET/POST tasks, comments, mentions, activity
- [ ] WebSocket for real-time updates (stretch)

## Phase 2: Notification Daemon ⏳
Deliver @mentions to agent sessions.

- [ ] Poll for undelivered mentions
- [ ] Map agent names to session keys
- [ ] Send via `openclaw sessions send`
- [ ] Mark as delivered
- [ ] Run as systemd/pm2 service

## Phase 3: Second Agent ⏳
Create first specialist agent.

- [ ] Separate workspace directory
- [ ] SOUL.md with specialist personality
- [ ] AGENTS.md with role-specific instructions
- [ ] Heartbeat cron (staggered from lead agent)
- [ ] Test coordination flow

## Phase 4: Mission Control UI ⏳
Extend dashboard with team view.

- [ ] Activity feed (real-time via polling)
- [ ] Task board with inline comments
- [ ] Agent status cards
- [ ] @mention autocomplete
- [ ] Filter by agent/status

## Phase 5: Daily Standup ⏳
Automated end-of-day summary.

- [ ] Cron job to compile activity
- [ ] Format as readable summary
- [ ] Send to human via Telegram
- [ ] Track what was completed/blocked

---

## Current Focus

**Phase 1.1: Comments/Messages**

Starting with the foundation — adding comments to beans so agents can discuss tasks.
