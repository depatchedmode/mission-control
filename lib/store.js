/**
 * Mission Control Data Store
 * 
 * Manages comments, activity, and agent data in .beans/ directory
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { randomBytes } from 'crypto';

// Find .beans directory (walk up from cwd)
function findBeansDir(startDir = process.cwd()) {
  let dir = startDir;
  while (dir !== '/') {
    const beansPath = join(dir, '.beans');
    if (existsSync(beansPath)) {
      return beansPath;
    }
    dir = dirname(dir);
  }
  throw new Error('No .beans directory found. Run from a project with beans initialized.');
}

// Generate short ID
function genId(prefix = '') {
  return prefix + randomBytes(4).toString('hex');
}

// Parse @mentions from text
function parseMentions(text) {
  const mentions = [];
  const regex = /@(\w+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    mentions.push(match[1].toLowerCase());
  }
  return [...new Set(mentions)]; // dedupe
}

// Read JSONL file
function readJsonl(path) {
  if (!existsSync(path)) return [];
  const content = readFileSync(path, 'utf-8').trim();
  if (!content) return [];
  return content.split('\n').map(line => JSON.parse(line));
}

// Append to JSONL file
function appendJsonl(path, obj) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(path, JSON.stringify(obj) + '\n');
}

// Write full JSONL file
function writeJsonl(path, items) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, items.map(i => JSON.stringify(i)).join('\n') + '\n');
}

// Read JSON file
function readJson(path, defaultValue = {}) {
  if (!existsSync(path)) return defaultValue;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

// Write JSON file
function writeJson(path, obj) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2) + '\n');
}

export class Store {
  constructor(beansDir = null) {
    this.beansDir = beansDir || findBeansDir();
    this.commentsPath = join(this.beansDir, 'comments.jsonl');
    this.activityPath = join(this.beansDir, 'activity.jsonl');
    this.agentsPath = join(this.beansDir, 'agents.json');
    this.mentionsPath = join(this.beansDir, 'mentions.jsonl');
  }

  // ─────────────────────────────────────────
  // Comments
  // ─────────────────────────────────────────

  addComment(taskId, agent, content) {
    const mentions = parseMentions(content);
    const comment = {
      id: genId('c'),
      task_id: taskId,
      agent: agent.toLowerCase(),
      content,
      mentions,
      ts: new Date().toISOString(),
    };
    
    appendJsonl(this.commentsPath, comment);
    
    // Log activity
    this.logActivity('comment_added', {
      task_id: taskId,
      agent: agent.toLowerCase(),
      comment_id: comment.id,
    });
    
    // Create mention notifications
    for (const mentioned of mentions) {
      this.createMention(comment.id, taskId, agent, mentioned, content);
    }
    
    return comment;
  }

  getComments(taskId = null) {
    const comments = readJsonl(this.commentsPath);
    if (taskId) {
      return comments.filter(c => c.task_id === taskId);
    }
    return comments;
  }

  // ─────────────────────────────────────────
  // Mentions (notifications)
  // ─────────────────────────────────────────

  createMention(commentId, taskId, fromAgent, toAgent, content) {
    const mention = {
      id: genId('m'),
      comment_id: commentId,
      task_id: taskId,
      from_agent: fromAgent.toLowerCase(),
      to_agent: toAgent.toLowerCase(),
      content,
      delivered: false,
      ts: new Date().toISOString(),
    };
    appendJsonl(this.mentionsPath, mention);
    return mention;
  }

  getPendingMentions(agent = null) {
    const mentions = readJsonl(this.mentionsPath);
    return mentions.filter(m => {
      if (m.delivered) return false;
      if (agent && m.to_agent !== agent.toLowerCase()) return false;
      return true;
    });
  }

  markMentionDelivered(mentionId) {
    const mentions = readJsonl(this.mentionsPath);
    const updated = mentions.map(m => {
      if (m.id === mentionId) {
        return { ...m, delivered: true, delivered_at: new Date().toISOString() };
      }
      return m;
    });
    writeJsonl(this.mentionsPath, updated);
  }

  // ─────────────────────────────────────────
  // Activity
  // ─────────────────────────────────────────

  logActivity(type, data) {
    const activity = {
      id: genId('a'),
      type,
      ...data,
      ts: new Date().toISOString(),
    };
    appendJsonl(this.activityPath, activity);
    return activity;
  }

  getActivity(options = {}) {
    const { taskId, agent, since, limit = 50 } = options;
    let activities = readJsonl(this.activityPath);
    
    if (taskId) {
      activities = activities.filter(a => a.task_id === taskId);
    }
    if (agent) {
      activities = activities.filter(a => a.agent === agent.toLowerCase());
    }
    if (since) {
      const sinceDate = new Date(since);
      activities = activities.filter(a => new Date(a.ts) >= sinceDate);
    }
    
    // Most recent first
    activities.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    
    return activities.slice(0, limit);
  }

  // ─────────────────────────────────────────
  // Agents
  // ─────────────────────────────────────────

  getAgents() {
    const data = readJson(this.agentsPath, { agents: {} });
    return data.agents;
  }

  getAgent(name) {
    const agents = this.getAgents();
    return agents[name.toLowerCase()] || null;
  }

  registerAgent(name, sessionKey, role = 'Specialist') {
    const data = readJson(this.agentsPath, { agents: {} });
    data.agents[name.toLowerCase()] = {
      session_key: sessionKey,
      role,
      status: 'idle',
      registered_at: new Date().toISOString(),
    };
    writeJson(this.agentsPath, data);
    
    this.logActivity('agent_registered', {
      agent: name.toLowerCase(),
      role,
    });
    
    return data.agents[name.toLowerCase()];
  }

  updateAgentStatus(name, status) {
    const data = readJson(this.agentsPath, { agents: {} });
    if (data.agents[name.toLowerCase()]) {
      data.agents[name.toLowerCase()].status = status;
      data.agents[name.toLowerCase()].status_updated_at = new Date().toISOString();
      writeJson(this.agentsPath, data);
    }
  }
}

export default Store;
