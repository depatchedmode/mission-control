/**
 * Canonical task id on activity feed entries.
 * New events use `taskId`; legacy documents may still have `task_id`.
 */
export function activityTaskId(entry) {
  if (!entry || typeof entry !== 'object') return undefined
  return entry.taskId ?? entry.task_id
}
