# Setup Checklist - Required from User

This document lists everything that needs to be configured externally (Supabase dashboard, OAuth providers, etc.) for the app to work fully.

## ✅ Already Configured (Based on Previous Setup)

- ✅ Supabase Project URL: `https://wtquhlfodfqjcggaqxwk.supabase.co`
- ✅ Supabase Anon Key: Set in `.env.local`
- ✅ `profiles` table created with RLS enabled
- ✅ Email authentication enabled
- ✅ Redirect URLs configured for OAuth

## 🔧 Supabase Dashboard Configuration

### 1. Email Authentication

**Status:** ✅ Enabled (assumed)

**To Verify:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication → Providers**
4. Ensure **Email** provider is enabled
5. Check **Authentication → Settings**:
   - **Email confirmations**: Currently disabled for development (as requested)
   - For production, enable email confirmations and configure SMTP

**SMTP Configuration (For Production):**
- Go to **Authentication → Settings → SMTP Settings**
- Configure your email provider (SendGrid, AWS SES, etc.)
- This is required if email confirmations are enabled

### 2. Google OAuth

**Status:** ⚠️ Needs Verification

**To Configure:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Configure:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - Local: `http://localhost:5173/auth/callback`
     - Production: `https://federicosecchi.github.io/calm-desk-companion/auth/callback`
6. Copy **Client ID** and **Client Secret**
7. In Supabase Dashboard:
   - Go to **Authentication → Providers**
   - Enable **Google** provider
   - Paste **Client ID** and **Client Secret**
   - Save

**Current Status:** Unknown - needs verification

### 3. Redirect URLs

**Status:** ✅ Configured (assumed)

**To Verify:**
1. Go to **Authentication → URL Configuration**
2. Ensure these URLs are in **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `https://federicosecchi.github.io/calm-desk-companion/auth/callback`
   - `http://localhost:5173/**` (for local dev)
   - `https://federicosecchi.github.io/calm-desk-companion/**` (for production)

### 4. Database Tables

**Current Status:**
- ✅ `profiles` table exists with RLS

**Missing Tables (For Full Functionality):**

#### A. `user_preferences` Table

**Purpose:** Store onboarding preferences and user settings

**SQL:**
```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  work_start TIME,
  work_end TIME,
  lunch_break BOOLEAN DEFAULT true,
  goal TEXT CHECK (goal IN ('pain', 'productivity', 'both')),
  pain_area TEXT CHECK (pain_area IN ('lumbar', 'cervical', 'wrist', 'none')),
  flow_mode TEXT CHECK (flow_mode IN ('lumbar', 'cervical')),
  language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en')),
  reduce_motion BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = id);
```

**Alternative:** Extend `profiles` table instead of creating separate table.

#### B. `pain_records` Table

**Purpose:** Store pain tracking records

**SQL:**
```sql
CREATE TABLE IF NOT EXISTS pain_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pain_level INTEGER NOT NULL CHECK (pain_level >= 1 AND pain_level <= 10),
  area TEXT NOT NULL CHECK (area IN ('lumbar', 'cervical', 'wrist', 'shoulders')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_pain_records_user_created ON pain_records(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE pain_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pain records"
  ON pain_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pain records"
  ON pain_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### C. `exercise_completions` Table

**Purpose:** Track completed exercises

**SQL:**
```sql
CREATE TABLE IF NOT EXISTS exercise_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_exercise_completions_user_date ON exercise_completions(user_id, completed_at DESC);

-- RLS Policies
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercise completions"
  ON exercise_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise completions"
  ON exercise_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### D. `reminder_settings` Table (Optional)

**Purpose:** Store reminder preferences

**SQL:**
```sql
CREATE TABLE IF NOT EXISTS reminder_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preset TEXT DEFAULT 'standard' CHECK (preset IN ('light', 'standard', 'focus')),
  sound_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reminder settings"
  ON reminder_settings FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**Alternative:** Add these fields to `profiles` or `user_preferences` table.

### 5. How to Run SQL Migrations

**Option 1: Supabase Dashboard SQL Editor**
1. Go to **SQL Editor** in Supabase Dashboard
2. Paste the SQL for each table
3. Click **Run**

**Option 2: Supabase CLI (If Using)**
```bash
supabase db push
```

**Option 3: Save as Migration Files**
Create files in `/supabase/migrations/` (if using Supabase CLI):
- `001_create_user_preferences.sql`
- `002_create_pain_records.sql`
- `003_create_exercise_completions.sql`
- `004_create_reminder_settings.sql`

## 🔍 Verification Steps

### 1. Test Email Authentication
- [ ] Sign up with email/password
- [ ] Check if email confirmation is required (should be disabled for dev)
- [ ] Sign in with created account
- [ ] Verify profile is created in `profiles` table

### 2. Test Google OAuth
- [ ] Click "Google" button on auth page
- [ ] Complete OAuth flow
- [ ] Verify redirect to `/app` works
- [ ] Verify profile is created

### 3. Test Database Tables
- [ ] Run SQL migrations
- [ ] Verify tables exist in **Table Editor**
- [ ] Test RLS policies (try querying as different user)
- [ ] Verify foreign key constraints work

### 4. Test Guest Mode
- [ ] Click "Probar sin registrarse"
- [ ] Verify redirect to `/app`
- [ ] Verify guest banner appears
- [ ] Test logout from guest mode

## 📝 Environment Variables

**Required in `.env.local`:**
```env
VITE_SUPABASE_URL=https://wtquhlfodfqjcggaqxwk.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Status:** ✅ Already configured (based on previous setup)

## ⚠️ Important Notes

1. **Email Confirmations**: Currently disabled for development. For production:
   - Enable email confirmations in Supabase
   - Configure SMTP provider
   - Update signup flow to handle confirmation emails

2. **RLS Policies**: All tables must have RLS enabled and proper policies. The SQL above includes basic policies - adjust as needed.

3. **OAuth Redirect URLs**: Must match exactly (including trailing slashes and paths)

4. **Production vs Development**: 
   - Local: `http://localhost:5173`
   - Production: `https://federicosecchi.github.io/calm-desk-companion`

## 🆘 Troubleshooting

### "Invalid login credentials"
- Check if email confirmation is enabled (should be disabled for dev)
- Verify user exists in Supabase Auth
- Check Supabase logs for errors

### OAuth redirect fails
- Verify redirect URL matches exactly in Supabase and OAuth provider
- Check browser console for errors
- Verify OAuth credentials are correct

### RLS policy errors
- Check if user is authenticated
- Verify policy conditions match user ID
- Test policies in Supabase SQL Editor

### Tables not found
- Verify SQL migrations ran successfully
- Check table names match exactly (case-sensitive)
- Verify you're connected to correct database

