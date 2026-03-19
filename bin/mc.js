#!/usr/bin/env node

/**
 * Mission Control CLI (HTTP-first, Automerge backend)
 * 
 * Uses sync server HTTP API by default to prevent split-brain.
 * Falls back to direct store access only when sync server unavailable.
 * 
 * Usage:
 *   mc comment <task-id> "message"
 *   mc comments <task-id>
 *   mc mentions pending [--agent <name>]
 *   mc activity [--limit <n>]
 *   mc agents list
 *   mc show <task-id>
 *   mc tasks
 *   
 * Patchwork Features:
 *   mc timeline [--agent <name>] [--task <id>] [--limit <n>]
 *   mc diff <task-id>
 *   mc branch <task-id> <branch-name>
 *   mc branches <task-id>
 *   mc merge <branch-task-id>
 * 
 * Agent Trace:
 *   mc commit [git commit args]          Commit with agent attribution
 *   mc trace list [--limit <n>]          List recent traced commits
 *   mc trace show <commit-hash>          Show trace for a specific commit
 *   mc trace task <task-id>              Show commits linked to a task
 */

import { AutomergeStore } from '../lib/automerge-store.js';
import * as agentTrace from '../lib/agent-trace.js';
import { SyncRequestError, requestJson } from '../lib/sync-client.js';
import { activityTaskId } from '../lib/activity-task-id.js';

const API_BASE = process.env.MC_SYNC_SERVER || `http://localhost:${process.env.MC_HTTP_PORT || '8004'}`;
const API_TOKEN = process.env.MC_API_TOKEN || null;
const rawArgs = process.argv.slice(2);
const args = rawArgs;
const command = args[0];
const subcommand = args[1];

// Extract positional args (skip --flag value pairs)
function positionalArgs() {
  const result = [];
  for (let i = 0; i < rawArgs.length; i++) {
    if (rawArgs[i].startsWith('--')) {
      i++; // skip flag value
    } else {
      result.push(rawArgs[i]);
    }
  }
  return result;
}

// Lazy-loaded store (only init when HTTP unavailable)
let _store = null;
async function getStore() {
  if (!_store) {
    _store = new AutomergeStore();
    await _store.init();
  }
  return _store;
}

async function getLocalDoc() {
  const store = await getStore();
  return store.getDoc();
}

function isTransportFailure(error) {
  return error instanceof SyncRequestError && error.isTransport;
}

async function apiRequest(path, options = {}) {
  const { method = 'GET', headers = {}, body, parseJson = true } = options;
  return requestJson(API_BASE, path, {
    method,
    headers,
    body,
    parseJson,
    token: API_TOKEN,
    closeConnection: true
  });
}

async function apiGet(path) {
  return apiRequest(path);
}

async function apiPost(path, body) {
  return apiRequest(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function apiPatch(path, body) {
  return apiRequest(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function apiDelete(path) {
  return apiRequest(path, { method: 'DELETE' });
}

async function withStoreFallback(requestFn, fallbackFn) {
  try {
    return await requestFn();
  } catch (error) {
    if (!isTransportFailure(error)) throw error;
    return fallbackFn(error);
  }
}

// Get document via HTTP (preferred) or fallback to store only on transport errors.
async function getDoc() {
  const data = await withStoreFallback(
    () => apiGet('/automerge/doc'),
    async () => ({ success: true, doc: await getLocalDoc() })
  );

  if (data.success && data.doc) return data.doc;
  throw new Error('Invalid document response from sync server');
}

async function addCommentWithFallback(taskId, text, agent) {
  return withStoreFallback(
    async () => {
      const data = await apiPost('/automerge/comment', { taskId, text, agent });
      return { commentId: data.commentId, viaStore: false };
    },
    async () => {
      const store = await getStore();
      const commentId = await store.addComment(taskId, text, agent);
      return { commentId, viaStore: true };
    }
  );
}

async function getPendingMentionsWithFallback(agent) {
  const url = agent
    ? `/automerge/mentions/pending?agent=${encodeURIComponent(agent)}`
    : '/automerge/mentions/pending';

  return withStoreFallback(
    async () => {
      const data = await apiGet(url);
      return data.mentions || [];
    },
    async () => {
      const store = await getStore();
      return store.getPendingMentions(agent);
    }
  );
}

async function getTaskHistoryWithFallback(taskId) {
  return withStoreFallback(
    async () => {
      const data = await apiGet(`/automerge/task/${taskId}/history`);
      return data.history || [];
    },
    async () => {
      const store = await getStore();
      return store.getTaskHistory(taskId);
    }
  );
}

function usage() {
  console.log(`
Mission Control CLI

Usage:
  mc comment <task-id> "message"           Add a comment (use @name to mention)
  mc comments <task-id>                    List comments for a task (shows IDs)
  mc comment-delete <comment-id>           Delete a comment by ID
  mc mentions <agent>                      List pending @mentions for agent
  mc mentions pending [--agent <name>]     (legacy) List pending @mentions
  mc activity [--limit <n>]                Show activity feed
  mc agents list                           List registered agents
  mc show <task-id>                        Show task details
  mc tasks [--status <s>] [--assignee <a>] List tasks
  mc task create "title" [options]         Create a new task
     --priority <p0-p3>                    Set priority (default: p2)
     --assignee <name>                     Assign to agent
     --tag <tag>                           Add a tag

Patchwork Features:
  mc timeline [options]                    Rich timeline view with context
     --agent <name>                        Filter by agent
     --task <id>                           Filter by task
     --limit <n>                           Limit entries (default: 20)
  mc diff <task-id>                        Show task changes over time
  mc update <task-id> [options]            Update task with history tracking
     --status <s>                          Set status (todo/in-progress/completed)
     --assignee <name>                     Set assignee
     --title "text"                        Set title
     --description "text"                  Set description
     --priority <p0-p3>                    Set priority
  mc branch <task-id> <branch-name>        Create a task branch to experiment
  mc branches <task-id>                    List branches of a task
  mc merge <branch-task-id>                Merge branch back to parent

Agent Trace (commit attribution):
  mc commit [git args]                     Commit with agent attribution trace
     --task <id>                           Link commit to Mission Control task
     (all other args passed to git commit)
  mc trace list [--limit <n>]              List recent traced commits
  mc trace show <commit-hash>              Show trace details for a commit
  mc trace task <task-id>                   Show all commits linked to a task

Environment:
  MC_AGENT              Agent name (default: 'unknown')
  OPENCLAW_MODEL        Model name for traces
  OPENCLAW_SESSION_KEY  Session key for conversation context lookup

Examples:
  MC_AGENT=gary mc comment clawd-pxdf "Starting work on this"
  mc comment clawd-pxdf "@friday can you help with the API?"
  mc mentions gary
  mc tasks --status in-progress --assignee gary
  mc task create "Fix login bug" --priority p1 --assignee friday
  mc timeline --agent friday --limit 10
`);
}

function formatTime(ts) {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getArg(name, defaultValue = null) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return defaultValue;
  return args[idx + 1] || defaultValue;
}

async function main() {
  if (!command || command === 'help' || command === '--help') {
    usage();
    process.exit(0);
  }

  try {
    // ─────────────────────────────────────────
    // mc comment <task-id> "message"
    // ─────────────────────────────────────────
    if (command === 'comment') {
      const posArgs = positionalArgs();
      const taskId = posArgs[1];
      const message = posArgs[2];
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      
      if (!taskId || !message) {
        console.error('Usage: mc comment <task-id> "message" [--agent <name>]');
        process.exit(1);
      }
      
      const result = await addCommentWithFallback(taskId, message, agent);
      console.log(`✅ Comment added: ${result.commentId}${result.viaStore ? ' (via store)' : ''}`);
      
      const mentions = message.match(/@(\w+)/g) || [];
      if (mentions.length > 0) {
        console.log(`📬 Mentions created: ${mentions.join(', ')}`);
        console.log('   (Daemon will deliver them shortly)');
      }
    }

    // ─────────────────────────────────────────
    // mc comments <task-id>
    // ─────────────────────────────────────────
    else if (command === 'comments') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Usage: mc comments <task-id>');
        process.exit(1);
      }
      
      const doc = await getDoc();
      const comments = Object.values(doc.comments || {})
        .filter(c => c.task_id === taskId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      if (comments.length === 0) {
        console.log('No comments yet.');
      } else {
        console.log(`\nComments for ${taskId}:\n`);
        for (const c of comments) {
          console.log(`[@${c.agent}] ${formatTime(c.timestamp)} [${c.id}]`);
          console.log(`  ${c.content}`);
          console.log();
        }
      }
    }

    // ─────────────────────────────────────────
    // mc comment-delete <comment-id>
    // ─────────────────────────────────────────
    else if (command === 'comment-delete') {
      const commentId = args[1];
      if (!commentId) {
        console.error('Usage: mc comment-delete <comment-id>');
        process.exit(1);
      }
      
      const data = await apiDelete(`/automerge/comment/${commentId}`);
      if (data.success) {
        console.log(`Deleted comment ${commentId}`);
      } else {
        console.error('Error:', data.error);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // mc mentions <agent>
    // mc mentions pending [--agent <name>]
    // ─────────────────────────────────────────
    else if (command === 'mentions') {
      let agent;
      if (subcommand === 'pending') {
        agent = getArg('agent');
      } else if (subcommand && !subcommand.startsWith('--')) {
        // New syntax: mc mentions <agent>
        agent = subcommand;
      } else {
        agent = getArg('agent');
      }
      
      const mentions = await getPendingMentionsWithFallback(agent);
      
      if (mentions.length === 0) {
        console.log('No pending mentions.');
      } else {
        console.log(`${mentions.length} pending mention(s):\n`);
        for (const m of mentions) {
          console.log(`[${m.id}] @${m.to_agent} from @${m.from_agent}`);
          console.log(`   Task: ${m.task_id}`);
          console.log(`   "${m.content.substring(0, 80)}${m.content.length > 80 ? '...' : ''}"`);
          console.log(`   ${formatTime(m.timestamp)}\n`);
        }
      }
    }

    // ─────────────────────────────────────────
    // mc activity
    // ─────────────────────────────────────────
    else if (command === 'activity') {
      const limit = parseInt(getArg('limit', '20'));
      const doc = await getDoc();
      
      const activities = (doc.activity || [])
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
      
      if (activities.length === 0) {
        console.log('No activity.');
      } else {
        console.log('Recent activity:\n');
        for (const a of activities) {
          const agentStr = a.agent ? `@${a.agent}` : '';
          const tid = activityTaskId(a);
          const taskStr = tid ? `[${tid}]` : '';
          console.log(`  ${formatTime(a.timestamp)} ${a.type} ${agentStr} ${taskStr}`);
        }
      }
    }

    // ─────────────────────────────────────────
    // mc agents list
    // ─────────────────────────────────────────
    else if (command === 'agents') {
      if (subcommand === 'list' || !subcommand) {
        const doc = await getDoc();
        const agents = Object.values(doc.agents || {});
        
        if (agents.length === 0) {
          console.log('No agents registered.');
        } else {
          console.log('Registered agents:\n');
          for (const a of agents) {
            console.log(`  🤖 ${a.name} (${a.role || 'Agent'})`);
            console.log(`     Session: ${a.session_key}`);
            console.log(`     Status: ${a.status || 'idle'}`);
            console.log();
          }
        }
      }
      else {
        console.error('Usage: mc agents list');
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // mc show <task-id>
    // ─────────────────────────────────────────
    else if (command === 'show') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Usage: mc show <task-id>');
        process.exit(1);
      }
      
      const doc = await getDoc();
      const task = doc.tasks?.[taskId];
      
      if (!task) {
        console.log(`Task ${taskId} not found.`);
        process.exit(1);
      }
      
      console.log(`\n${task.title}`);
      console.log('─'.repeat(50));
      console.log(`ID: ${task.id}`);
      console.log(`Status: ${task.status}`);
      console.log(`Priority: ${task.priority || 'p2'}`);
      console.log(`Type: ${task.type || 'task'}`);
      console.log(`Assignee: ${task.assignee || 'unassigned'}`);
      if (task.description) {
        console.log(`\nDescription:\n${task.description.substring(0, 500)}${task.description.length > 500 ? '...' : ''}`);
      }
      
      const comments = Object.values(doc.comments || {})
        .filter(c => c.task_id === taskId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3);
      
      if (comments.length > 0) {
        console.log(`\nRecent comments (${comments.length}):`);
        for (const c of comments) {
          console.log(`  [@${c.agent}] ${c.content.substring(0, 60)}${c.content.length > 60 ? '...' : ''}`);
        }
      }
    }

    // ─────────────────────────────────────────
    // mc tasks [--status <s>] [--assignee <a>]
    // ─────────────────────────────────────────
    else if (command === 'tasks') {
      const status = getArg('status');
      const assignee = getArg('assignee');
      const doc = await getDoc();
      
      let tasks = Object.values(doc.tasks || {});
      
      // Filter by status (supports comma-separated)
      if (status) {
        const statuses = status.split(',').map(s => s.trim());
        tasks = tasks.filter(t => statuses.includes(t.status));
      }
      
      // Filter by assignee
      if (assignee) {
        tasks = tasks.filter(t => t.assignee === assignee);
      }
      
      // Sort by priority then created date
      const priorityOrder = { 'p0': 0, 'p1': 1, 'p2': 2, 'p3': 3 };
      tasks.sort((a, b) => {
        const pA = priorityOrder[a.priority] ?? 2;
        const pB = priorityOrder[b.priority] ?? 2;
        if (pA !== pB) return pA - pB;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
      
      if (tasks.length === 0) {
        console.log('No tasks found.');
      } else {
        const filters = [];
        if (status) filters.push(`status=${status}`);
        if (assignee) filters.push(`assignee=@${assignee}`);
        const filterStr = filters.length ? ` (${filters.join(', ')})` : '';
        
        console.log(`\nTasks${filterStr}: ${tasks.length}\n`);
        for (const t of tasks) {
          const statusIcon = {
            'todo': '⬜',
            'in-progress': '🔄',
            'completed': '✅',
            'blocked': '🚫'
          }[t.status] || '📋';
          
          const priorityBadge = t.priority && t.priority !== 'p2' ? ` [${t.priority.toUpperCase()}]` : '';
          
          console.log(`  ${statusIcon} ${t.id}: ${t.title}${priorityBadge}`);
          if (t.assignee) console.log(`     @${t.assignee}`);
        }
      }
    }

    // ─────────────────────────────────────────
    // mc timeline [--agent <name>] [--task <id>] [--limit <n>]
    // ─────────────────────────────────────────
    else if (command === 'timeline') {
      const agent = getArg('agent');
      const taskFilter = getArg('task');
      const limit = parseInt(getArg('limit', '20'));
      
      const doc = await getDoc();
      
      let timeline = (doc.activity || [])
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      if (agent) {
        timeline = timeline.filter(e => e.agent === agent);
      }
      if (taskFilter) {
        timeline = timeline.filter(e => activityTaskId(e) === taskFilter);
      }
      
      timeline = timeline.slice(0, limit);
      
      if (timeline.length === 0) {
        console.log('No activity found.');
      } else {
        console.log('\n┌─── Agent Timeline ─────────────────────────────────────┐');
        
        for (const entry of timeline) {
          const icon = {
            'comment_added': '💬',
            'task_created': '📋',
            'task_updated': '✏️',
            'task_branched': '🌿',
            'task_merged': '🔀',
            'agent_registered': '🤖',
            'status_changed': '🔄',
            'commit_linked': '🔗'
          }[entry.type] || '●';
          
          console.log(`│`);
          console.log(`│ ${icon} ${formatTime(entry.timestamp)} - ${entry.agent ? `@${entry.agent}` : 'System'}`);
          
          const taskId = activityTaskId(entry);
          if (taskId) {
            const task = doc.tasks?.[taskId];
            if (task) {
              console.log(`│   Task: ${task.title} [${taskId}]`);
            }
          }
          
          if (entry.comment_id) {
            const comment = doc.comments?.[entry.comment_id];
            if (comment) {
              const preview = comment.content.substring(0, 60);
              console.log(`│   "${preview}${comment.content.length > 60 ? '...' : ''}"`);
            }
          }
          
          if (entry.details) {
            console.log(`│   ${entry.details}`);
          }
        }
        
        console.log(`│`);
        console.log('└────────────────────────────────────────────────────────┘');
      }
    }

    // ─────────────────────────────────────────
    // mc diff <task-id>
    // ─────────────────────────────────────────
    else if (command === 'diff') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Usage: mc diff <task-id>');
        process.exit(1);
      }
      
      // Use HTTP API for history
      try {
        const history = await getTaskHistoryWithFallback(taskId);
        
        // Merge API history with commit history from Patchwork
        const doc = await getDoc();
        const commitHistory = ((doc.taskHistory || {})[taskId] || [])
          .filter(h => h.type === 'commit');
        
        // Combine and sort all history
        const allHistory = [
          ...history.map(h => ({ ...h, _kind: 'change' })),
          ...commitHistory.map(h => ({ ...h, _kind: 'commit' }))
        ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        if (allHistory.length === 0) {
          console.log(`No history found for task ${taskId}`);
        } else {
          console.log(`\n📜 History for ${taskId}`);
          console.log('─'.repeat(50));
          
          for (const entry of allHistory) {
            if (entry._kind === 'commit') {
              console.log(`\n🔗 ${formatTime(entry.timestamp)} ${entry.agent ? `@${entry.agent}` : ''}`);
              console.log(`  Commit: ${entry.commit.shortHash} "${entry.commit.message.split('\n')[0]}"`);
              if (entry.commit.diff?.shortstat) {
                console.log(`  ${entry.commit.diff.shortstat}`);
              }
            } else {
              console.log(`\n${formatTime(entry.timestamp)} ${entry.agent ? `@${entry.agent}` : ''}`);
              
              for (const diff of (entry.changes || [])) {
                if (diff.field === 'status') {
                  console.log(`  Status: ${diff.old || '(none)'} → ${diff.new}`);
                } else if (diff.field === 'assignee') {
                  console.log(`  Assignee: ${diff.old || 'unassigned'} → ${diff.new || 'unassigned'}`);
                } else if (diff.field === 'title') {
                  const oldTitle = diff.old ? `"${diff.old}"` : '(none)';
                  const newTitle = diff.new ? `"${diff.new}"` : '(none)';
                  console.log(`  Title: ${oldTitle} → ${newTitle}`);
                } else if (diff.field === 'description') {
                  const oldDesc = diff.old ? `"${diff.old.substring(0, 60)}${diff.old.length > 60 ? '…' : ''}"` : '(none)';
                  const newDesc = diff.new ? `"${diff.new.substring(0, 60)}${diff.new.length > 60 ? '…' : ''}"` : '(none)';
                  console.log(`  Description: ${oldDesc} → ${newDesc}`);
                } else {
                  console.log(`  ${diff.field}: ${diff.old || '(none)'} → ${diff.new}`);
                }
              }
            }
          }
          console.log();
        }
      } catch (e) {
        console.error(`❌ Failed to get history: ${e.message}`);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // mc update <task-id> [--status <s>] [--assignee <name>] [--title "text"] [--description "text"] [--priority <p>]
    // ─────────────────────────────────────────
    else if (command === 'update') {
      const taskId = args[1];
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      
      if (!taskId) {
        console.error('Usage: mc update <task-id> [--status <s>] [--assignee <name>] [--title "text"] [--description "text"] [--priority <p>]');
        process.exit(1);
      }
      
      const updates = { agent };
      const status = getArg('status');
      const assignee = getArg('assignee');
      const title = getArg('title');
      const description = getArg('description');
      const priority = getArg('priority');
      
      if (status) updates.status = status;
      if (assignee) updates.assignee = assignee;
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (priority) updates.priority = priority;
      
      if (Object.keys(updates).length <= 1) { // only agent
        console.error('No updates specified. Use --status, --assignee, --title, --description, or --priority');
        process.exit(1);
      }
      
      try {
        const result = await apiPatch(`/automerge/task/${taskId}`, updates);
        console.log(`✅ Task ${taskId} updated`);
        for (const c of result.changes || []) {
          console.log(`   ${c.field}: ${c.old || '(none)'} → ${c.new}`);
        }
      } catch (e) {
        console.error(`❌ Failed: ${e.message}`);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // mc branch <task-id> <branch-name>
    // ─────────────────────────────────────────
    else if (command === 'branch') {
      const taskId = args[1];
      const branchName = args[2];
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      
      if (!taskId || !branchName) {
        console.error('Usage: mc branch <task-id> <branch-name>');
        process.exit(1);
      }
      
      try {
        const result = await apiPost(`/automerge/task/${taskId}/branch`, { branchName, agent });
        
        if (result.branchId) {
          console.log(`🌿 Branch created: ${result.branchId}`);
          console.log(`   Parent: ${taskId}`);
          console.log(`   Name: ${branchName}`);
          console.log(`\n   Work on the branch, then merge with: mc merge ${result.branchId}`);
        }
      } catch (e) {
        console.error(`❌ Failed to create branch: ${e.message}`);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // mc branches <task-id>
    // ─────────────────────────────────────────
    else if (command === 'branches') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Usage: mc branches <task-id>');
        process.exit(1);
      }
      
      try {
        const data = await apiGet(`/automerge/task/${taskId}/branches`);
        const branches = data.branches || [];
        
        if (branches.length === 0) {
          console.log(`No branches for ${taskId}`);
        } else {
          console.log(`\n🌿 Branches of ${taskId}:\n`);
          for (const b of branches) {
            const statusIcon = b.merged ? '🔀' : '🌿';
            console.log(`  ${statusIcon} ${b.id}: ${b.branch_name}`);
            console.log(`     Created by @${b.created_by} ${formatTime(b.created_at)}`);
            if (b.merged) {
              console.log(`     Merged ${formatTime(b.merged_at)}`);
            }
            console.log();
          }
        }
      } catch (e) {
        console.error(`❌ Failed to list branches: ${e.message}`);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // mc merge <branch-task-id>
    // ─────────────────────────────────────────
    else if (command === 'merge') {
      const branchId = args[1];
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      
      if (!branchId) {
        console.error('Usage: mc merge <branch-task-id>');
        process.exit(1);
      }
      
      try {
        const result = await apiPost(`/automerge/branch/${branchId}/merge`, { agent });
        console.log(`🔀 Branch merged successfully!`);
        console.log(`   ${branchId} → ${result.parentId}`);
        console.log(`   Changes applied to parent task`);
      } catch (e) {
        console.error(`❌ Failed to merge: ${e.message}`);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // mc task create "title" [options]
    // ─────────────────────────────────────────
    else if (command === 'task' && subcommand === 'create') {
      const title = args[2];
      const priority = getArg('priority', 'p2');
      const assignee = getArg('assignee');
      const tagsArg = getArg('tag');
      const tags = tagsArg ? [tagsArg] : [];
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      
      if (!title) {
        console.error('Usage: mc task create "title" [--priority p0-p3] [--assignee name] [--tag tag]');
        process.exit(1);
      }
      
      try {
        const data = await apiPost('/automerge/task', { title, priority, assignee, tags, agent });
        console.log(`✅ Task created: ${data.taskId}`);
        console.log(`   Title: ${title}`);
        console.log(`   Priority: ${priority}`);
        if (assignee) console.log(`   Assignee: @${assignee}`);
        if (tags.length) console.log(`   Tags: ${tags.join(', ')}`);
      } catch (e) {
        console.error(`❌ Failed: ${e.message}`);
        console.error('   Is the sync server running? (pm2 start mc-sync)');
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // mc commit [git commit args]
    // Wrapper around git commit with agent attribution
    // ─────────────────────────────────────────
    else if (command === 'commit') {
      const repoPath = agentTrace.findGitRoot();
      
      if (!repoPath) {
        console.error('❌ Not in a git repository');
        process.exit(1);
      }
      
      // Extract our custom args, pass the rest to git
      const taskId = getArg('task');
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      const model = getArg('model', process.env.OPENCLAW_MODEL || null);
      const sessionKey = getArg('session', process.env.OPENCLAW_SESSION_KEY || null);
      
      // Build git args (remove our custom flags)
      const gitArgs = [];
      for (let i = 1; i < rawArgs.length; i++) {
        const arg = rawArgs[i];
        if (arg === '--task' || arg === '--agent' || arg === '--model' || arg === '--session') {
          i++; // skip the value too
        } else {
          gitArgs.push(arg);
        }
      }
      
      // Capture diff stats before commit
      const diffStats = agentTrace.getDiffStats(repoPath);
      
      // Execute git commit
      const exitCode = agentTrace.gitCommit(gitArgs, repoPath);
      
      if (exitCode !== 0) {
        process.exit(exitCode);
      }
      
      // Get commit info after successful commit
      const commitInfo = agentTrace.getLatestCommit(repoPath);
      
      if (!commitInfo) {
        console.error('⚠️  Commit succeeded but failed to get commit info');
        process.exit(0);
      }
      
      // Create trace record
      const { filepath, trace } = agentTrace.createTrace({
        repoPath,
        commitHash: commitInfo.hash,
        commitMessage: commitInfo.message,
        commitAuthor: commitInfo.author,
        agent,
        model,
        sessionKey,
        taskId,
        diffStats
      });
      
      console.log(`\n📋 Trace recorded: ${trace.commit.hash.substring(0, 8)}`);
      console.log(`   Agent: @${trace.agent.name}`);
      if (trace.agent.model) console.log(`   Model: ${trace.agent.model}`);
      if (trace.task) console.log(`   Task: ${trace.task}`);
      
      // Link commit to Patchwork timeline if task specified
      if (taskId) {
        try {
          const store = new AutomergeStore();
          await store.init();
          await store.recordCommit(taskId, {
            hash: commitInfo.hash,
            message: commitInfo.message,
            diff: diffStats
          }, agent);
          await store.close();
          console.log(`   📎 Linked to Patchwork timeline`);
        } catch (err) {
          // Non-fatal — trace is already saved
          console.error(`   ⚠️  Could not link to Patchwork: ${err.message}`);
        }
      }
    }

    // ─────────────────────────────────────────
    // mc trace list [--limit <n>]
    // ─────────────────────────────────────────
    else if (command === 'trace' && subcommand === 'list') {
      const repoPath = agentTrace.findGitRoot();
      
      if (!repoPath) {
        console.error('❌ Not in a git repository');
        process.exit(1);
      }
      
      const limit = parseInt(getArg('limit', '20'));
      const traces = agentTrace.listTraces(repoPath, { limit });
      
      if (traces.length === 0) {
        console.log('No traces found. Use `mc commit` to create attributed commits.');
      } else {
        console.log(`\n📋 Recent traced commits (${traces.length}):\n`);
        
        for (const t of traces) {
          const shortHash = t.commit.hash.substring(0, 8);
          const msgPreview = t.commit.message.split('\n')[0].substring(0, 50);
          const msgSuffix = t.commit.message.split('\n')[0].length > 50 ? '...' : '';
          
          console.log(`  ${shortHash} @${t.agent.name} ${formatTime(t.timestamp)}`);
          console.log(`    "${msgPreview}${msgSuffix}"`);
          if (t.agent.model) console.log(`    Model: ${t.agent.model}`);
          if (t.task) console.log(`    Task: ${t.task}`);
          if (t.diff?.shortstat) console.log(`    ${t.diff.shortstat}`);
          console.log();
        }
      }
    }

    // ─────────────────────────────────────────
    // mc trace show <commit-hash>
    // ─────────────────────────────────────────
    else if (command === 'trace' && subcommand === 'show') {
      const commitHash = args[2];
      
      if (!commitHash) {
        console.error('Usage: mc trace show <commit-hash>');
        process.exit(1);
      }
      
      const repoPath = agentTrace.findGitRoot();
      
      if (!repoPath) {
        console.error('❌ Not in a git repository');
        process.exit(1);
      }
      
      const trace = agentTrace.getTraceByCommit(repoPath, commitHash);
      
      if (!trace) {
        console.log(`No trace found for commit ${commitHash}`);
        console.log('(Only commits made with `mc commit` have traces)');
        process.exit(1);
      }
      
      console.log(`\n📋 Trace: ${trace.commit.hash}`);
      console.log('─'.repeat(50));
      console.log(`Timestamp:   ${trace.timestamp}`);
      console.log(`Message:     ${trace.commit.message.split('\n')[0]}`);
      console.log(`Author:      ${trace.commit.author}`);
      console.log();
      console.log(`Agent:       @${trace.agent.name}`);
      if (trace.agent.model) console.log(`Model:       ${trace.agent.model}`);
      if (trace.agent.sessionKey) console.log(`Session:     ${trace.agent.sessionKey}`);
      if (trace.task) console.log(`Task:        ${trace.task}`);
      
      if (trace.diff?.stat) {
        console.log('\nDiff stats:');
        console.log(trace.diff.stat);
      }
    }

    // ─────────────────────────────────────────
    // mc trace task <task-id>
    // Show all commits linked to a task
    // ─────────────────────────────────────────
    else if (command === 'trace' && subcommand === 'task') {
      const taskId = args[2];
      
      if (!taskId) {
        console.error('Usage: mc trace task <task-id>');
        process.exit(1);
      }
      
      // Use direct store to ensure we see latest commits
      const store = await getStore();
      const doc = store.getDoc();
      const history = ((doc.taskHistory || {})[taskId] || [])
        .filter(h => h.type === 'commit');
      
      if (history.length === 0) {
        console.log(`No commits linked to task ${taskId}`);
        console.log('Use `mc commit --task <id>` to link commits.');
      } else {
        const task = doc.tasks?.[taskId];
        const title = task ? task.title : taskId;
        
        console.log(`\n🔗 Commits for: ${title}`);
        console.log('─'.repeat(50));
        
        for (const entry of history) {
          console.log(`\n  ${entry.commit.shortHash} @${entry.agent} ${formatTime(entry.timestamp)}`);
          console.log(`    "${entry.commit.message.split('\n')[0]}"`);
          if (entry.commit.diff?.shortstat) {
            console.log(`    ${entry.commit.diff.shortstat}`);
          }
        }
        console.log();
      }
    }

    else {
      console.error(`Unknown command: ${command}`);
      usage();
      process.exit(1);
    }
  } finally {
    if (_store) {
      await _store.close();
    }
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
