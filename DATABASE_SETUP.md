# Database Setup Instructions

This document provides step-by-step instructions to set up the database tables required for the Calmo MVP.

## Prerequisites

- Supabase project created
- Access to Supabase Dashboard SQL Editor
- `profiles` table already exists (from previous setup)

## Step 1: Run SQL Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `supabase/migrations/001_create_pain_records.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify success message
7. Repeat for `supabase/migrations/002_create_reminder_settings.sql`

### Option B: Using Supabase CLI (If Installed)

```bash
# If you have Supabase CLI installed
supabase db push
```

## Step 2: Verify Tables Created

1. Go to **Table Editor** in Supabase Dashboard
2. Verify these tables exist:
   - ✅ `pain_records`
   - ✅ `reminder_settings`
   - ✅ `profiles` (should already exist)

## Step 3: Verify RLS Policies

1. Go to **Authentication → Policies** for each table
2. Verify RLS is enabled (should be automatic from migrations)
3. Check that policies allow:
   - Users can SELECT their own records
   - Users can INSERT their own records
   - Users can UPDATE their own records (for reminder_settings)

## Step 4: Test the Setup

1. Start the app: `npm run dev`
2. Sign up or log in with a test account
3. Go to **Pain** page and submit a pain record
4. Verify record appears in `pain_records` table in Supabase
5. Go to **Reminders** page and change preset
6. Verify settings saved in `reminder_settings` table

## Troubleshooting

### "relation does not exist"
- Make sure you ran the SQL migrations
- Check table names match exactly (case-sensitive)

### "permission denied"
- Verify RLS policies are created
- Check that user is authenticated
- Verify policy conditions match `auth.uid() = user_id`

### "foreign key constraint"
- Ensure `profiles` table exists first
- Check that `user_id` references `auth.users(id)`

## Migration Files

- `supabase/migrations/001_create_pain_records.sql` - Pain tracking table
- `supabase/migrations/002_create_reminder_settings.sql` - Reminder preferences table

Both migrations are idempotent (safe to run multiple times).

