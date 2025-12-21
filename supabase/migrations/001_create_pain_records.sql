-- Create pain_records table
-- Allows multiple records per day per user
CREATE TABLE IF NOT EXISTS pain_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area TEXT NOT NULL CHECK (area IN ('lumbar', 'cervical', 'wrist', 'shoulders')),
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries (user + date)
CREATE INDEX IF NOT EXISTS idx_pain_records_user_created 
  ON pain_records(user_id, created_at DESC);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_pain_records_created_at 
  ON pain_records(created_at DESC);

-- Enable RLS
ALTER TABLE pain_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view own pain records" ON pain_records;
DROP POLICY IF EXISTS "Users can insert own pain records" ON pain_records;

-- RLS Policies
CREATE POLICY "Users can view own pain records"
  ON pain_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pain records"
  ON pain_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

