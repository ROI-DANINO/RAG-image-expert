/**
 * Feedback Database for RAG System
 * Stores user feedback for model improvement and quality tracking
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'feedback.db');

class FeedbackDB {
  constructor() {
    this.db = new Database(DB_PATH);
    this.init();
  }

  init() {
    // Create feedback table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feedback_id TEXT UNIQUE NOT NULL,
        session_id TEXT,
        timestamp TEXT NOT NULL,
        thumbs TEXT CHECK(thumbs IN ('up', 'down')),
        rating INTEGER CHECK(rating BETWEEN 1 AND 7),
        notes TEXT,
        result_image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_session
      ON feedback(session_id);
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_timestamp
      ON feedback(timestamp);
    `);

    console.log('✅ Feedback database initialized');
  }

  /**
   * Save feedback entry
   */
  saveFeedback(data) {
    const { feedbackId, sessionId, timestamp, thumbs, rating, notes, resultImage } = data;

    let imagePath = null;

    // Save result image if provided
    if (resultImage) {
      const imageDir = path.join(__dirname, 'feedback_images');
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      // Extract base64 data
      const matches = resultImage.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1];
        const base64Data = matches[2];
        const filename = `${feedbackId}.${ext}`;
        imagePath = path.join(imageDir, filename);

        fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));
      }
    }

    const stmt = this.db.prepare(`
      INSERT INTO feedback (feedback_id, session_id, timestamp, thumbs, rating, notes, result_image_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(feedbackId, sessionId, timestamp, thumbs || null, rating || null, notes || null, imagePath);

    return { success: true, feedbackId };
  }

  /**
   * Get all feedback
   */
  getAllFeedback() {
    const stmt = this.db.prepare('SELECT * FROM feedback ORDER BY created_at DESC');
    return stmt.all();
  }

  /**
   * Get feedback by session
   */
  getFeedbackBySession(sessionId) {
    const stmt = this.db.prepare('SELECT * FROM feedback WHERE session_id = ? ORDER BY created_at DESC');
    return stmt.all(sessionId);
  }

  /**
   * Get feedback statistics
   */
  getStats() {
    const stats = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN thumbs = 'up' THEN 1 ELSE 0 END) as thumbs_up,
        SUM(CASE WHEN thumbs = 'down' THEN 1 ELSE 0 END) as thumbs_down,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) as rated_count,
        COUNT(CASE WHEN notes IS NOT NULL THEN 1 END) as notes_count,
        COUNT(CASE WHEN result_image_path IS NOT NULL THEN 1 END) as images_count
      FROM feedback
    `).get();

    return stats;
  }

  /**
   * Get highly rated examples (for future training)
   */
  getGoodExamples(minRating = 5) {
    const stmt = this.db.prepare(`
      SELECT * FROM feedback
      WHERE rating >= ?
      ORDER BY rating DESC, created_at DESC
    `);
    return stmt.all(minRating);
  }

  /**
   * Get poorly rated examples (for future improvement)
   */
  getBadExamples(maxRating = 3) {
    const stmt = this.db.prepare(`
      SELECT * FROM feedback
      WHERE rating <= ? AND rating IS NOT NULL
      ORDER BY rating ASC, created_at DESC
    `);
    return stmt.all(maxRating);
  }

  close() {
    this.db.close();
  }
}

module.exports = { FeedbackDB };
