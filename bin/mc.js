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

Environment:
  MC_AGENT    Your agent name (default: from --agent or 'unknown')

Examples:
  MC_AGENT=gary mc comment clawd-pxdf "Starting work on this"
  mc comment clawd-pxdf "@friday can you help with the API?"
  mc mentions pending --agent friday
  mc tasks --status in-progress
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
      
      const commentId = await store.addComment(taskId, message, agent);
      console.log(`✅ Comment added: ${commentId}`);
      
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
