#!/usr/bin/env node

/**
 * Gameplan CLI
 *
 * Current implementation (hub-and-spoke):
 * - automerge-sync-server.js is the HTTP/WebSocket hub
 * - CLI commands talk to the sync server over HTTP
 * - UI connects through the sync server's HTTP/WebSocket APIs
 * - External agent harnesses are expected to orchestrate mentions via this CLI
 *
 * Usage:
 *   gp comment <task-id> "message"
 *   gp comments <task-id>
 *   gp mentions pending [--agent <name>]
 *   gp activity [--limit <n>]
 *   gp agents list
 *   gp show <task-id>
 *   gp tasks
 *   
 * Patchwork Features:
 *   gp timeline [--agent <name>] [--task <id>] [--limit <n>]
 *   gp diff <task-id>
 *   gp branch <task-id> <branch-name>
 *   gp branches <task-id>
 *   gp merge <branch-task-id>
 * 
 * Agent Trace:
 *   gp commit [git commit args]          Commit with agent attribution
 *   gp trace list [--limit <n>]          List recent traced commits
 *   gp trace show <commit-hash>          Show trace for a specific commit
 *   gp trace task <task-id>              Show commits linked to a task
 */

import * as agentTrace from '../lib/agent-trace.js';
import { SyncRequestError, requestJson } from '../lib/sync-client.js';
import { activityTaskId } from '../lib/activity-task-id.js';

const API_BASE = process.env.GP_SYNC_SERVER || `http://localhost:${process.env.GP_HTTP_PORT || '8004'}`;
const API_TOKEN = process.env.GP_API_TOKEN || null;
const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];
const BOOLEAN_FLAGS = new Set(['--json']);

// Extract positional args (skip --flag value pairs)
function positionalArgs() {
  const result = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      if (!BOOLEAN_FLAGS.has(args[i])) {
        i++; // skip flag value
      }
    } else {
      result.push(args[i]);
    }
  }
  return result;
}

function isTransportFailure(error) {
  return error instanceof SyncRequestError && error.isTransport;
}

function printSyncRuntimeHint() {
  console.error(`   Sync server: ${API_BASE}`);
  console.error('   Start the supported runtime with `npm run sync`, or make sure GP_SYNC_SERVER points to a reachable server.');
  console.error('   If auth is enabled, use the same GP_API_TOKEN for the server and this command.');
}

function printCommandError(prefix, error) {
  console.error(`${prefix}: ${error.message}`);
  if (isTransportFailure(error)) {
    printSyncRuntimeHint();
  }
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

async function getDoc() {
  const data = await apiGet('/automerge/doc');
  if (data.success && data.doc) return data.doc;
  throw new Error('Invalid document response from sync server');
}

async function addComment(taskId, text, agent) {
  const data = await apiPost('/automerge/comment', { taskId, text, agent });
  return { commentId: data.commentId };
}

async function getPendingMentions(agent) {
  const url = agent
    ? `/automerge/mentions/pending?agent=${encodeURIComponent(agent)}`
    : '/automerge/mentions/pending';

  const data = await apiGet(url);
  return data.mentions || [];
}

async function claimMention(mentionId) {
  return apiPost(`/automerge/mentions/${encodeURIComponent(mentionId)}/claim`, {});
}

async function releaseMention(mentionId, claimToken, error = null) {
  return apiPost(`/automerge/mentions/${encodeURIComponent(mentionId)}/release`, {
    claimToken,
    ...(error ? { error } : {}),
  });
}

async function acknowledgeMention(mentionId, claimToken) {
  return apiPost(`/automerge/mentions/${encodeURIComponent(mentionId)}/deliver`, {
    claimToken,
  });
}

async function claimNextMention(agent) {
  const data = await apiPost('/automerge/mentions/claim-next', { agent });
  return {
    mention: data.mention || null,
    claimed: Boolean(data.claimed),
    claimToken: data.claimToken || null,
    claimExpiresAt: data.claimExpiresAt || null,
  };
}

async function getTaskHistory(taskId) {
  const data = await apiGet(`/automerge/task/${taskId}/history`);
  return data.history || [];
}

async function ensureTaskLinkReady(taskId) {
  const doc = await getDoc();
  if (!doc.tasks?.[taskId]) {
    throw new Error(`Task ${taskId} not found on sync server`);
  }
}

function usage() {
  console.log(`
Gameplan CLI

Usage:
  gp comment <task-id> "message"           Add a comment (use @name to mention)
  gp comments <task-id>                    List comments for a task (shows IDs)
  gp comment-delete <comment-id>           Delete a comment by ID
  gp mentions <agent>                      List pending @mentions for agent
  gp mentions pending [--agent <name>] [--json]
                                           List pending @mentions
  gp mentions claim <mention-id> [--json]
                                           Claim one pending mention lease
  gp mentions claim-next --agent <name> [--json]
                                           Claim the next available mention
  gp mentions ack <mention-id> --claim-token <token> [--json]
                                           Mark a claimed mention delivered
  gp mentions release <mention-id> --claim-token <token> [--error <msg>] [--json]
                                           Release a claim back to the pool
  gp activity [--limit <n>]                Show activity feed
  gp agents list                           List registered agents
  gp show <task-id>                        Show task details
  gp tasks [--status <s>] [--assignee <a>] List tasks
  gp task create "title" [options]         Create a new task
     --priority <p0-p3>                    Set priority (default: p2)
     --assignee <name>                     Assign to agent
     --tag <tag>                           Add a tag

Patchwork Features:
  gp timeline [options]                    Rich timeline view with context
     --agent <name>                        Filter by agent
     --task <id>                           Filter by task
     --limit <n>                           Limit entries (default: 20)
  gp diff <task-id>                        Show task changes over time
  gp update <task-id> [options]            Update task with history tracking
     --status <s>                          Set status (todo/in-progress/completed)
     --assignee <name>                     Set assignee
     --title "text"                        Set title
     --description "text"                  Set description
     --priority <p0-p3>                    Set priority
  gp branch <task-id> <branch-name>        Create a task branch to experiment
  gp branches <task-id>                    List branches of a task
  gp merge <branch-task-id>                Merge branch back to parent

Moves & Games:
  gp move create "title" [options]         Create a move
     --branch <name>                       Git branch for this move
     --game <game-id>                      Link to a game
     --description "text"                  Description
  gp moves [--status <s>] [--game <id>]    List moves
  gp move show <move-id>                   Show move details
  gp move update <move-id> [options]       Update a move
     --status <s>                          proposed/active/completed/failed/abandoned
     --game <game-id>                      Link to a game (retroactive OK)
     --branch <name>                       Set git branch
     --title "text"                        Set title
     --description "text"                  Set description
  gp game create "title" [options]         Create a game
     --endgame "goal description"          The goal state (required)
     --description "text"                  Description
  gp games [--status <s>]                  List games
  gp game show <game-id>                   Show game details with its moves
  gp game update <game-id> [options]       Update a game
     --status <s>                          active/won/abandoned/paused
     --endgame "text"                      Update endgame
     --title "text"                        Set title
     --description "text"                  Set description

Agent Trace (commit attribution):
  gp commit [git args]                     Commit with agent attribution trace
     --task <id>                           Link commit to Gameplan task
     --move <id>                           Link commit to a move
     (all other args passed to git commit)
  gp trace list [--limit <n>]              List recent traced commits
  gp trace show <commit-hash>              Show trace details for a commit
  gp trace task <task-id>                   Show all commits linked to a task

Environment:
  GP_AGENT              Agent name (default: 'unknown')
  GP_AGENT_MODEL        Model name for traces
  GP_AGENT_SESSION_KEY  Session key for external harness context lookup
  OPENCLAW_MODEL        Legacy alias for GP_AGENT_MODEL
  OPENCLAW_SESSION_KEY  Legacy alias for GP_AGENT_SESSION_KEY

Examples:
  GP_AGENT=gary mc comment clawd-pxdf "Starting work on this"
  gp comment clawd-pxdf "@friday can you help with the API?"
  gp mentions gary
  gp mentions claim-next --agent friday --json
  gp mentions ack mention-123 --claim-token token-abc --json
  gp tasks --status in-progress --assignee gary
  gp task create "Fix login bug" --priority p1 --assignee friday
  gp timeline --agent friday --limit 10
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

function hasFlag(name) {
  return args.includes(`--${name}`);
}

function getDefaultAgent() {
  return getArg('agent', process.env.GP_AGENT || 'unknown');
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

async function main() {
  if (!command || command === 'help' || command === '--help') {
    usage();
    process.exit(0);
  }

  // ─────────────────────────────────────────
  // gp comment <task-id> "message"
  // ─────────────────────────────────────────
  if (command === 'comment') {
      const posArgs = positionalArgs();
      const taskId = posArgs[1];
      const message = posArgs[2];
      const agent = getDefaultAgent();
      
      if (!taskId || !message) {
        console.error('Usage: gp comment <task-id> "message" [--agent <name>]');
        process.exit(1);
      }
      
      const result = await addComment(taskId, message, agent);
      console.log(`✅ Comment added: ${result.commentId}`);
      
      const mentions = message.match(/@(\w+)/g) || [];
      if (mentions.length > 0) {
        console.log(`📬 Mentions created: ${mentions.join(', ')}`);
        console.log('   (External agent harnesses should claim them via `gp mentions ...`)');
      }
    }

    // ─────────────────────────────────────────
    // gp comments <task-id>
    // ─────────────────────────────────────────
    else if (command === 'comments') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Usage: gp comments <task-id>');
        process.exit(1);
      }
      
      const doc = await getDoc();
      const comments = Object.values(doc.comments || {})
        .filter(c => c.taskId === taskId)
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
    // gp comment-delete <comment-id>
    // ─────────────────────────────────────────
    else if (command === 'comment-delete') {
      const commentId = args[1];
      if (!commentId) {
        console.error('Usage: gp comment-delete <comment-id>');
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
    // gp mentions <agent>
    // gp mentions pending [--agent <name>]
    // ─────────────────────────────────────────
    else if (command === 'mentions') {
      const jsonOutput = hasFlag('json');

      if (subcommand === 'claim') {
        const mentionId = args[2];
        if (!mentionId) {
          console.error('Usage: gp mentions claim <mention-id> [--json]');
          process.exit(1);
        }

        const claim = await claimMention(mentionId);
        if (jsonOutput) {
          printJson({ mentionId, ...claim });
          return;
        }

        if (claim.claimed) {
          console.log(`✅ Claimed mention ${mentionId}`);
          console.log(`   Claim token: ${claim.claimToken}`);
          console.log(`   Lease expires: ${claim.claimExpiresAt}`);
        } else {
          console.log(`Mention ${mentionId} is not claimable.`);
        }
      }

      else if (subcommand === 'claim-next') {
        const agent = getArg('agent') || (args[2] && !args[2].startsWith('--') ? args[2] : null);
        if (!agent) {
          console.error('Usage: gp mentions claim-next --agent <name> [--json]');
          process.exit(1);
        }

        const claim = await claimNextMention(agent);
        if (jsonOutput) {
          printJson(claim);
          return;
        }

        if (!claim.claimed) {
          console.log(`No claimable mentions for @${agent}.`);
          return;
        }

        console.log(`✅ Claimed mention ${claim.mention.id} for @${agent}`);
        console.log(`   From: @${claim.mention.from_agent}`);
        console.log(`   Task: ${claim.mention.taskId}`);
        console.log(`   Claim token: ${claim.claimToken}`);
        console.log(`   Lease expires: ${claim.claimExpiresAt}`);
      }

      else if (subcommand === 'ack' || subcommand === 'deliver') {
        const mentionId = args[2];
        const claimToken = getArg('claim-token');
        if (!mentionId || !claimToken) {
          console.error('Usage: gp mentions ack <mention-id> --claim-token <token> [--json]');
          process.exit(1);
        }

        const result = await acknowledgeMention(mentionId, claimToken);
        if (jsonOutput) {
          printJson({ mentionId, ...result });
          return;
        }

        if (result.delivered) {
          console.log(`✅ Marked mention ${mentionId} delivered`);
        } else {
          console.log(`Mention ${mentionId} was not marked delivered.`);
        }
      }

      else if (subcommand === 'release') {
        const mentionId = args[2];
        const claimToken = getArg('claim-token');
        const releaseError = getArg('error');
        if (!mentionId || !claimToken) {
          console.error(
            'Usage: gp mentions release <mention-id> --claim-token <token> [--error <msg>] [--json]'
          );
          process.exit(1);
        }

        const result = await releaseMention(mentionId, claimToken, releaseError);
        if (jsonOutput) {
          printJson({ mentionId, ...result });
          return;
        }

        if (result.released) {
          console.log(`✅ Released claim for mention ${mentionId}`);
        } else {
          console.log(`Mention ${mentionId} was not released.`);
        }
      }

      else {
        let agent;
        if (subcommand === 'pending') {
          agent = getArg('agent');
        } else if (subcommand && !subcommand.startsWith('--')) {
          // New syntax: gp mentions <agent>
          agent = subcommand;
        } else {
          agent = getArg('agent');
        }

        const mentions = await getPendingMentions(agent);
        if (jsonOutput) {
          printJson(mentions);
          return;
        }

        if (mentions.length === 0) {
          console.log('No pending mentions.');
        } else {
          console.log(`${mentions.length} pending mention(s):\n`);
          for (const m of mentions) {
            console.log(`[${m.id}] @${m.to_agent} from @${m.from_agent}`);
            console.log(`   Task: ${m.taskId}`);
            if (m.idempotency_key) {
              console.log(`   Dedupe: ${m.idempotency_key}`);
            }
            console.log(`   "${m.content.substring(0, 80)}${m.content.length > 80 ? '...' : ''}"`);
            console.log(`   ${formatTime(m.timestamp)}\n`);
          }
        }
      }
    }

    // ─────────────────────────────────────────
    // gp activity
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
    // gp agents list
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
            console.log(`     Status: ${a.status || 'idle'}`);
            console.log();
          }
        }
      }
      else {
        console.error('Usage: gp agents list');
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp show <task-id>
    // ─────────────────────────────────────────
    else if (command === 'show') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Usage: gp show <task-id>');
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
        .filter(c => c.taskId === taskId)
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
    // gp tasks [--status <s>] [--assignee <a>]
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
    // gp timeline [--agent <name>] [--task <id>] [--limit <n>]
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
    // gp diff <task-id>
    // ─────────────────────────────────────────
    else if (command === 'diff') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Usage: gp diff <task-id>');
        process.exit(1);
      }
      
      // Use HTTP API for history
      try {
        const history = await getTaskHistory(taskId);
        
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
        printCommandError('❌ Failed to get history', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp update <task-id> [--status <s>] [--assignee <name>] [--title "text"] [--description "text"] [--priority <p>]
    // ─────────────────────────────────────────
    else if (command === 'update') {
      const taskId = args[1];
      const agent = getDefaultAgent();
      
      if (!taskId) {
        console.error('Usage: gp update <task-id> [--status <s>] [--assignee <name>] [--title "text"] [--description "text"] [--priority <p>]');
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
        printCommandError('❌ Failed', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp branch <task-id> <branch-name>
    // ─────────────────────────────────────────
    else if (command === 'branch') {
      const taskId = args[1];
      const branchName = args[2];
      const agent = getDefaultAgent();
      
      if (!taskId || !branchName) {
        console.error('Usage: gp branch <task-id> <branch-name>');
        process.exit(1);
      }
      
      try {
        const result = await apiPost(`/automerge/task/${taskId}/branch`, { branchName, agent });
        
        if (result.branchId) {
          console.log(`🌿 Branch created: ${result.branchId}`);
          console.log(`   Parent: ${taskId}`);
          console.log(`   Name: ${branchName}`);
          console.log(`\n   Work on the branch, then merge with: gp merge ${result.branchId}`);
        }
      } catch (e) {
        printCommandError('❌ Failed to create branch', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp branches <task-id>
    // ─────────────────────────────────────────
    else if (command === 'branches') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Usage: gp branches <task-id>');
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
        printCommandError('❌ Failed to list branches', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp merge <branch-task-id>
    // ─────────────────────────────────────────
    else if (command === 'merge') {
      const branchId = args[1];
      const agent = getDefaultAgent();
      
      if (!branchId) {
        console.error('Usage: gp merge <branch-task-id>');
        process.exit(1);
      }
      
      try {
        const result = await apiPost(`/automerge/branch/${branchId}/merge`, { agent });
        console.log(`🔀 Branch merged successfully!`);
        console.log(`   ${branchId} → ${result.parentId}`);
        console.log(`   Changes applied to parent task`);
      } catch (e) {
        printCommandError('❌ Failed to merge', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp task create "title" [options]
    // ─────────────────────────────────────────
    else if (command === 'task' && subcommand === 'create') {
      const title = args[2];
      const priority = getArg('priority', 'p2');
      const assignee = getArg('assignee');
      const tagsArg = getArg('tag');
      const tags = tagsArg ? [tagsArg] : [];
      const agent = getDefaultAgent();
      
      if (!title) {
        console.error('Usage: gp task create "title" [--priority p0-p3] [--assignee name] [--tag tag]');
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
        printCommandError('❌ Failed', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp move create "title" [options]
    // ─────────────────────────────────────────
    else if (command === 'move' && subcommand === 'create') {
      const title = args[2];
      const description = getArg('description', '');
      const branch = getArg('branch');
      const gameId = getArg('game');
      const agent = getArg('agent', process.env.GP_AGENT || 'unknown');

      if (!title) {
        console.error('Usage: gp move create "title" [--branch <name>] [--game <game-id>] [--description "text"]');
        process.exit(1);
      }

      try {
        const data = await apiPost('/automerge/move', { title, description, branch, gameId, agent });
        console.log(`✅ Move created: ${data.moveId}`);
        console.log(`   Title: ${title}`);
        if (branch) console.log(`   Branch: ${branch}`);
        if (gameId) console.log(`   Game: ${gameId}`);
      } catch (e) {
        printCommandError('❌ Failed', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp move show <move-id>
    // ─────────────────────────────────────────
    else if (command === 'move' && subcommand === 'show') {
      const moveId = args[2];
      if (!moveId) {
        console.error('Usage: gp move show <move-id>');
        process.exit(1);
      }

      try {
        const data = await apiGet(`/automerge/move/${moveId}`);
        const m = data.move;
        console.log(`\n${m.title}`);
        console.log('─'.repeat(50));
        console.log(`ID: ${m.id}`);
        console.log(`Status: ${m.status}`);
        console.log(`Branch: ${m.branch || '(none)'}`);
        console.log(`Game: ${m.gameId || '(none)'}`);
        console.log(`Agent: ${m.agent || '(none)'}`);
        if (m.description) {
          console.log(`\nDescription:\n${m.description.substring(0, 500)}${m.description.length > 500 ? '...' : ''}`);
        }
        console.log(`\nCreated: ${formatTime(m.created_at)}`);
        console.log(`Updated: ${formatTime(m.updated_at)}`);
      } catch (e) {
        printCommandError('❌ Failed', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp move update <move-id> [options]
    // ─────────────────────────────────────────
    else if (command === 'move' && subcommand === 'update') {
      const moveId = args[2];
      const agent = getArg('agent', process.env.GP_AGENT || 'unknown');

      if (!moveId) {
        console.error('Usage: gp move update <move-id> [--status <s>] [--game <id>] [--branch <name>] [--title "text"] [--description "text"]');
        process.exit(1);
      }

      const updates = { agent };
      const status = getArg('status');
      const title = getArg('title');
      const description = getArg('description');
      const branch = getArg('branch');
      const gameId = getArg('game');

      if (status) updates.status = status;
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (branch) updates.branch = branch;
      if (gameId) updates.gameId = gameId;

      if (Object.keys(updates).length <= 1) {
        console.error('No updates specified. Use --status, --game, --branch, --title, or --description');
        process.exit(1);
      }

      try {
        const result = await apiPatch(`/automerge/move/${moveId}`, updates);
        console.log(`✅ Move ${moveId} updated`);
        for (const c of result.changes || []) {
          console.log(`   ${c.field}: ${c.old || '(none)'} → ${c.new}`);
        }
      } catch (e) {
        printCommandError('❌ Failed', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp moves [--status <s>] [--game <id>] [--agent <name>]
    // ─────────────────────────────────────────
    else if (command === 'moves') {
      const status = getArg('status');
      const gameId = getArg('game');
      const agent = getArg('agent');

      try {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (gameId) params.set('gameId', gameId);
        if (agent) params.set('agent', agent);

        const qs = params.toString();
        const data = await apiGet(`/automerge/moves${qs ? '?' + qs : ''}`);
        const moves = data.moves || [];

        if (moves.length === 0) {
          console.log('No moves found.');
        } else {
          const filters = [];
          if (status) filters.push(`status=${status}`);
          if (gameId) filters.push(`game=${gameId}`);
          if (agent) filters.push(`agent=@${agent}`);
          const filterStr = filters.length ? ` (${filters.join(', ')})` : '';

          console.log(`\nMoves${filterStr}: ${moves.length}\n`);
          for (const m of moves) {
            const statusIcon = {
              'proposed': '💡',
              'active': '🔄',
              'completed': '✅',
              'failed': '❌',
              'abandoned': '🚫'
            }[m.status] || '●';

            const branchStr = m.branch ? ` [${m.branch}]` : '';
            const gameStr = m.gameId ? ` (game: ${m.gameId})` : '';

            console.log(`  ${statusIcon} ${m.id}: ${m.title}${branchStr}${gameStr}`);
            if (m.agent) console.log(`     @${m.agent} · ${formatTime(m.created_at)}`);
          }
        }
      } catch (e) {
        printCommandError('❌ Failed', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp game create "title" [options]
    // ─────────────────────────────────────────
    else if (command === 'game' && subcommand === 'create') {
      const title = args[2];
      const endgame = getArg('endgame', '');
      const description = getArg('description', '');
      const agent = getArg('agent', process.env.GP_AGENT || 'unknown');

      if (!title) {
        console.error('Usage: gp game create "title" --endgame "goal description" [--description "text"]');
        process.exit(1);
      }

      if (!endgame) {
        console.error('Every game needs an endgame. Use --endgame "goal description"');
        process.exit(1);
      }

      try {
        const data = await apiPost('/automerge/game', { title, description, endgame, agent });
        console.log(`✅ Game created: ${data.gameId}`);
        console.log(`   Title: ${title}`);
        console.log(`   Endgame: ${endgame}`);
      } catch (e) {
        printCommandError('❌ Failed', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp game show <game-id>
    // ─────────────────────────────────────────
    else if (command === 'game' && subcommand === 'show') {
      const gameId = args[2];
      if (!gameId) {
        console.error('Usage: gp game show <game-id>');
        process.exit(1);
      }

      try {
        const data = await apiGet(`/automerge/game/${gameId}`);
        const g = data.game;
        const moves = data.moves || [];

        console.log(`\n${g.title}`);
        console.log('─'.repeat(50));
        console.log(`ID: ${g.id}`);
        console.log(`Status: ${g.status}`);
        console.log(`Endgame: ${g.endgame || '(none)'}`);
        if (g.description) {
          console.log(`\nDescription:\n${g.description.substring(0, 500)}${g.description.length > 500 ? '...' : ''}`);
        }
        console.log(`\nCreated: ${formatTime(g.created_at)}`);
        console.log(`Updated: ${formatTime(g.updated_at)}`);

        if (moves.length > 0) {
          console.log(`\nMoves (${moves.length}):`);
          for (const m of moves) {
            const statusIcon = {
              'proposed': '💡',
              'active': '🔄',
              'completed': '✅',
              'failed': '❌',
              'abandoned': '🚫'
            }[m.status] || '●';
            const branchStr = m.branch ? ` [${m.branch}]` : '';
            console.log(`  ${statusIcon} ${m.id}: ${m.title}${branchStr}`);
          }
        } else {
          console.log('\nNo moves yet.');
        }
      } catch (e) {
        printCommandError('❌ Failed', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp game update <game-id> [options]
    // ─────────────────────────────────────────
    else if (command === 'game' && subcommand === 'update') {
      const gameId = args[2];
      const agent = getArg('agent', process.env.GP_AGENT || 'unknown');

      if (!gameId) {
        console.error('Usage: gp game update <game-id> [--status <s>] [--endgame "text"] [--title "text"] [--description "text"]');
        process.exit(1);
      }

      const updates = { agent };
      const status = getArg('status');
      const title = getArg('title');
      const description = getArg('description');
      const endgame = getArg('endgame');

      if (status) updates.status = status;
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (endgame) updates.endgame = endgame;

      if (Object.keys(updates).length <= 1) {
        console.error('No updates specified. Use --status, --endgame, --title, or --description');
        process.exit(1);
      }

      try {
        const result = await apiPatch(`/automerge/game/${gameId}`, updates);
        console.log(`✅ Game ${gameId} updated`);
        for (const c of result.changes || []) {
          console.log(`   ${c.field}: ${c.old || '(none)'} → ${c.new}`);
        }
      } catch (e) {
        printCommandError('❌ Failed', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp games [--status <s>]
    // ─────────────────────────────────────────
    else if (command === 'games') {
      const status = getArg('status');

      try {
        const params = new URLSearchParams();
        if (status) params.set('status', status);

        const qs = params.toString();
        const data = await apiGet(`/automerge/games${qs ? '?' + qs : ''}`);
        const games = data.games || [];

        if (games.length === 0) {
          console.log('No games found.');
        } else {
          console.log(`\nGames: ${games.length}\n`);
          for (const g of games) {
            const statusIcon = {
              'active': '🎯',
              'won': '🏆',
              'abandoned': '🚫',
              'paused': '⏸️'
            }[g.status] || '●';

            console.log(`  ${statusIcon} ${g.id}: ${g.title}`);
            console.log(`     Endgame: ${g.endgame || '(none)'}`);
            console.log(`     ${formatTime(g.created_at)}`);
            console.log();
          }
        }
      } catch (e) {
        printCommandError('❌ Failed', e);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // gp commit [git commit args]
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
      const moveId = getArg('move');
      const agent = getDefaultAgent();
      const model = getArg(
        'model',
        process.env.GP_AGENT_MODEL || process.env.OPENCLAW_MODEL || null
      );
      const sessionKey = getArg(
        'session',
        process.env.GP_AGENT_SESSION_KEY || process.env.OPENCLAW_SESSION_KEY || null
      );

      if (taskId) {
        try {
          await ensureTaskLinkReady(taskId);
        } catch (err) {
          printCommandError('❌ Cannot link commit to task', err);
          process.exit(1);
        }
      }

      if (moveId) {
        try {
          const moveData = await apiGet(`/automerge/move/${moveId}`);
          if (!moveData.success) {
            throw new Error(`Move ${moveId} not found on sync server`);
          }
        } catch (err) {
          printCommandError('❌ Cannot link commit to move', err);
          process.exit(1);
        }
      }
      
      // Build git args (remove our custom flags)
      const gitArgs = [];
      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--task' || arg === '--move' || arg === '--agent' || arg === '--model' || arg === '--session') {
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
      const { trace } = agentTrace.createTrace({
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
      if (moveId) console.log(`   Move: ${moveId}`);

      // Link commit to move if specified
      if (moveId) {
        try {
          await apiPost(`/automerge/move/${moveId}/commit`, {
            commit: {
              hash: commitInfo.hash,
              message: commitInfo.message,
              diff: diffStats
            },
            agent
          });
          console.log(`   📎 Linked to move`);
        } catch (err) {
          console.error(`⚠️  Commit created, but move was not updated: ${err.message}`);
          if (isTransportFailure(err)) {
            printSyncRuntimeHint();
          }
        }
      }

      // Link commit to Patchwork timeline if task specified
      if (taskId) {
        try {
          await apiPost(`/automerge/task/${taskId}/commit`, {
            commit: {
              hash: commitInfo.hash,
              message: commitInfo.message,
              diff: diffStats
            },
            agent
          });
          console.log(`   📎 Linked to Patchwork timeline`);
        } catch (err) {
          console.error(`⚠️  Commit created, but Gameplan was not updated: ${err.message}`);
          if (isTransportFailure(err)) {
            printSyncRuntimeHint();
          }
        }
      }
    }

    // ─────────────────────────────────────────
    // gp trace list [--limit <n>]
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
        console.log('No traces found. Use `gp commit` to create attributed commits.');
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
    // gp trace show <commit-hash>
    // ─────────────────────────────────────────
    else if (command === 'trace' && subcommand === 'show') {
      const commitHash = args[2];
      
      if (!commitHash) {
        console.error('Usage: gp trace show <commit-hash>');
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
        console.log('(Only commits made with `gp commit` have traces)');
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
    // gp trace task <task-id>
    // Show all commits linked to a task
    // ─────────────────────────────────────────
    else if (command === 'trace' && subcommand === 'task') {
      const taskId = args[2];
      
      if (!taskId) {
        console.error('Usage: gp trace task <task-id>');
        process.exit(1);
      }
      
      const doc = await getDoc();
      const history = ((doc.taskHistory || {})[taskId] || [])
        .filter(h => h.type === 'commit');
      
      if (history.length === 0) {
        console.log(`No commits linked to task ${taskId}`);
        console.log('Use `gp commit --task <id>` to link commits.');
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
}

main().catch(err => {
  printCommandError('Error', err);
  process.exit(1);
});
