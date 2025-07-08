import { Pool, PoolClient } from 'pg';

// PostgreSQL connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'burnout_monitor',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        settings JSONB DEFAULT '{}',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create burnout_scores table
    await client.query(`
      CREATE TABLE IF NOT EXISTS burnout_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        overall_score DECIMAL NOT NULL DEFAULT 0,
        risk_level VARCHAR(20) NOT NULL DEFAULT 'low',
        work_hours_score DECIMAL NOT NULL DEFAULT 0,
        email_stress_score DECIMAL NOT NULL DEFAULT 0,
        meeting_load_score DECIMAL NOT NULL DEFAULT 0,
        break_frequency_score DECIMAL NOT NULL DEFAULT 0,
        sentiment_score DECIMAL NOT NULL DEFAULT 0,
        trend_direction VARCHAR(10) NOT NULL DEFAULT 'stable',
        trend_percentage DECIMAL NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create work_patterns table
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_patterns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        date DATE NOT NULL,
        work_hours DECIMAL NOT NULL DEFAULT 0,
        meeting_count INTEGER NOT NULL DEFAULT 0,
        meeting_duration DECIMAL NOT NULL DEFAULT 0,
        email_sent INTEGER NOT NULL DEFAULT 0,
        email_received INTEGER NOT NULL DEFAULT 0,
        break_count INTEGER NOT NULL DEFAULT 0,
        break_duration DECIMAL NOT NULL DEFAULT 0,
        after_hours_activity BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, date)
      )
    `);

    // Create journal_entries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        content TEXT NOT NULL,
        sentiment_score DECIMAL NOT NULL DEFAULT 0,
        sentiment_label VARCHAR(20) NOT NULL DEFAULT 'neutral',
        ai_insights JSONB DEFAULT '[]',
        word_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_burnout_scores_user_id_created_at 
      ON burnout_scores(user_id, created_at DESC)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_work_patterns_user_id_date 
      ON work_patterns(user_id, date DESC)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id_created_at 
      ON journal_entries(user_id, created_at DESC)
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export { pool };