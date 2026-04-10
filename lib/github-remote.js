/**
 * Parse `owner/repo` from common GitHub `origin` remote URL shapes.
 * Supports https, scp-style SSH (git@github.com:), and ssh:// URLs.
 */
export function parseGithubRepo(remote) {
  if (typeof remote !== 'string' || !remote.includes('github.com')) return null

  let path = remote.trim()
  path = path
    .replace(/^https:\/\/github\.com\//i, '')
    .replace(/^http:\/\/github\.com\//i, '')
    .replace(/^git@github\.com:/i, '')
    .replace(/^ssh:\/\/git@github\.com(?::\d+)?\//i, '')
    .replace(/\.git$/i, '')

  if (!path || path.includes('://')) return null
  // Reject leftovers like alternate auth forms we do not normalize.
  if (path.includes('@')) return null
  return path
}
