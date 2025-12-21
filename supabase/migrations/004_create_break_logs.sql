-- Create break_logs table
-- Tracks completed break/reminder events
CREATE TABLE IF NOT EXISTS break_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'reminder' CHECK (type IN ('reminder', 'exercise', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries (user + date)
CREATE INDEX IF NOT EXISTS idx_break_logs_user_created 
  ON break_logs(user_id, created_at DESC);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_break_logs_created_at 
  ON break_logs(created_at DESC);

-- Enable RLS
ALTER TABLE break_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view own break logs" ON break_logs;
DROP POLICY IF EXISTS "Users can insert own break logs" ON break_logs;
DROP POLICY IF EXISTS "Users can delete own break logs" ON break_logs;

-- RLS Policies
CREATE POLICY "Users can view own break logs"
  ON break_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own break logs"
  ON break_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own break logs"
  ON break_logs FOR DELETE
  USING (auth.uid() = user_id);

