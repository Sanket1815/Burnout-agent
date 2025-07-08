import { pool } from './database';
import { User, BurnoutScore, WorkPatternData, JournalEntry } from './types';

export const dbHelpers = {
  // User operations
  async getUserById(userId: string): Promise<any> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name, avatar_url, created_at, settings FROM users WHERE id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  async createUser(userData: {
    email: string;
    name: string;
    avatar_url?: string;
  }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (email, name, avatar_url, settings) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, name, avatar_url, created_at, settings`,
        [
          userData.email,
          userData.name,
          userData.avatar_url,
          JSON.stringify({
            work_hours: { start: '09:00', end: '17:00', timezone: 'UTC' },
            notifications: {
              daily_analysis: true,
              weekly_report: true,
              burnout_alert: true,
              recommendations: false
            },
            analysis: {
              frequency: 'daily',
              include_weekends: false,
              sentiment_analysis: true,
              email_analysis: true
            }
          })
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Burnout score operations
  async getLatestBurnoutScore(userId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM burnout_scores 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  async saveBurnoutScore(scoreData: {
    user_id: string;
    overall_score: number;
    risk_level: string;
    work_hours_score: number;
    email_stress_score: number;
    meeting_load_score: number;
    break_frequency_score: number;
    sentiment_score: number;
    trend_direction: string;
    trend_percentage: number;
  }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO burnout_scores (
          user_id, overall_score, risk_level, work_hours_score,
          email_stress_score, meeting_load_score, break_frequency_score,
          sentiment_score, trend_direction, trend_percentage
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          scoreData.user_id,
          scoreData.overall_score,
          scoreData.risk_level,
          scoreData.work_hours_score,
          scoreData.email_stress_score,
          scoreData.meeting_load_score,
          scoreData.break_frequency_score,
          scoreData.sentiment_score,
          scoreData.trend_direction,
          scoreData.trend_percentage
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Work patterns operations
  async getWorkPatterns(userId: string, startDate: string, endDate: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM work_patterns 
         WHERE user_id = $1 AND date BETWEEN $2 AND $3 
         ORDER BY date DESC`,
        [userId, startDate, endDate]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async saveWorkPattern(patternData: {
    user_id: string;
    date: string;
    work_hours: number;
    meeting_count: number;
    meeting_duration: number;
    email_sent: number;
    email_received: number;
    break_count: number;
    break_duration: number;
    after_hours_activity: boolean;
  }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO work_patterns (
          user_id, date, work_hours, meeting_count, meeting_duration,
          email_sent, email_received, break_count, break_duration, after_hours_activity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id, date) 
        DO UPDATE SET
          work_hours = EXCLUDED.work_hours,
          meeting_count = EXCLUDED.meeting_count,
          meeting_duration = EXCLUDED.meeting_duration,
          email_sent = EXCLUDED.email_sent,
          email_received = EXCLUDED.email_received,
          break_count = EXCLUDED.break_count,
          break_duration = EXCLUDED.break_duration,
          after_hours_activity = EXCLUDED.after_hours_activity
        RETURNING *`,
        [
          patternData.user_id,
          patternData.date,
          patternData.work_hours,
          patternData.meeting_count,
          patternData.meeting_duration,
          patternData.email_sent,
          patternData.email_received,
          patternData.break_count,
          patternData.break_duration,
          patternData.after_hours_activity
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Journal entries operations
  async getJournalEntries(userId: string, limit: number = 10) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM journal_entries 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [userId, limit]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async saveJournalEntry(entryData: {
    user_id: string;
    content: string;
    sentiment_score: number;
    sentiment_label: string;
    word_count: number;
    ai_insights: string[];
  }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO journal_entries (
          user_id, content, sentiment_score, sentiment_label, word_count, ai_insights
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          entryData.user_id,
          entryData.content,
          entryData.sentiment_score,
          entryData.sentiment_label,
          entryData.word_count,
          JSON.stringify(entryData.ai_insights)
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
};