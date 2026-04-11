/**
 * Parse `owner/repo` from common GitHub `origin` remote URL shapes.
 * Host must be exactly `github.com` (avoids `notgithub.com`-style substring bugs).
 * Supports https, http, scp-style `git@github.com:`, and `ssh://git@github.com/...`.
 */

const GITHUB_HOST = 'github.com'

/** GitHub login/org and repo name — conservative; rejects `..`, `%`, odd slashes. */
function isValidGithubOwnerRepo(path) {
  if (typeof path !== 'string' || !path) return false
  if (path.includes('..') || path.includes('%') || path.includes('://')) return false
  const segments = path.split('/').filter(Boolean)
  if (segments.length !== 2) return false
  const [owner, repo] = segments
  if (owner.length < 1 || owner.length > 39) return false
  if (repo.length < 1 || repo.length > 100) return false
  // Username/org: alphanumeric or internal hyphens (not leading/trailing hyphen).
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(owner)) return false
  if (!/^[a-zA-Z0-9._-]+$/.test(repo)) return false
  return true
}

function normalizeGithubPath(pathname) {
  if (typeof pathname !== 'string') return ''
  return pathname.split('/').filter(Boolean).join('/')
}

/**
 * @param {unknown} remote
 * @returns {string | null} `owner/repo` or null
 */
export function parseGithubRepo(remote) {
  if (typeof remote !== 'string') return null
  const trimmed = remote.trim()
  if (!trimmed) return null

  // scp-style: git@github.com:owner/repo[.git]
  const scp = trimmed.match(/^git@github\.com:(.+)$/i)
  if (scp) {
    let path = scp[1].replace(/\.git$/i, '')
    if (path.includes(':')) return null
    path = path.split('/').filter(Boolean).join('/')
    return isValidGithubOwnerRepo(path) ? path : null
  }

  let path = null
  try {
    const u = new URL(trimmed)
    if (u.hostname.toLowerCase() !== GITHUB_HOST) return null

    const rawPath = u.pathname || ''
    if (rawPath.includes('//') || rawPath.includes('%')) return null

    const proto = u.protocol.toLowerCase()
    if (proto === 'http:' || proto === 'https:') {
      path = normalizeGithubPath(u.pathname).replace(/\.git$/i, '')
    } else if (proto === 'ssh:') {
      const user = (u.username || '').toLowerCase()
      if (user && user !== 'git') return null
      path = normalizeGithubPath(u.pathname).replace(/\.git$/i, '')
    } else {
      return null
    }
  } catch {
    return null
  }

  return isValidGithubOwnerRepo(path) ? path : null
}
