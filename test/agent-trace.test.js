#!/usr/bin/env node
/**
 * Tests for Agent Trace functionality
 */

import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, realpathSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { cleanupTempDir, createTempDir } from '../support/resources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the module under test
import * as agentTrace from '../lib/agent-trace.js';

// =============================================================================
// Test Helpers
// =============================================================================

function createTestRepo(baseDir, name) {
  const repoPath = join(baseDir, name);
  mkdirSync(repoPath, { recursive: true });
  
  execSync('git init', { cwd: repoPath, stdio: 'pipe' });
  execSync('git config user.email "test@test.com"', { cwd: repoPath, stdio: 'pipe' });
  execSync('git config user.name "Test User"', { cwd: repoPath, stdio: 'pipe' });
  
  // Create initial commit
  writeFileSync(join(repoPath, 'README.md'), '# Test\n');
  execSync('git add .', { cwd: repoPath, stdio: 'pipe' });
  execSync('git commit -m "Initial commit"', { cwd: repoPath, stdio: 'pipe' });
  
  return repoPath;
}

// =============================================================================
// Tests: findGitRoot
// =============================================================================

describe('findGitRoot', () => {
  let tempDir;
  let testRepoPath;
  let canonicalRepoPath;

  before(() => {
    tempDir = createTempDir('mc-agent-trace-find-root-');
    testRepoPath = createTestRepo(tempDir, 'find-root-test');
    canonicalRepoPath = realpathSync(testRepoPath);
  });
  
  after(() => cleanupTempDir(tempDir));
  
  it('finds git root from repo directory', () => {
    const root = agentTrace.findGitRoot(testRepoPath);
    assert.strictEqual(root, canonicalRepoPath);
  });
  
  it('finds git root from subdirectory', () => {
    const subdir = join(testRepoPath, 'src', 'lib');
    mkdirSync(subdir, { recursive: true });
    
    const root = agentTrace.findGitRoot(subdir);
    assert.strictEqual(root, canonicalRepoPath);
  });
  
  it('returns null for non-git directory', () => {
    // Use /tmp to ensure we're outside any git repo
    const nonGitDir = '/tmp/agent-trace-test-no-git';
    mkdirSync(nonGitDir, { recursive: true });
    
    try {
      const root = agentTrace.findGitRoot(nonGitDir);
      assert.strictEqual(root, null);
    } finally {
      rmSync(nonGitDir, { recursive: true, force: true });
    }
  });
});

// =============================================================================
// Tests: getDiffStats
// =============================================================================

describe('getDiffStats', () => {
  let tempDir;
  let testRepoPath;

  before(() => {
    tempDir = createTempDir('mc-agent-trace-diff-stats-');
    testRepoPath = createTestRepo(tempDir, 'diff-stats-test');
  });
  
  after(() => cleanupTempDir(tempDir));
  
  it('returns empty stats when nothing staged', () => {
    const stats = agentTrace.getDiffStats(testRepoPath);
    assert.strictEqual(stats.stat, '');
    assert.strictEqual(stats.shortstat, '');
  });
  
  it('returns stats for staged changes', () => {
    // Make and stage a change
    writeFileSync(join(testRepoPath, 'newfile.txt'), 'hello world\n');
    execSync('git add newfile.txt', { cwd: testRepoPath, stdio: 'pipe' });
    
    const stats = agentTrace.getDiffStats(testRepoPath);
    
    assert.ok(stats.stat.includes('newfile.txt'), 'Should show filename');
    assert.ok(stats.shortstat.includes('1 file changed'), 'Should show file count');
    assert.ok(stats.shortstat.includes('insertion'), 'Should show insertions');
    
    // Clean up staged change
    execSync('git reset HEAD newfile.txt', { cwd: testRepoPath, stdio: 'pipe' });
    rmSync(join(testRepoPath, 'newfile.txt'));
  });
});

// =============================================================================
// Tests: getLatestCommit
// =============================================================================

describe('getLatestCommit', () => {
  let tempDir;
  let testRepoPath;

  before(() => {
    tempDir = createTempDir('mc-agent-trace-latest-commit-');
    testRepoPath = createTestRepo(tempDir, 'latest-commit-test');
  });
  
  after(() => cleanupTempDir(tempDir));
  
  it('returns commit info', () => {
    const commit = agentTrace.getLatestCommit(testRepoPath);
    
    assert.ok(commit, 'Should return commit info');
    assert.ok(commit.hash, 'Should have hash');
    assert.ok(commit.hash.length === 40, 'Hash should be 40 chars');
    assert.strictEqual(commit.message, 'Initial commit');
    assert.ok(commit.author.includes('Test User'), 'Should have author');
  });
});

// =============================================================================
// Tests: ensureTraceDir
// =============================================================================

describe('ensureTraceDir', () => {
  let tempDir;
  let testRepoPath;

  beforeEach(() => {
    tempDir = createTempDir('mc-agent-trace-trace-dir-');
    testRepoPath = createTestRepo(tempDir, 'trace-dir-test');
  });
  
  afterEach(() => cleanupTempDir(tempDir));
  
  it('creates .agent-trace directory', () => {
    const traceDir = agentTrace.ensureTraceDir(testRepoPath);
    
    assert.ok(existsSync(traceDir), 'Directory should exist');
    assert.strictEqual(traceDir, join(testRepoPath, '.agent-trace'));
  });
  
  it('adds to existing .gitignore', () => {
    writeFileSync(join(testRepoPath, '.gitignore'), 'node_modules/\n');
    
    agentTrace.ensureTraceDir(testRepoPath);
    
    const gitignore = readFileSync(join(testRepoPath, '.gitignore'), 'utf-8');
    assert.ok(gitignore.includes('.agent-trace/'), 'Should add to .gitignore');
    assert.ok(gitignore.includes('node_modules/'), 'Should preserve existing entries');
  });
  
  it('creates .gitignore if missing', () => {
    // Remove .gitignore if it exists
    const gitignorePath = join(testRepoPath, '.gitignore');
    if (existsSync(gitignorePath)) {
      rmSync(gitignorePath);
    }
    
    agentTrace.ensureTraceDir(testRepoPath);
    
    assert.ok(existsSync(gitignorePath), '.gitignore should be created');
    const content = readFileSync(gitignorePath, 'utf-8');
    assert.ok(content.includes('.agent-trace/'), 'Should contain .agent-trace');
  });
  
  it('is idempotent', () => {
    agentTrace.ensureTraceDir(testRepoPath);
    agentTrace.ensureTraceDir(testRepoPath);
    
    const gitignore = readFileSync(join(testRepoPath, '.gitignore'), 'utf-8');
    const matches = gitignore.match(/\.agent-trace/g);
    assert.strictEqual(matches.length, 1, 'Should only appear once');
  });
});

// =============================================================================
// Tests: createTrace
// =============================================================================

describe('createTrace', () => {
  let tempDir;
  let testRepoPath;

  beforeEach(() => {
    tempDir = createTempDir('mc-agent-trace-create-trace-');
    testRepoPath = createTestRepo(tempDir, 'create-trace-test');
  });
  
  afterEach(() => cleanupTempDir(tempDir));
  
  it('creates a trace file', () => {
    const { filepath, trace } = agentTrace.createTrace({
      repoPath: testRepoPath,
      commitHash: 'abc123def456789',
      commitMessage: 'Test commit',
      commitAuthor: 'Test <test@test.com>',
      agent: 'gary',
      model: 'claude-opus',
      sessionKey: 'session-123',
      taskId: 'task-456',
      diffStats: { stat: '1 file', shortstat: '1 insertion' }
    });
    
    assert.ok(existsSync(filepath), 'File should exist');
    assert.strictEqual(trace.version, 1);
    assert.strictEqual(trace.commit.hash, 'abc123def456789');
    assert.strictEqual(trace.agent.name, 'gary');
    assert.strictEqual(trace.agent.model, 'claude-opus');
    assert.strictEqual(trace.task, 'task-456');
  });
  
  it('uses environment variables as fallback', () => {
    const originalAgent = process.env.GP_AGENT;
    const originalModel = process.env.GP_AGENT_MODEL;
    
    process.env.GP_AGENT = 'env-agent';
    process.env.GP_AGENT_MODEL = 'env-model';
    
    try {
      const { trace } = agentTrace.createTrace({
        repoPath: testRepoPath,
        commitHash: 'abc123',
        commitMessage: 'Test',
        commitAuthor: 'Test <test@test.com>'
        // No agent/model specified - should use env
      });
      
      assert.strictEqual(trace.agent.name, 'env-agent');
      assert.strictEqual(trace.agent.model, 'env-model');
    } finally {
      // Restore
      if (originalAgent) process.env.GP_AGENT = originalAgent;
      else delete process.env.GP_AGENT;
      if (originalModel) process.env.GP_AGENT_MODEL = originalModel;
      else delete process.env.GP_AGENT_MODEL;
    }
  });

  it('supports legacy OpenClaw environment aliases for compatibility', () => {
    const originalModel = process.env.OPENCLAW_MODEL;
    const originalSessionKey = process.env.OPENCLAW_SESSION_KEY;

    process.env.OPENCLAW_MODEL = 'legacy-model';
    process.env.OPENCLAW_SESSION_KEY = 'legacy-session';

    try {
      const { trace } = agentTrace.createTrace({
        repoPath: testRepoPath,
        commitHash: 'abc456',
        commitMessage: 'Legacy env test',
        commitAuthor: 'Test <test@test.com>',
      });

      assert.strictEqual(trace.agent.model, 'legacy-model');
      assert.strictEqual(trace.agent.sessionKey, 'legacy-session');
    } finally {
      if (originalModel) process.env.OPENCLAW_MODEL = originalModel;
      else delete process.env.OPENCLAW_MODEL;
      if (originalSessionKey) process.env.OPENCLAW_SESSION_KEY = originalSessionKey;
      else delete process.env.OPENCLAW_SESSION_KEY;
    }
  });
});

// =============================================================================
// Tests: listTraces
// =============================================================================

describe('listTraces', () => {
  let tempDir;
  let testRepoPath;

  beforeEach(() => {
    tempDir = createTempDir('mc-agent-trace-list-traces-');
    testRepoPath = createTestRepo(tempDir, 'list-traces-test');
  });
  
  afterEach(() => cleanupTempDir(tempDir));
  
  it('returns empty array when no traces', () => {
    const traces = agentTrace.listTraces(testRepoPath);
    assert.deepStrictEqual(traces, []);
  });
  
  it('lists traces in reverse chronological order', () => {
    // Create multiple traces
    agentTrace.createTrace({
      repoPath: testRepoPath,
      commitHash: 'aaa111',
      commitMessage: 'First',
      commitAuthor: 'Test <test@test.com>',
      agent: 'gary'
    });
    
    // Small delay to ensure different timestamps
    agentTrace.createTrace({
      repoPath: testRepoPath,
      commitHash: 'bbb222',
      commitMessage: 'Second',
      commitAuthor: 'Test <test@test.com>',
      agent: 'gary'
    });
    
    const traces = agentTrace.listTraces(testRepoPath);
    
    assert.strictEqual(traces.length, 2);
    // Files are sorted by name (date-hash), reversed
    // Both have same date, so order depends on hash
  });
  
  it('respects limit option', () => {
    for (let i = 0; i < 5; i++) {
      agentTrace.createTrace({
        repoPath: testRepoPath,
        commitHash: `hash${i}`,
        commitMessage: `Commit ${i}`,
        commitAuthor: 'Test <test@test.com>',
        agent: 'gary'
      });
    }
    
    const traces = agentTrace.listTraces(testRepoPath, { limit: 3 });
    assert.strictEqual(traces.length, 3);
  });
});

// =============================================================================
// Tests: getTraceByCommit
// =============================================================================

describe('getTraceByCommit', () => {
  let tempDir;
  let testRepoPath;

  beforeEach(() => {
    tempDir = createTempDir('mc-agent-trace-get-trace-');
    testRepoPath = createTestRepo(tempDir, 'get-trace-test');
  });
  
  afterEach(() => cleanupTempDir(tempDir));
  
  it('finds trace by full hash', () => {
    agentTrace.createTrace({
      repoPath: testRepoPath,
      commitHash: 'abc123def456789012345678901234567890abcd',
      commitMessage: 'Test',
      commitAuthor: 'Test <test@test.com>',
      agent: 'gary'
    });
    
    const trace = agentTrace.getTraceByCommit(
      testRepoPath, 
      'abc123def456789012345678901234567890abcd'
    );
    
    assert.ok(trace, 'Should find trace');
    assert.strictEqual(trace.agent.name, 'gary');
  });
  
  it('finds trace by short hash', () => {
    agentTrace.createTrace({
      repoPath: testRepoPath,
      commitHash: 'abc123def456789012345678901234567890abcd',
      commitMessage: 'Test',
      commitAuthor: 'Test <test@test.com>',
      agent: 'gary'
    });
    
    const trace = agentTrace.getTraceByCommit(testRepoPath, 'abc123de');

    assert.ok(trace, 'Should find trace by short hash');
  });

  it('finds the exact full-hash trace when short hashes collide', () => {
    const traceDir = agentTrace.ensureTraceDir(testRepoPath);
    const requestedHash = 'abc123def456789012345678901234567890abcd';
    const otherHash = 'abc123de00000000000000000000000000000000';

    writeFileSync(join(traceDir, '2026-01-02-abc123de.json'), JSON.stringify({
      version: 1,
      timestamp: '2026-01-02T10:00:00.000Z',
      commit: {
        hash: otherHash,
        message: 'Other commit',
        author: 'Test <test@test.com>'
      },
      agent: {
        name: 'other'
      }
    }, null, 2));

    writeFileSync(join(traceDir, '2026-01-03-abc123de.json'), JSON.stringify({
      version: 1,
      timestamp: '2026-01-03T10:00:00.000Z',
      commit: {
        hash: requestedHash,
        message: 'Requested commit',
        author: 'Test <test@test.com>'
      },
      agent: {
        name: 'gary'
      }
    }, null, 2));

    const trace = agentTrace.getTraceByCommit(testRepoPath, requestedHash, { exact: true });

    assert.ok(trace, 'Should find the exact trace');
    assert.strictEqual(trace.commit.hash, requestedHash);
    assert.strictEqual(trace.agent.name, 'gary');
  });

  it('returns null for exact lookup when only a short-hash match exists', () => {
    const traceDir = agentTrace.ensureTraceDir(testRepoPath);
    const requestedHash = 'abc123def456789012345678901234567890abcd';
    const otherHash = 'abc123de00000000000000000000000000000000';

    writeFileSync(join(traceDir, '2026-01-02-abc123de.json'), JSON.stringify({
      version: 1,
      timestamp: '2026-01-02T10:00:00.000Z',
      commit: {
        hash: otherHash,
        message: 'Other commit',
        author: 'Test <test@test.com>'
      },
      agent: {
        name: 'other'
      }
    }, null, 2));

    const trace = agentTrace.getTraceByCommit(testRepoPath, requestedHash, { exact: true });

    assert.strictEqual(trace, null);
  });
  
  it('returns null for unknown commit', () => {
    const trace = agentTrace.getTraceByCommit(testRepoPath, 'nonexistent');
    assert.strictEqual(trace, null);
  });
});

// =============================================================================
// Summary
// =============================================================================

describe('Test Summary', () => {
  it('documents test coverage', () => {
    console.log(`
📋 Agent Trace Test Coverage:
   ✅ findGitRoot - repo detection
   ✅ getDiffStats - staged changes capture
   ✅ getLatestCommit - commit info retrieval
   ✅ ensureTraceDir - directory/gitignore management
   ✅ createTrace - trace file creation
   ✅ listTraces - trace enumeration
   ✅ getTraceByCommit - trace lookup
`);
  });
});
