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
 */

import { AutomergeStore } from '../lib/automerge-store.js';

const API_BASE = 'http://localhost:8004';
const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

// Lazy-loaded store (only init when HTTP unavailable)
let _store = null;
async function getStore() {
  if (!_store) {
    _store = new AutomergeStore();
    await _store.init();
  }
  return _store;
}

// HTTP client for sync server
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

// Get document via HTTP (preferred) or fallback to store
async function getDoc() {
  try {
    const data = await apiGet('/automerge/doc');
    if (data.success && data.doc) return data.doc;
  } catch (e) {
    // HTTP failed, try direct store
  }
  const store = await getStore();
  return store.getDoc();
}

function usage() {
  console.log(`
Mission Control CLI

Usage:
  mc comment <task-id> "message"           Add a comment (use @name to mention)
  mc comments <task-id>                    List comments for a task
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
  mc branch <task-id> <branch-name>        Create a task branch to experiment
  mc branches <task-id>                    List branches of a task
  mc merge <branch-task-id>                Merge branch back to parent

Environment:
  MC_AGENT    Your agent name (default: from --agent or 'unknown')

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
      const taskId = args[1];
      const message = args[2];
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      
      if (!taskId || !message) {
        console.error('Usage: mc comment <task-id> "message" [--agent <name>]');
        process.exit(1);
      }
      
      try {
        const data = await apiPost('/automerge/comment', { taskId, text: message, agent });
        console.log(`✅ Comment added: ${data.commentId}`);
      } catch (e) {
        // Fallback to direct store
        const store = await getStore();
        const commentId = await store.addComment(taskId, message, agent);
        console.log(`✅ Comment added: ${commentId} (via store)`);
      }
      
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
          console.log(`[@${c.agent}] ${formatTime(c.timestamp)}`);
          console.log(`  ${c.content}`);
          console.log();
        }
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
      
      // Try HTTP API first
      try {
        const url = agent 
          ? `/automerge/mentions/pending?agent=${encodeURIComponent(agent)}`
          : '/automerge/mentions/pending';
        const data = await apiGet(url);
        const mentions = data.mentions || [];
        
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
      } catch (e) {
        // Fallback to store
        const store = await getStore();
        const mentions = await store.getPendingMentions(agent);
        
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
          const taskStr = a.task_id || a.taskId ? `[${a.task_id || a.taskId}]` : '';
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
        timeline = timeline.filter(e => (e.task_id || e.taskId) === taskFilter);
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
            'status_changed': '🔄'
          }[entry.type] || '●';
          
          console.log(`│`);
          console.log(`│ ${icon} ${formatTime(entry.timestamp)} - ${entry.agent ? `@${entry.agent}` : 'System'}`);
          
          const taskId = entry.task_id || entry.taskId;
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
      
      // Need store for history tracking
      const store = await getStore();
      const history = await store.getTaskHistory(taskId);
      
      if (!history || history.length === 0) {
        console.log(`No history found for task ${taskId}`);
      } else {
        console.log(`\n📜 History for ${taskId}`);
        console.log('─'.repeat(50));
        
        for (const change of history) {
          console.log(`\n${formatTime(change.timestamp)} ${change.agent ? `@${change.agent}` : ''}`);
          
          for (const diff of change.changes) {
            if (diff.field === 'status') {
              console.log(`  Status: ${diff.old || '(none)'} → ${diff.new}`);
            } else if (diff.field === 'assignee') {
              console.log(`  Assignee: ${diff.old || 'unassigned'} → ${diff.new || 'unassigned'}`);
            } else if (diff.field === 'title') {
              console.log(`  Title changed`);
            } else if (diff.field === 'description') {
              console.log(`  Description updated`);
            } else {
              console.log(`  ${diff.field}: ${diff.old || '(none)'} → ${diff.new}`);
            }
          }
        }
        console.log();
      }
    }

    // ─────────────────────────────────────────
    // mc update <task-id> [--status <s>] [--assignee <name>] [--title "text"]
    // ─────────────────────────────────────────
    else if (command === 'update') {
      const taskId = args[1];
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      
      if (!taskId) {
        console.error('Usage: mc update <task-id> [--status <s>] [--assignee <name>] [--title "text"]');
        process.exit(1);
      }
      
      const updates = { agent };
      const status = getArg('status');
      const assignee = getArg('assignee');
      const title = getArg('title');
      
      if (status) updates.status = status;
      if (assignee) updates.assignee = assignee;
      if (title) updates.title = title;
      
      if (Object.keys(updates).length <= 1) { // only agent
        console.error('No updates specified. Use --status, --assignee, or --title');
        process.exit(1);
      }
      
      try {
        const res = await fetch(`${API_BASE}/automerge/task/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(err.error);
        }
        
        const result = await res.json();
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
      
      const store = await getStore();
      const branchId = await store.createBranch(taskId, branchName, agent);
      
      if (branchId) {
        console.log(`🌿 Branch created: ${branchId}`);
        console.log(`   Parent: ${taskId}`);
        console.log(`   Name: ${branchName}`);
        console.log(`\n   Work on the branch, then merge with: mc merge ${branchId}`);
      } else {
        console.error('Failed to create branch. Task not found?');
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
      
      const store = await getStore();
      const branches = await store.getBranches(taskId);
      
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
      
      const store = await getStore();
      const result = await store.mergeBranch(branchId, agent);
      
      if (result.success) {
        console.log(`🔀 Branch merged successfully!`);
        console.log(`   ${branchId} → ${result.parentId}`);
        console.log(`   Changes applied to parent task`);
      } else {
        console.error(`Failed to merge: ${result.error}`);
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
