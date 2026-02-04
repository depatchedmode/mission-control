#!/usr/bin/env node

/**
 * Mission Control CLI (Automerge backend)
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

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

function usage() {
  console.log(`
Mission Control CLI

Usage:
  mc comment <task-id> "message"           Add a comment (use @name to mention)
  mc comments <task-id>                    List comments for a task
  mc mentions pending [--agent <name>]     List pending @mentions
  mc activity [--limit <n>]                Show activity feed
  mc agents list                           List registered agents
  mc show <task-id>                        Show task details
  mc tasks [--status <s>]                  List tasks

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
  mc mentions pending --agent friday
  mc tasks --status in-progress
  mc timeline --agent friday --limit 10
  mc branch clawd-pxdf "try-different-approach"
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

  const store = new AutomergeStore();
  await store.init();

  // Helper: try to use sync server API first (ensures consistency)
  async function addCommentViaAPI(taskId, text, agent) {
    try {
      const res = await fetch('http://localhost:8004/automerge/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, text, agent })
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, commentId: data.commentId, via: 'api' };
      }
    } catch (e) {
      // Server not running, fall back to direct store
    }
    const commentId = await store.addComment(taskId, text, agent);
    return { success: true, commentId, via: 'store' };
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
      
      const result = await addCommentViaAPI(taskId, message, agent);
      console.log(`✅ Comment added: ${result.commentId} (via ${result.via})`);
      
      // Check for mentions in the message
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
      
      const comments = await store.getComments(taskId);
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
    // mc mentions pending
    // ─────────────────────────────────────────
    else if (command === 'mentions') {
      if (subcommand === 'pending') {
        const agent = getArg('agent');
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
      else {
        console.error('Usage: mc mentions pending [--agent <name>]');
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // mc activity
    // ─────────────────────────────────────────
    else if (command === 'activity') {
      const limit = parseInt(getArg('limit', '20'));
      const activities = await store.getActivity({ limit });
      
      if (activities.length === 0) {
        console.log('No activity.');
      } else {
        console.log('Recent activity:\n');
        for (const a of activities) {
          const agentStr = a.agent ? `@${a.agent}` : '';
          const taskStr = a.task_id ? `[${a.task_id}]` : '';
          console.log(`  ${formatTime(a.timestamp)} ${a.type} ${agentStr} ${taskStr}`);
        }
      }
    }

    // ─────────────────────────────────────────
    // mc agents list
    // ─────────────────────────────────────────
    else if (command === 'agents') {
      if (subcommand === 'list' || !subcommand) {
        const agents = await store.getAgents();
        
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
      
      const doc = store.getDoc();
      const task = doc.tasks[taskId];
      
      if (!task) {
        console.log(`Task ${taskId} not found.`);
        process.exit(1);
      }
      
      console.log(`\n${task.title}`);
      console.log('─'.repeat(50));
      console.log(`ID: ${task.id}`);
      console.log(`Status: ${task.status}`);
      console.log(`Type: ${task.type || 'task'}`);
      console.log(`Assignee: ${task.assignee || 'unassigned'}`);
      if (task.description) {
        console.log(`\nDescription:\n${task.description.substring(0, 500)}${task.description.length > 500 ? '...' : ''}`);
      }
      
      const comments = await store.getComments(taskId);
      if (comments.length > 0) {
        console.log(`\nComments (${comments.length}):`);
        for (const c of comments.slice(-3)) {
          console.log(`  [@${c.agent}] ${c.content.substring(0, 60)}...`);
        }
      }
    }

    // ─────────────────────────────────────────
    // mc tasks
    // ─────────────────────────────────────────
    else if (command === 'tasks') {
      const status = getArg('status');
      const doc = store.getDoc();
      
      let tasks = Object.values(doc.tasks || {});
      if (status) {
        tasks = tasks.filter(t => t.status === status);
      }
      
      if (tasks.length === 0) {
        console.log('No tasks found.');
      } else {
        console.log(`\nTasks${status ? ` (${status})` : ''}: ${tasks.length}\n`);
        for (const t of tasks) {
          const statusIcon = {
            'todo': '⬜',
            'in-progress': '🔄',
            'completed': '✅',
            'blocked': '🚫'
          }[t.status] || '📋';
          
          console.log(`  ${statusIcon} ${t.id}: ${t.title}`);
          if (t.assignee) console.log(`     @${t.assignee}`);
        }
      }
    }

    // ─────────────────────────────────────────
    // mc timeline [--agent <name>] [--task <id>] [--limit <n>]
    // Rich timeline view with comments and context
    // ─────────────────────────────────────────
    else if (command === 'timeline') {
      const agent = getArg('agent');
      const taskFilter = getArg('task');
      const limit = parseInt(getArg('limit', '20'));
      
      const timeline = await store.getTimeline({ agent, task: taskFilter, limit });
      
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
          
          if (entry.task_id) {
            const doc = store.getDoc();
            const task = doc.tasks[entry.task_id];
            if (task) {
              console.log(`│   Task: ${task.title} [${entry.task_id}]`);
            }
          }
          
          if (entry.comment_id) {
            const doc = store.getDoc();
            const comment = doc.comments[entry.comment_id];
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
    // Show task changes over time
    // ─────────────────────────────────────────
    else if (command === 'diff') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Usage: mc diff <task-id>');
        process.exit(1);
      }
      
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
    // Update task with history tracking
    // ─────────────────────────────────────────
    else if (command === 'update') {
      const taskId = args[1];
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      
      if (!taskId) {
        console.error('Usage: mc update <task-id> [--status <s>] [--assignee <name>] [--title "text"]');
        process.exit(1);
      }
      
      const updates = {};
      const status = getArg('status');
      const assignee = getArg('assignee');
      const title = getArg('title');
      
      if (status) updates.status = status;
      if (assignee) updates.assignee = assignee;
      if (title) updates.title = title;
      
      if (Object.keys(updates).length === 0) {
        console.error('No updates specified. Use --status, --assignee, or --title');
        process.exit(1);
      }
      
      const result = await store.updateTask(taskId, updates, agent);
      
      if (result.success) {
        console.log(`✅ Task ${taskId} updated`);
        for (const c of result.changes) {
          console.log(`   ${c.field}: ${c.old || '(none)'} → ${c.new}`);
        }
      } else {
        console.error(`Failed: ${result.error}`);
        process.exit(1);
      }
    }

    // ─────────────────────────────────────────
    // mc branch <task-id> <branch-name>
    // Create a task branch to experiment
    // ─────────────────────────────────────────
    else if (command === 'branch') {
      const taskId = args[1];
      const branchName = args[2];
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      
      if (!taskId || !branchName) {
        console.error('Usage: mc branch <task-id> <branch-name>');
        process.exit(1);
      }
      
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
    // List branches of a task
    // ─────────────────────────────────────────
    else if (command === 'branches') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Usage: mc branches <task-id>');
        process.exit(1);
      }
      
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
    // Merge branch back to parent
    // ─────────────────────────────────────────
    else if (command === 'merge') {
      const branchId = args[1];
      const agent = getArg('agent', process.env.MC_AGENT || 'unknown');
      
      if (!branchId) {
        console.error('Usage: mc merge <branch-task-id>');
        process.exit(1);
      }
      
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

    else {
      console.error(`Unknown command: ${command}`);
      usage();
      process.exit(1);
    }
  } finally {
    await store.close();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
