# GH #19 — Normalize activity `taskId`

- [x] Add `activityTaskId()` helper for legacy read path
- [x] Write new activity events with `taskId` only in `automerge-store.js`
- [x] Filter/query activity via helper in store, CLI, UI
- [x] Tests + verify

## Review

- Added `lib/activity-task-id.js` with `activityTaskId()` (`taskId` first, then legacy `task_id`).
- `AutomergeStore` now writes `taskId` on all task-scoped activity events; `getActivity`, `getTimeline`, and `getTaskHistory` filter via the helper.
- UI (`MissionControlSync.jsx`), CLI (`mc.js`), and smoke script use the same helper for reads.
- `recordCommit` / sync-server paths already used `taskId`; unchanged.
- Comments and mentions still use `task_id` (out of scope for activity feed issue).
