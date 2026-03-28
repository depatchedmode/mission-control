import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const noopLogger = {
  log() {},
  warn() {},
  error() {},
}

export function createTempDir(prefix = 'mc-test-') {
  return mkdtempSync(join(tmpdir(), prefix))
}

export function cleanupTempDir(dir) {
  if (!dir) return
  rmSync(dir, { recursive: true, force: true })
}
