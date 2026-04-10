import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseGithubRepo } from '../lib/github-remote.js'

describe('parseGithubRepo', () => {
  it('returns null for non-strings and non-GitHub remotes', () => {
    assert.equal(parseGithubRepo(null), null)
    assert.equal(parseGithubRepo('https://gitlab.com/a/b.git'), null)
  })

  it('parses HTTPS GitHub URLs', () => {
    assert.equal(parseGithubRepo('https://github.com/acme/widget.git'), 'acme/widget')
    assert.equal(parseGithubRepo('https://github.com/acme/widget'), 'acme/widget')
    assert.equal(parseGithubRepo('http://github.com/acme/widget.git'), 'acme/widget')
  })

  it('parses scp-style git@ SSH remotes', () => {
    assert.equal(parseGithubRepo('git@github.com:acme/widget.git'), 'acme/widget')
    assert.equal(parseGithubRepo('git@github.com:acme/widget'), 'acme/widget')
  })

  it('parses ssh://git@github.com remotes', () => {
    assert.equal(parseGithubRepo('ssh://git@github.com/acme/widget.git'), 'acme/widget')
    assert.equal(parseGithubRepo('ssh://git@github.com/acme/widget'), 'acme/widget')
    assert.equal(parseGithubRepo('ssh://git@github.com:443/acme/widget.git'), 'acme/widget')
  })
})
