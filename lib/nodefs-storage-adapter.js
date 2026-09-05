/**
 * Local filesystem storage adapter for Automerge Repo.
 *
 * This mirrors the behavior of the upstream nodefs adapter but uses
 * native fs APIs for range deletion to avoid bringing in rimraf/glob.
 */

import fs from 'fs'
import path from 'path'
import { atomicWrite } from './atomic-file.js'

export class NodeFSStorageAdapter {
  constructor(baseDirectory = 'automerge-repo-data', { io = fs.promises } = {}) {
    this.baseDirectory = baseDirectory
    this.io = io
    this.cache = {}
    this.pending = Promise.resolve()
  }

  enqueue(operation) {
    const result = this.pending.then(operation)
    // A failed operation is reported to its caller; later writes can retry.
    this.pending = result.catch(() => {})
    return result
  }

  async load(keyArray) {
    const key = getKey(keyArray)
    if (this.cache[key]) return this.cache[key].slice()

    const filePath = this.getFilePath(keyArray)

    try {
      const fileContent = await this.io.readFile(filePath)
      return new Uint8Array(fileContent)
    } catch (error) {
      if (error.code === 'ENOENT') return undefined
      throw error
    }
  }

  async save(keyArray, binary) {
    const key = getKey(keyArray)
    const bytes = new Uint8Array(binary)
    const filePath = this.getFilePath(keyArray)
    return this.enqueue(async () => {
      await atomicWrite(filePath, bytes, this.io)
      this.cache[key] = bytes
    })
  }

  async remove(keyArray) {
    return this.enqueue(async () => {
      await this.io.rm(this.getFilePath(keyArray), { force: true })
      delete this.cache[getKey(keyArray)]
    })
  }

  async loadRange(keyPrefix) {
    const dirPath = this.getFilePath(keyPrefix)
    const cachedKeys = this.cachedKeys(keyPrefix)
    const diskFiles = await walkdir(dirPath, this.io)

    const diskKeys = diskFiles.map((fileName) => {
      const k = getKey([path.relative(this.baseDirectory, fileName)])
      return k.slice(0, 2) + k.slice(3)
    })

    const allKeys = [...new Set([...cachedKeys, ...diskKeys])]

    const chunks = await Promise.all(
      allKeys.map(async (keyString) => {
        const key = keyString.split(path.sep)
        const data = await this.load(key)
        return { data, key }
      })
    )

    return chunks
  }

  async removeRange(keyPrefix) {
    return this.enqueue(async () => {
      await this.io.rm(this.getFilePath(keyPrefix), { recursive: true, force: true })
      this.cachedKeys(keyPrefix).forEach((key) => delete this.cache[key])
    })
  }

  cachedKeys(keyPrefix) {
    const cacheKeyPrefixString = getKey(keyPrefix)
    return Object.keys(this.cache).filter((key) =>
      key === cacheKeyPrefixString || key.startsWith(`${cacheKeyPrefixString}${path.sep}`)
    )
  }

  getFilePath(keyArray) {
    const [firstKey, ...remainingKeys] = keyArray
    return path.join(
      this.baseDirectory,
      firstKey.slice(0, 2),
      firstKey.slice(2),
      ...remainingKeys
    )
  }
}

const getKey = (key) => path.join(...key)

async function walkdir(dirPath, io) {
  try {
    const entries = await io.readdir(dirPath, { withFileTypes: true })
    const files = await Promise.all(entries.filter(entry => !entry.name.includes('.pardner-tmp-')).map((entry) => {
      const subpath = path.resolve(dirPath, entry.name)
      return entry.isDirectory() ? walkdir(subpath, io) : subpath
    }))
    return files.flat()
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}
