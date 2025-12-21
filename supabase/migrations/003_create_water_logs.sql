-- Create water_logs table
-- Tracks individual water glass consumption events
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries (user + date)
CREATE INDEX IF NOT EXISTS idx_water_logs_user_created 
  ON water_logs(user_id, created_at DESC);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_water_logs_created_at 
  ON water_logs(created_at DESC);

-- Enable RLS
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view own water logs" ON water_logs;
DROP POLICY IF EXISTS "Users can insert own water logs" ON water_logs;
DROP POLICY IF EXISTS "Users can delete own water logs" ON water_logs;

-- RLS Policies
CREATE POLICY "Users can view own water logs"
  ON water_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water logs"
  ON water_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water logs"
  ON water_logs FOR DELETE
  USING (auth.uid() = user_id);

