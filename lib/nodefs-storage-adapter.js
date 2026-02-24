/**
 * Local filesystem storage adapter for Automerge Repo.
 *
 * This mirrors the behavior of the upstream nodefs adapter but uses
 * native fs APIs for range deletion to avoid bringing in rimraf/glob.
 */

import fs from 'fs'
import path from 'path'

export class NodeFSStorageAdapter {
  constructor(baseDirectory = 'automerge-repo-data') {
    this.baseDirectory = baseDirectory
    this.cache = {}
  }

  async load(keyArray) {
    const key = getKey(keyArray)
    if (this.cache[key]) return this.cache[key]

    const filePath = this.getFilePath(keyArray)

    try {
      const fileContent = await fs.promises.readFile(filePath)
      return new Uint8Array(fileContent)
    } catch (error) {
      if (error.code === 'ENOENT') return undefined
      throw error
    }
  }

  async save(keyArray, binary) {
    const key = getKey(keyArray)
    this.cache[key] = binary

    const filePath = this.getFilePath(keyArray)

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
    await fs.promises.writeFile(filePath, binary)
  }

  async remove(keyArray) {
    delete this.cache[getKey(keyArray)]

    const filePath = this.getFilePath(keyArray)
    try {
      await fs.promises.unlink(filePath)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }

  async loadRange(keyPrefix) {
    const dirPath = this.getFilePath(keyPrefix)
    const cachedKeys = this.cachedKeys(keyPrefix)
    const diskFiles = await walkdir(dirPath)

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
    this.cachedKeys(keyPrefix).forEach((key) => delete this.cache[key])

    const dirPath = this.getFilePath(keyPrefix)
    await fs.promises.rm(dirPath, { recursive: true, force: true })
  }

  cachedKeys(keyPrefix) {
    const cacheKeyPrefixString = getKey(keyPrefix)
    return Object.keys(this.cache).filter((key) => key.startsWith(cacheKeyPrefixString))
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

async function walkdir(dirPath) {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
    const files = await Promise.all(entries.map((entry) => {
      const subpath = path.resolve(dirPath, entry.name)
      return entry.isDirectory() ? walkdir(subpath) : subpath
    }))
    return files.flat()
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

