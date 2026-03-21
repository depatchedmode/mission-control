/**
 * Canonical task id on task-scoped records.
 * New records use `taskId`; legacy documents may still have `task_id`.
 */
export function taskRecordTaskId(record) {
  if (!record || typeof record !== 'object') return undefined
  return record.taskId ?? record.task_id
}
