import fs from 'node:fs/promises'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export async function atomicWrite(filePath, bytes, io = fs) {
  const temporaryPath = `${filePath}.pardner-tmp-${randomUUID()}`
  await io.mkdir(dirname(filePath), { recursive: true })
  try {
    const handle = await io.open(temporaryPath, 'wx', 0o600)
    try {
      await handle.writeFile(bytes)
      await handle.sync()
    } finally {
      await handle.close()
    }
    await io.rename(temporaryPath, filePath)
  } finally {
    await io.rm(temporaryPath, { force: true })
  }
}
