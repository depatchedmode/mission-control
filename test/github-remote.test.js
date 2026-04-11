import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseGithubRepo } from '../lib/github-remote.js'

describe('parseGithubRepo', () => {
  it('returns null for non-strings, empty, and invalid input', () => {
    assert.equal(parseGithubRepo(undefined), null)
    assert.equal(parseGithubRepo(null), null)
    assert.equal(parseGithubRepo(123), null)
    assert.equal(parseGithubRepo(''), null)
    assert.equal(parseGithubRepo('   '), null)
  })

  it('returns null for non-GitHub hosts and substring false positives', () => {
    assert.equal(parseGithubRepo('https://gitlab.com/a/b.git'), null)
    assert.equal(parseGithubRepo('https://notgithub.com/acme/widget.git'), null)
    assert.equal(parseGithubRepo('git@notgithub.com:acme/widget.git'), null)
  })

  it('parses HTTPS and HTTP GitHub URLs', () => {
    assert.equal(parseGithubRepo('https://github.com/acme/widget.git'), 'acme/widget')
    assert.equal(parseGithubRepo('https://github.com/acme/widget'), 'acme/widget')
    assert.equal(parseGithubRepo('http://github.com/acme/widget.git'), 'acme/widget')
    assert.equal(parseGithubRepo('https://github.com:443/acme/widget.git'), 'acme/widget')
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

  it('returns null for ssh with non-git user', () => {
    assert.equal(parseGithubRepo('ssh://deploy@github.com/acme/widget.git'), null)
  })

  it('returns null for malformed paths and bad owner/repo shapes', () => {
    assert.equal(parseGithubRepo('https://github.com//acme/widget'), null)
    assert.equal(parseGithubRepo('https://github.com/acme'), null)
    assert.equal(parseGithubRepo('https://github.com/acme/widget/extra'), null)
    assert.equal(parseGithubRepo('https://github.com/acme%2Fwidget.git'), null)
    assert.equal(parseGithubRepo('https://github.com/acme/../widget.git'), null)
    assert.equal(parseGithubRepo('git@github.com:acme:widget.git'), null)
  })

  it('allows dots in repo name', () => {
    assert.equal(parseGithubRepo('https://github.com/acme/widget.js.git'), 'acme/widget.js')
  })
})
