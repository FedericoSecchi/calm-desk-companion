-- Create reminder_settings table
-- Stores reminder preferences with weekday-based scheduling
CREATE TABLE IF NOT EXISTS reminder_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  days INTEGER[] DEFAULT ARRAY[1,2,3,4,5]::INTEGER[], -- 1=Monday, 7=Sunday
  times TEXT[] DEFAULT ARRAY['09:00', '12:00', '15:00', '18:00']::TEXT[], -- HH:MM format
  preset TEXT DEFAULT 'standard' CHECK (preset IN ('light', 'standard', 'focus')),
  sound_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reminder_settings_user 
  ON reminder_settings(id);

-- Enable RLS
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can manage own reminder settings" ON reminder_settings;

-- RLS Policies
CREATE POLICY "Users can manage own reminder settings"
  ON reminder_settings FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

