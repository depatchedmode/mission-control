#!/usr/bin/env node

/**
 * Mission Control Notification Daemon v2
 * 
 * Uses the Automerge Sync Server HTTP API for real-time state.
 * Polls for pending mentions and delivers via OpenClaw cron wake.
 */

const SYNC_SERVER = 'http://localhost:8004';
const POLL_INTERVAL_MS = 3000;
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

function log(msg) {
  const ts = new Date().toISOString().substring(11, 19);
  console.log(`[${ts}] ${msg}`);
}

function debug(msg) {
  if (VERBOSE) log(`[debug] ${msg}`);
}

async function getDocument() {
  const res = await fetch(`${SYNC_SERVER}/automerge/doc`);
  if (!res.ok) throw new Error(`Sync server error: ${res.status}`);
  const data = await res.json();
  return data.doc;
}

async function markDelivered(mentionId) {
  const res = await fetch(`${SYNC_SERVER}/automerge/mentions/${mentionId}/deliver`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to mark delivered: ${res.status}`);
}

async function getPendingMentions(agent = null) {
  const url = agent 
    ? `${SYNC_SERVER}/automerge/mentions/pending?agent=${agent}`
    : `${SYNC_SERVER}/automerge/mentions/pending`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to get mentions: ${res.status}`);
  const data = await res.json();
  return data.mentions;
}

async function wakeAgent(agentId, message) {
  if (DRY_RUN) {
    log(`[DRY-RUN] Would wake ${agentId}: ${message.substring(0, 50)}...`);
    return true;
  }
  
  try {
    const { execSync } = await import('child_process');
    const sessionKey = `agent:${agentId}:main`;
    
    // Use openclaw CLI to send message to agent session
    const cmd = `openclaw sessions send --session-key "${sessionKey}" --message ${JSON.stringify(message)}`;
    debug(`Executing: ${cmd}`);
    
    execSync(cmd, { 
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    log(`📤 Delivered mention to @${agentId}`);
    return true;
  } catch (err) {
    log(`❌ Failed to send to ${agentId}: ${err.message}`);
    return false;
  }
}

async function processMentions() {
  const pendingMentions = await getPendingMentions();
  
  if (pendingMentions.length === 0) {
    debug('No pending mentions');
    return 0;
  }
  
  log(`Found ${pendingMentions.length} pending mention(s)`);
  const doc = await getDocument();
  let processed = 0;
  
  for (const mention of pendingMentions) {
    const agent = doc.agents[mention.to_agent];
    
    if (!agent) {
      log(`⚠️ No agent registered for @${mention.to_agent}`);
      continue;
    }
    
    const message = `📬 @${mention.from_agent} mentioned you on ${mention.task_id}: "${mention.content.substring(0, 100)}..."`;
    
    const success = await wakeAgent(mention.to_agent, message);
    
    if (success) {
      await markDelivered(mention.id);
      processed++;
      log(`✅ Processed mention ${mention.id} for @${mention.to_agent}`);
    }
  }
  
  return processed;
}

async function runDaemon() {
  log('🚀 Mission Control Notification Daemon v2');
  log(`   Sync server: ${SYNC_SERVER}`);
  log(`   Poll interval: ${POLL_INTERVAL_MS}ms`);
  if (DRY_RUN) log('   Mode: DRY-RUN');
  if (VERBOSE) log('   Mode: VERBOSE');
  
  // Verify sync server is running
  try {
    const doc = await getDocument();
    const agentCount = Object.keys(doc.agents || {}).length;
    const pendingCount = Object.values(doc.mentions || {}).filter(m => !m.delivered).length;
    log(`✅ Connected to sync server`);
    log(`   Agents: ${agentCount}, Pending mentions: ${pendingCount}`);
  } catch (err) {
    log(`❌ Cannot connect to sync server: ${err.message}`);
    log(`   Make sure mc-sync is running: pm2 start automerge-sync-server.js --name mc-sync`);
    process.exit(1);
  }
  
  log('');
  log('Daemon running. Press Ctrl+C to stop.');
  log('─'.repeat(50));
  
  // Main loop
  while (true) {
    try {
      const processed = await processMentions();
      if (processed > 0) {
        log(`📊 Processed ${processed} mention(s)`);
        log('─'.repeat(50));
      }
    } catch (err) {
      log(`❌ Error: ${err.message}`);
      if (VERBOSE) console.error(err);
    }
    
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

runDaemon().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
