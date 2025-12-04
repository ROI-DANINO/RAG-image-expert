/**
 * Session Database for RAG System
 * Stores conversations, messages, branches for persistent learning
 * Token-optimized: stores full data but sends minimal context to LLM
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'sessions.db');

class SessionDB {
  constructor() {
    this.db = new Database(DB_PATH);
    this.init();
  }

  init() {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        title TEXT,
        summary TEXT,
        rating INTEGER CHECK(rating BETWEEN 1 AND 7),
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'ended', 'archived')),
        metadata TEXT
      )
    `);

    // Create messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT UNIQUE NOT NULL,
        session_id TEXT NOT NULL,
        parent_message_id TEXT,
        branch_id TEXT,
        role TEXT CHECK(role IN ('user', 'assistant')) NOT NULL,
        content TEXT NOT NULL,
        images TEXT,
        rag_context_ids TEXT,
        sequence_number INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
      )
    `);

    // Create branches table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        branch_id TEXT UNIQUE NOT NULL,
        session_id TEXT NOT NULL,
        divergence_message_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
      )
    `);

    // Create indexes for fast queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_session_id ON sessions(session_id);
      CREATE INDEX IF NOT EXISTS idx_session_status ON sessions(status);
      CREATE INDEX IF NOT EXISTS idx_message_session ON messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_message_branch ON messages(branch_id);
      CREATE INDEX IF NOT EXISTS idx_message_sequence ON messages(session_id, sequence_number);
      CREATE INDEX IF NOT EXISTS idx_branch_session ON branches(session_id);
    `);

    console.log('✅ Session database initialized');
  }

  /**
   * SESSION MANAGEMENT
   */

  createSession(sessionId, metadata = {}) {
    const title = metadata.title || 'New Conversation';
    const stmt = this.db.prepare(`
      INSERT INTO sessions (session_id, title, metadata)
      VALUES (?, ?, ?)
    `);

    stmt.run(sessionId, title, JSON.stringify(metadata));

    // Create main branch
    this.createBranch({
      branch_id: `${sessionId}-main`,
      session_id: sessionId,
      divergence_message_id: 'root'
    });

    return this.getSession(sessionId);
  }

  getSession(sessionId) {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE session_id = ?');
    return stmt.get(sessionId);
  }

  getAllSessions(filters = {}) {
    let query = 'SELECT * FROM sessions WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.rating) {
      query += ' AND rating >= ?';
      params.push(filters.rating);
    }

    if (filters.limit) {
      query += ' ORDER BY updated_at DESC LIMIT ?';
      params.push(filters.limit);
    } else {
      query += ' ORDER BY updated_at DESC LIMIT 50';
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  updateSession(sessionId, updates) {
    const allowed = ['title', 'summary', 'rating', 'status', 'ended_at', 'updated_at'];
    const fields = Object.keys(updates).filter(k => allowed.includes(k));

    if (fields.length === 0) return;

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);

    const stmt = this.db.prepare(`
      UPDATE sessions SET ${setClause} WHERE session_id = ?
    `);

    stmt.run(...values, sessionId);
  }

  deleteSession(sessionId) {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE session_id = ?');
    stmt.run(sessionId);
  }

  /**
   * MESSAGE MANAGEMENT
   */

  saveMessage(messageData) {
    const {
      message_id,
      session_id,
      parent_message_id,
      branch_id,
      role,
      content,
      images,
      rag_context_ids,
      sequence_number
    } = messageData;

    const stmt = this.db.prepare(`
      INSERT INTO messages (
        message_id, session_id, parent_message_id, branch_id, role,
        content, images, rag_context_ids, sequence_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      message_id,
      session_id,
      parent_message_id || null,
      branch_id || `${session_id}-main`,
      role,
      content,
      images ? JSON.stringify(images) : null,
      rag_context_ids ? JSON.stringify(rag_context_ids) : null,
      sequence_number
    );

    // Update session timestamp
    this.updateSession(session_id, { updated_at: new Date().toISOString() });

    return this.getMessageById(message_id);
  }

  getMessageById(messageId) {
    const stmt = this.db.prepare('SELECT * FROM messages WHERE message_id = ?');
    return stmt.get(messageId);
  }

  getMessages(sessionId, branchId = null, includeDeleted = false) {
    let query = `
      SELECT * FROM messages
      WHERE session_id = ?
    `;
    const params = [sessionId];

    if (branchId) {
      query += ' AND branch_id = ?';
      params.push(branchId);
    }

    if (!includeDeleted) {
      query += ' AND is_deleted = 0';
    }

    query += ' ORDER BY sequence_number ASC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Get recent messages for LLM context (token-optimized)
   * Returns last N messages only
   */
  getRecentMessages(sessionId, branchId = null, limit = 6) {
    const allMessages = this.getMessages(sessionId, branchId);
    return allMessages.slice(-limit);
  }

  updateMessage(messageId, updates) {
    const allowed = ['content', 'is_deleted'];
    const fields = Object.keys(updates).filter(k => allowed.includes(k));

    if (fields.length === 0) return;

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);

    const stmt = this.db.prepare(`
      UPDATE messages SET ${setClause} WHERE message_id = ?
    `);

    stmt.run(...values, messageId);
  }

  /**
   * BRANCH MANAGEMENT
   */

  createBranch(branchData) {
    const { branch_id, session_id, divergence_message_id } = branchData;

    const stmt = this.db.prepare(`
      INSERT INTO branches (branch_id, session_id, divergence_message_id)
      VALUES (?, ?, ?)
    `);

    stmt.run(branch_id, session_id, divergence_message_id);
    return this.getBranch(branch_id);
  }

  getBranch(branchId) {
    const stmt = this.db.prepare('SELECT * FROM branches WHERE branch_id = ?');
    return stmt.get(branchId);
  }

  getBranches(sessionId) {
    const stmt = this.db.prepare('SELECT * FROM branches WHERE session_id = ?');
    return stmt.all(sessionId);
  }

  deleteBranch(branchId) {
    // Soft delete messages in this branch
    const stmt = this.db.prepare(`
      UPDATE messages SET is_deleted = 1 WHERE branch_id = ?
    `);
    stmt.run(branchId);

    // Mark branch as inactive
    const stmt2 = this.db.prepare(`
      UPDATE branches SET is_active = 0 WHERE branch_id = ?
    `);
    stmt2.run(branchId);
  }

  /**
   * STATISTICS & ANALYTICS
   */

  getSessionStats(sessionId) {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as message_count,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_messages,
        SUM(CASE WHEN role = 'assistant' THEN 1 ELSE 0 END) as assistant_messages
      FROM messages
      WHERE session_id = ? AND is_deleted = 0
    `);

    return stmt.get(sessionId);
  }

  close() {
    this.db.close();
  }
}

module.exports = { SessionDB };
