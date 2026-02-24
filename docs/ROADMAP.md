# Mission Control Roadmap

## Completed ✅

### Phase 1: Core Infrastructure
- [x] Automerge CRDT storage (`lib/automerge-store.js`)
- [x] Task migration from beans (historical migration phase)
- [x] CLI with full task management (`bin/mc.js`)
- [x] Comments with @mentions
- [x] Activity feed and timeline
- [x] Agent registry

### Phase 2: Real-Time Sync
- [x] WebSocket sync server (`automerge-sync-server.js`)
- [x] Multi-session document sync
- [x] Conflict-free concurrent edits (CRDT)

### Phase 3: Patchwork Features
- [x] Timeline view with rich context
- [x] Task history tracking
- [x] Branch/merge for task experimentation
- [x] Diff visualization

### Phase 4: UI Prototype
- [x] React dashboard (`ui-prototype/`)
- [x] Task board with sync
- [x] Activity feed view

---

## Current State (2026-02-08)

**Architecture:** Single-agent (Gary) using Mission Control for task tracking.
**Storage:** 65 tasks in Automerge store
**Status:** Functional, beans deprecated

---

## Future Work (Unprioritized)

### Polish & Stability
- [ ] Deploy UI to production (currently prototype only)
- [ ] Add `--json` output to CLI for scripting
- [ ] Timestamp tracking for stale task detection
- [ ] Backup/export functionality

### Patchwork UX
- [ ] UI timeline visualization
- [ ] Diff viewer in dashboard
- [ ] Branch management UI

### Automation
- [ ] Daily standup summary (cron → Telegram)
- [ ] Stale task alerts
- [ ] Activity digest

### Multi-Agent (Paused)
Previous work supported multiple agents (Gary, Friday, Writer). Currently consolidated to single Gary. Infrastructure remains if multi-agent is revisited:
- Agent registry in Automerge store
- @mention delivery system
- Staggered heartbeat support

---

## Historical Notes

- **2026-02-02**: Initial multi-agent architecture built
- **2026-02-08**: Consolidated to single-Gary; beans deprecated
- Original design was "companion layer to beans" — pivoted to full Automerge replacement
