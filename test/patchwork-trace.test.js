#!/usr/bin/env node
/**
 * Tests for Patchwork ↔ Agent Trace integration
 */

import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { AutomergeStore } from '../lib/automerge-store.js';
import { cleanupTempDir, createTempDir, noopLogger } from '../support/resources.js'

// =============================================================================
// Tests: recordCommit
// =============================================================================

describe('AutomergeStore.recordCommit', () => {
  let store;
  let storagePath;
  
  before(async () => {
    storagePath = createTempDir('mc-patchwork-test-')
    store = new AutomergeStore({ 
      storagePath,
      logger: noopLogger,
    });
    await store.init();
    
    // Create a test task
    await store.docHandle.change(doc => {
      if (!doc.tasks) doc.tasks = {};
      doc.tasks['test-task-1'] = {
        id: 'test-task-1',
        title: 'Test Task',
        status: 'in-progress',
        created: new Date().toISOString()
      };
    });
  });
  
  after(async () => {
    try {
      if (store) await store.close();
    } finally {
      cleanupTempDir(storagePath);
    }
  });
  
  it('records commit in task history', async () => {
    await store.recordCommit('test-task-1', {
      hash: 'abc123def456789012345678901234567890abcd',
      message: 'feat: test commit',
      diff: { stat: '1 file changed', shortstat: '1 insertion' }
    }, 'gary');
    
    const doc = store.getDoc();
    const history = doc.taskHistory['test-task-1'];
    
    assert.ok(history, 'Task history should exist');
    
    const commitEntry = history.find(h => h.type === 'commit');
    assert.ok(commitEntry, 'Should have a commit entry');
    assert.strictEqual(commitEntry.agent, 'gary');
    assert.strictEqual(commitEntry.commit.hash, 'abc123def456789012345678901234567890abcd');
    assert.strictEqual(commitEntry.commit.shortHash, 'abc123de');
    assert.strictEqual(commitEntry.commit.message, 'feat: test commit');
    assert.deepStrictEqual(commitEntry.commit.diff, { stat: '1 file changed', shortstat: '1 insertion' });
  });
  
  it('adds commit_linked event to activity feed', async () => {
    const doc = store.getDoc();
    const activity = doc.activity || [];
    
    const commitEvent = activity.find(a => 
      a.type === 'commit_linked' && a.taskId === 'test-task-1'
    );
    
    assert.ok(commitEvent, 'Should have activity entry');
    assert.strictEqual(commitEvent.agent, 'gary');
    assert.ok(commitEvent.details.includes('abc123de'), 'Should include short hash');
    assert.ok(commitEvent.details.includes('feat: test commit'), 'Should include message');
    assert.ok(commitEvent.commitHash, 'Should have full commit hash');
  });
  
  it('handles multiple commits for same task', async () => {
    await store.recordCommit('test-task-1', {
      hash: 'bbb222ccc333444555666777888999000aaabbbcc',
      message: 'fix: second commit',
      diff: { stat: '2 files changed', shortstat: '5 insertions, 3 deletions' }
    }, 'gary');
    
    const doc = store.getDoc();
    const commits = doc.taskHistory['test-task-1'].filter(h => h.type === 'commit');
    
    assert.strictEqual(commits.length, 2, 'Should have 2 commit entries');
    assert.strictEqual(commits[0].commit.shortHash, 'abc123de');
    assert.strictEqual(commits[1].commit.shortHash, 'bbb222cc');
  });
  
  it('handles commit without diff stats', async () => {
    await store.recordCommit('test-task-1', {
      hash: 'ccc333ddd444555666777888999000aaabbbccdd',
      message: 'chore: no diff'
    }, 'gary');
    
    const doc = store.getDoc();
    const commits = doc.taskHistory['test-task-1'].filter(h => h.type === 'commit');
    const last = commits[commits.length - 1];
    
    assert.strictEqual(last.commit.diff, null, 'Diff should be null when not provided');
  });
  
  it('coexists with regular task history', async () => {
    // Record a regular task change
    await store.recordTaskChange('test-task-1', [
      { field: 'status', old: 'in-progress', new: 'completed' }
    ], 'gary');
    
    const doc = store.getDoc();
    const history = doc.taskHistory['test-task-1'];
    
    const commits = history.filter(h => h.type === 'commit');
    const changes = history.filter(h => !h.type);
    
    assert.ok(commits.length >= 3, 'Should have commit entries');
    assert.ok(changes.length >= 1, 'Should have change entries');
  });
});

// =============================================================================
// Tests: Message truncation
// =============================================================================

describe('Activity feed message handling', () => {
  let store;
  let storagePath;
  
  before(async () => {
    storagePath = createTempDir('mc-patchwork-msg-test-')
    store = new AutomergeStore({ 
      storagePath,
      logger: noopLogger,
    });
    await store.init();
    
    await store.docHandle.change(doc => {
      if (!doc.tasks) doc.tasks = {};
      doc.tasks['test-msg-task'] = {
        id: 'test-msg-task',
        title: 'Message Test',
        status: 'todo',
        created: new Date().toISOString()
      };
    });
  });
  
  after(async () => {
    try {
      if (store) await store.close();
    } finally {
      cleanupTempDir(storagePath);
    }
  });
  
  it('truncates long commit messages in activity', async () => {
    const longMessage = 'feat: ' + 'a'.repeat(200) + '\n\nLong body here';
    
    await store.recordCommit('test-msg-task', {
      hash: 'ddd444eee555666777888999000aaabbbccddee',
      message: longMessage
    }, 'gary');
    
    const doc = store.getDoc();
    const event = doc.activity.find(a => 
      a.type === 'commit_linked' && a.taskId === 'test-msg-task'
    );
    
    // Details should only have first line, truncated to 60 chars
    assert.ok(event.details.length < longMessage.length, 'Should truncate');
    assert.ok(!event.details.includes('Long body'), 'Should not include body');
  });
});
