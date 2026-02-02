#!/usr/bin/env node

/**
 * Mission Control Notification Daemon
 * 
 * Polls for pending @mentions and delivers them to agent sessions
 * via OpenClaw's sessions_send.
 * 
 * Run with: node daemon/index.js
 * Or via pm2: pm2 start daemon/index.js --name mc-daemon
 */

import { Store } from '../lib/store.js';
import { execSync, spawn } from 'child_process';

const POLL_INTERVAL_MS = 2000;  // Check every 2 seconds
const DRY_RUN = process.argv.includes('--dry-run');

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

async function sendToSession(sessionKey, message) {
  if (DRY_RUN) {
    log(`[DRY-RUN] Would send to ${sessionKey}: ${message.substring(0, 50)}...`);
    return true;
  }
  
  try {
    // Use openclaw CLI to send message
    execSync(`openclaw sessions send --session "${sessionKey}" --message "${message.replace(/"/g, '\\"')}"`, {
      stdio: 'pipe',
      timeout: 30000,
    });
    return true;
  } catch (err) {
    log(`Failed to send to ${sessionKey}: ${err.message}`);
    return false;
  }
}

async function deliverMentions(store) {
  const mentions = store.getPendingMentions();
  
  if (mentions.length === 0) {
    return 0;
  }
  
  let delivered = 0;
  
  for (const mention of mentions) {
    const agent = store.getAgent(mention.to_agent);
    
    if (!agent) {
      log(`No agent registered for @${mention.to_agent}, skipping mention ${mention.id}`);
      continue;
    }
    
    const message = `📬 You were mentioned by @${mention.from_agent} on task ${mention.task_id}:\n\n"${mention.content}"`;
    
    log(`Delivering mention ${mention.id} to @${mention.to_agent} (${agent.session_key})`);
    
    const success = await sendToSession(agent.session_key, message);
    
    if (success) {
      store.markMentionDelivered(mention.id);
      delivered++;
      log(`✓ Delivered ${mention.id}`);
    }
  }
  
  return delivered;
}

async function main() {
  log('Mission Control Notification Daemon starting...');
  log(`Poll interval: ${POLL_INTERVAL_MS}ms`);
  if (DRY_RUN) {
    log('DRY-RUN mode: will not actually send messages');
  }
  
  // Find beans dir from current working directory
  let store;
  try {
    store = new Store();
    log(`Using beans dir: ${store.beansDir}`);
  } catch (err) {
    log(`Error: ${err.message}`);
    log('Run this daemon from a directory with a .beans/ folder.');
    process.exit(1);
  }
  
  log('Daemon running. Press Ctrl+C to stop.\n');
  
  // Main loop
  while (true) {
    try {
      const delivered = await deliverMentions(store);
      if (delivered > 0) {
        log(`Delivered ${delivered} mention(s)\n`);
      }
    } catch (err) {
      log(`Error in delivery loop: ${err.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

main();
