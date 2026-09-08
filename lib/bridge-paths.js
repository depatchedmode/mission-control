import { realpath, readlink } from 'node:fs/promises'
import { basename, dirname, resolve, isAbsolute, sep } from 'node:path'

// Resolve existing ancestors too: runtime directories may not exist yet, and
// archived threads retain historical paths after their checkout has moved.
export async function canonicalFilesystemPath(value) {
  const path = isAbsolute(value) ? value : `${process.cwd()}${sep}${value}`
  try { return await realpath(path) } catch (error) {
    if (error.code !== 'ENOENT') throw error
    let target
    try { target = await readlink(path) } catch (linkError) {
      if (!['ENOENT', 'EINVAL'].includes(linkError.code)) throw linkError
    }
    if (target !== undefined) return canonicalFilesystemPath(isAbsolute(target) ? target : `${dirname(path)}${sep}${target}`)
    if (dirname(path) === path) throw error
    return resolve(await canonicalFilesystemPath(dirname(path)), basename(path))
  }
}
