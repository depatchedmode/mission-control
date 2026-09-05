import { DatabaseSync } from 'node:sqlite'
import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { OperationError } from './workspace-schema.js'

/** The operating system releases this SQLite lock even after an abrupt exit. */
export async function acquireStorageLease(directory) {
  await mkdir(directory, { recursive: true })
  const database = new DatabaseSync(join(directory, 'runtime-lock.sqlite'))
  try {
    database.exec('PRAGMA busy_timeout = 0; BEGIN EXCLUSIVE')
  } catch (error) {
    database.close()
    if (error.errcode === 5) {
      throw new OperationError('STORAGE_IN_USE', 'Another Pardner service is using this storage directory')
    }
    throw error
  }
  return database
}
