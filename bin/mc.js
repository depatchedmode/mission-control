#!/usr/bin/env node

/**
 * Mission Control CLI
 * 
 * Usage:
 *   mc comment <task-id> "message"
 *   mc comments <task-id>
 *   mc mentions pending [--agent <name>]
 *   mc mentions deliver <id>
 *   mc activity [--task <id>] [--agent <name>] [--limit <n>]
 *   mc agents list
 *   mc agents register <name> <session-key> [role]
 *   mc agents status <name> <status>
 */

import { Store } from '../lib/store.js';

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

function usage() {
  console.log(`
Mission Control CLI

Usage:
  mc comment <task-id> "message"           Add a comment to a task
  mc comments <task-id>                    List comments for a task
  mc mentions pending [--agent <name>]     List pending @mentions
  mc mentions deliver <id>                 Mark mention as delivered
  mc activity [options]                    Show activity feed
  mc agents list                           List registered agents
  mc agents register <name> <key> [role]   Register an agent
  mc agents status <name> <status>         Update agent status

Options for activity:
  --task <id>      Filter by task
  --agent <name>   Filter by agent
  --limit <n>      Number of items (default: 20)
  --since <time>   Since time (ISO or relative)

Examples:
  mc comment clawd-pxdf "Starting work on this"
  mc comment clawd-pxdf "@writer can you help with docs?"
  mc mentions pending --agent writer
  mc activity --limit 10
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

  const store = new Store();

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
    
    const comment = store.addComment(taskId, agent, message);
    console.log(`Comment added: ${comment.id}`);
    if (comment.mentions.length > 0) {
      console.log(`Mentions: @${comment.mentions.join(', @')}`);
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
    
    const comments = store.getComments(taskId);
    if (comments.length === 0) {
      console.log('No comments yet.');
    } else {
      for (const c of comments) {
        console.log(`\n[${c.agent}] ${formatTime(c.ts)}`);
        console.log(c.content);
      }
    }
  }

  // ─────────────────────────────────────────
  // mc mentions pending/deliver
  // ─────────────────────────────────────────
  else if (command === 'mentions') {
    if (subcommand === 'pending') {
      const agent = getArg('agent');
      const mentions = store.getPendingMentions(agent);
      
      if (mentions.length === 0) {
        console.log('No pending mentions.');
      } else {
        console.log(`${mentions.length} pending mention(s):\n`);
        for (const m of mentions) {
          console.log(`[${m.id}] @${m.to_agent} from @${m.from_agent} on ${m.task_id}`);
          console.log(`   "${m.content.substring(0, 80)}${m.content.length > 80 ? '...' : ''}"`);
          console.log(`   ${formatTime(m.ts)}\n`);
        }
      }
    }
    else if (subcommand === 'deliver') {
      const mentionId = args[2];
      if (!mentionId) {
        console.error('Usage: mc mentions deliver <id>');
        process.exit(1);
      }
      store.markMentionDelivered(mentionId);
      console.log(`Marked ${mentionId} as delivered.`);
    }
    else {
      console.error('Usage: mc mentions pending|deliver');
      process.exit(1);
    }
  }

  // ─────────────────────────────────────────
  // mc activity
  // ─────────────────────────────────────────
  else if (command === 'activity') {
    const taskId = getArg('task');
    const agent = getArg('agent');
    const limit = parseInt(getArg('limit', '20'));
    const since = getArg('since');
    
    const activities = store.getActivity({ taskId, agent, since, limit });
    
    if (activities.length === 0) {
      console.log('No activity.');
    } else {
      for (const a of activities) {
        const agentStr = a.agent ? `@${a.agent}` : '';
        const taskStr = a.task_id ? `[${a.task_id}]` : '';
        console.log(`${formatTime(a.ts)} ${a.type} ${agentStr} ${taskStr}`);
      }
    }
  }

  // ─────────────────────────────────────────
  // mc agents list/register/status
  // ─────────────────────────────────────────
  else if (command === 'agents') {
    if (subcommand === 'list') {
      const agents = store.getAgents();
      const names = Object.keys(agents);
      
      if (names.length === 0) {
        console.log('No agents registered.');
      } else {
        console.log('Agents:\n');
        for (const name of names) {
          const a = agents[name];
          console.log(`  ${name} (${a.role})`);
          console.log(`    Session: ${a.session_key}`);
          console.log(`    Status: ${a.status}`);
          console.log();
        }
      }
    }
    else if (subcommand === 'register') {
      const name = args[2];
      const sessionKey = args[3];
      const role = args[4] || 'Specialist';
      
      if (!name || !sessionKey) {
        console.error('Usage: mc agents register <name> <session-key> [role]');
        process.exit(1);
      }
      
      store.registerAgent(name, sessionKey, role);
      console.log(`Registered agent: ${name}`);
    }
    else if (subcommand === 'status') {
      const name = args[2];
      const status = args[3];
      
      if (!name || !status) {
        console.error('Usage: mc agents status <name> <status>');
        process.exit(1);
      }
      
      store.updateAgentStatus(name, status);
      console.log(`Updated ${name} status to: ${status}`);
    }
    else {
      console.error('Usage: mc agents list|register|status');
      process.exit(1);
    }
  }

  else {
    console.error(`Unknown command: ${command}`);
    usage();
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
