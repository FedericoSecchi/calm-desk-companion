# Dashboard Stats Audit

## Current State

**File:** `src/pages/app/Dashboard.tsx`

**Current Implementation:**
- All stats are hardcoded mock data in `todayStats` object:
  - `remindersCompleted: 4` (Pausas hoy)
  - `remindersTotal: 8` (not displayed, but used in ratio)
  - `streak: 7` (Días de racha)
  - `lastPainLevel: 3` (Último dolor)
  - `hydrationCount: 5` (Vasos de agua)

**Components:**
- 4 stat cards displayed in a grid
- No data fetching or persistence
- No user interaction to update stats

## Data Model Design

### Tables Required

1. **`water_logs`**
   - Track individual water glass consumption events
   - Fields: `id`, `user_id`, `created_at`
   - One row per glass of water

2. **`break_logs`**
   - Track completed break/reminder events
   - Fields: `id`, `user_id`, `type` (optional: 'reminder', 'exercise', etc.), `created_at`
   - One row per completed break

### Streak Calculation Rule

**Rule:** A day counts toward the streak if the user has:
- Completed at least 1 break, OR
- Logged at least 1 water glass, OR
- Logged at least 1 pain record

**Implementation:**
- Query all three tables for the user
- Group by date (day)
- Count consecutive days from today backwards where at least one activity exists
- Stop counting when a day has no activities

**Example:**
- Today: 1 break, 2 water → counts
- Yesterday: 1 pain record → counts
- Day before: 0 activities → streak stops here
- Result: 2-day streak

### Last Pain Display

- Query `pain_records` table (already exists)
- Get most recent record by `created_at`
- Display: `{intensity}/10 - {area}` or "Sin registros" if none

## Data Storage Strategy

### Authenticated Users
- Store in Supabase tables with RLS
- Tables: `water_logs`, `break_logs`
- Reuse existing `pain_records` table

### Guest Users
- Store in `localStorage` with keys:
  - `calmo_water_logs` (array of ISO date strings)
  - `calmo_break_logs` (array of ISO date strings)
  - `calmo_pain_records` (already handled in Pain.tsx)

## Hooks Architecture

1. **`useWaterLogs.ts`**
   - `addWaterGlass()` - add one glass
   - `getTodayWaterCount()` - count today's glasses
   - `getAllWaterLogs()` - for streak calculation
   - Guest mode: localStorage
   - Auth mode: Supabase

2. **`useBreakLogs.ts`**
   - `logBreak(type?)` - log a completed break
   - `getTodayBreakCount()` - count today's breaks
   - `getAllBreakLogs()` - for streak calculation
   - Guest mode: localStorage
   - Auth mode: Supabase

3. **`useDashboardStats.ts`** (composite hook)
   - Combines water, breaks, pain records
   - Calculates streak
   - Gets last pain
   - Returns: `{ breaksToday, waterToday, streak, lastPain }`

## UI Changes Required

1. **Dashboard Stats Cards**
   - Replace mock data with real computed values
   - Show loading states while fetching
   - Update optimistically on user actions

2. **Quick Actions**
   - Add "+" button on water card to increment
   - Add "+" button on breaks card to log a break
   - Or add buttons in Quick Actions section

## Migration Files

- `supabase/migrations/003_create_water_logs.sql`
- `supabase/migrations/004_create_break_logs.sql`

Both with RLS policies: users can only CRUD their own rows.

