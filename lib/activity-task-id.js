import { taskRecordTaskId } from './task-record-task-id.js'

/**
 * Canonical task id on activity feed entries.
 * New events use `taskId`; legacy documents may still have `task_id`.
 */
export function activityTaskId(entry) {
  return taskRecordTaskId(entry)
}
