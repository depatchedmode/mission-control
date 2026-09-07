import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, realpath } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { canonical, requireValue } from './workspace-schema.js'

const execute = promisify(execFile)
const git = async (cwd, args) => (await execute('git', ['-C', cwd, ...args], { timeout: 10000 })).stdout.trim()

export async function planWorktreeArchive(worktree, archiveDirectory) {
  const source = await realpath(worktree)
  const repository = await realpath(resolve(source, await git(source, ['rev-parse', '--git-common-dir'])))
  const gitDirectory = await realpath(await git(source, ['rev-parse', '--absolute-git-dir']))
  requireValue(repository !== gitDirectory, 'Only linked worktrees can be archived; never the main checkout')
  await mkdir(archiveDirectory, { recursive: true, mode: 0o700 })
  const archiveRoot = await realpath(archiveDirectory)
  const within = relative(source, archiveRoot)
  requireValue(within.startsWith('../'), 'Archive directory must be outside the worktree')
  const id = createHash('sha256').update(source).digest('hex').slice(0, 16)
  return { source, repository, destination: join(archiveRoot, id) }
}

export async function moveArchivedWorktree(plan) {
  const list = await git(plan.repository, ['worktree', 'list', '--porcelain'])
  const paths = list.split('\n').filter(line => line.startsWith('worktree ')).map(line => line.slice(9))
  if (!paths.includes(plan.source) && paths.includes(plan.destination)) return
  requireValue(paths.includes(plan.source) && !paths.includes(plan.destination), 'Worktree archive locations changed; inspect before retrying')
  await mkdir(resolve(plan.destination, '..'), { recursive: true, mode: 0o700 })
  await git(plan.repository, ['worktree', 'move', plan.source, plan.destination])
}

/** A configured bridge is one ownership group; retire only when every related task closes. */
export async function retireCompletedBridge({ config, inbox, source, adapters, stopped }, {
  plan = planWorktreeArchive, move = moveArchivedWorktree,
} = {}) {
  if (!config.completionCleanup || stopped) return
  const signature = canonical(config.mappings)
  let retirement = inbox.retirement()
  if (retirement) {
    requireValue(retirement.signature === signature, 'Retiring bridge mappings changed; restore the original ownership group')
    if (retirement.state === 'archived') return
  }
  if (config.mappings.some(mapping => !mapping.enabled)) return
  if (inbox.rows().some(row => row.state !== 'accepted') || config.mappings.some(mapping => inbox.hasClaim(mapping.actorId))) return
  const taskIds = new Set(config.mappings.flatMap(mapping => mapping.allowedTaskIds))
  for (const row of inbox.rows()) taskIds.add(row.mention.taskId)
  const doc = await source.actors()
  // Branches belong to the same lifecycle, including a parent or sibling still open.
  let expanded
  do {
    expanded = false
    for (const task of Object.values(doc.tasks ?? {})) {
      const parent = task.branch?.parentId
      if (parent && (taskIds.has(task.id) || taskIds.has(parent))) {
        for (const id of [task.id, parent]) if (!taskIds.has(id)) { taskIds.add(id); expanded = true }
      }
    }
  } while (expanded)
  for (const taskId of taskIds) {
    const context = await source.context({ taskId, toActorId: config.mappings[0].actorId })
    if (context.task.status !== 'completed' || Object.keys(context.conflicts ?? {}).length) return
  }
  for (const mapping of config.mappings) {
    if ((await source.pending(mapping.actorId)).mentions.length) return
    if (!retirement?.threads.includes(mapping.threadId)) {
      const adapter = adapters.get(mapping.actorId)
      if (retirement && await adapter.isArchived(mapping)) continue
      if (await adapter.availability(mapping) !== 'ready') return
      const known = new Set(config.mappings.map(value => value.threadId))
      if ((await adapter.worktreeThreads(mapping, false)).some(thread => !known.has(thread.id))) return
    }
  }
  if (!retirement) {
    const worktrees = []
    for (const worktree of new Set(config.mappings.map(mapping => mapping.worktree))) {
      worktrees.push(await plan(worktree, config.completionCleanup.archiveDirectory))
    }
    retirement = { signature, state: 'archiving', taskIds: [...taskIds], worktrees, threads: [], startedAt: new Date().toISOString() }
    // This durable decision stops dispatch, including after a crash.
    inbox.saveRetirement(retirement)
  }
  for (const mapping of config.mappings) {
    if (retirement.threads.includes(mapping.threadId)) continue
    await adapters.get(mapping.actorId).archive(mapping)
    retirement.threads.push(mapping.threadId)
    inbox.saveRetirement(retirement)
  }
  for (const worktree of retirement.worktrees) await move(worktree)
  retirement.state = 'archived'
  retirement.finishedAt = new Date().toISOString()
  inbox.saveRetirement(retirement)
  inbox.status('cleanup', 'archived')
}
