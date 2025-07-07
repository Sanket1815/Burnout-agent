/*
  # Initial Schema for Burnout Monitor

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `avatar_url` (text, optional)
      - `google_access_token` (text, encrypted)
      - `google_refresh_token` (text, encrypted)
      - `settings` (jsonb for user preferences)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `burnout_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `overall_score` (numeric)
      - `risk_level` (text)
      - Various factor scores
      - `trend_direction` (text)
      - `trend_percentage` (numeric)
      - `created_at` (timestamp)

    - `work_patterns`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - Work metrics (hours, meetings, emails, breaks)
      - `after_hours_activity` (boolean)
      - `created_at` (timestamp)

    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `sentiment_score` (numeric)
      - `sentiment_label` (text)
      - `ai_insights` (jsonb)
      - `word_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `google_integrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `service` (text)
      - `connected` (boolean)
      - Token storage
      - `permissions` (jsonb)
      - `last_sync` (timestamp)
      - `error_message` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `recommendations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `priority` (text)
      - `category` (text)
      - `impact` (text)
      - `effort` (text)
      - `actionable` (boolean)
      - `timeframe` (text)
      - `details` (jsonb)
      - `completed` (boolean)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for real-time subscriptions

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for complex queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  google_access_token text,
  google_refresh_token text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create burnout_scores table
CREATE TABLE IF NOT EXISTS burnout_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  overall_score numeric NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low',
  work_hours_score numeric NOT NULL DEFAULT 0,
  email_stress_score numeric NOT NULL DEFAULT 0,
  meeting_load_score numeric NOT NULL DEFAULT 0,
  break_frequency_score numeric NOT NULL DEFAULT 0,
  sentiment_score numeric NOT NULL DEFAULT 0,
  trend_direction text NOT NULL DEFAULT 'stable',
  trend_percentage numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create work_patterns table
CREATE TABLE IF NOT EXISTS work_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  work_hours numeric NOT NULL DEFAULT 0,
  meeting_count integer NOT NULL DEFAULT 0,
  meeting_duration numeric NOT NULL DEFAULT 0,
  email_sent integer NOT NULL DEFAULT 0,
  email_received integer NOT NULL DEFAULT 0,
  break_count integer NOT NULL DEFAULT 0,
  break_duration numeric NOT NULL DEFAULT 0,
  after_hours_activity boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  sentiment_score numeric NOT NULL DEFAULT 0,
  sentiment_label text NOT NULL DEFAULT 'neutral',
  ai_insights jsonb DEFAULT '[]',
  word_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create google_integrations table
CREATE TABLE IF NOT EXISTS google_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  service text NOT NULL,
  connected boolean NOT NULL DEFAULT false,
  access_token text,
  refresh_token text,
  permissions jsonb DEFAULT '[]',
  last_sync timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, service)
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  category text NOT NULL DEFAULT 'wellness',
  impact text NOT NULL DEFAULT 'medium',
  effort text NOT NULL DEFAULT 'medium',
  actionable boolean NOT NULL DEFAULT true,
  timeframe text NOT NULL DEFAULT 'this week',
  details jsonb DEFAULT '[]',
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for burnout_scores table
CREATE POLICY "Users can read own burnout scores"
  ON burnout_scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own burnout scores"
  ON burnout_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for work_patterns table
CREATE POLICY "Users can read own work patterns"
  ON work_patterns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work patterns"
  ON work_patterns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work patterns"
  ON work_patterns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for journal_entries table
CREATE POLICY "Users can read own journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for google_integrations table
CREATE POLICY "Users can read own google integrations"
  ON google_integrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own google integrations"
  ON google_integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own google integrations"
  ON google_integrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for recommendations table
CREATE POLICY "Users can read own recommendations"
  ON recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON recommendations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_burnout_scores_user_id_created_at ON burnout_scores(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_work_patterns_user_id_date ON work_patterns(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id_created_at ON journal_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_google_integrations_user_id_service ON google_integrations(user_id, service);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id_priority ON recommendations(user_id, priority, completed);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_integrations_updated_at
  BEFORE UPDATE ON google_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();