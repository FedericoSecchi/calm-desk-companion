# Reminders Feature Audit & Fixes

## Issues Fixed (Latest Round)

### 1. Timer Persistence ✅
**Problem:** Timer reset to default on page reload, losing progress if app was closed mid-WORK.

**Solution:**
- Implemented localStorage persistence for timer state
- Stores: `phase`, `remainingSeconds`, `lastTickTimestamp`, `isRunning`, `presetId`
- On reload: Computes elapsed time using `Date.now()` diff (not interval ticks)
- If WORK finished while app was closed, automatically transitions to REST phase
- If REST finished while app was closed, transitions back to WORK phase

**Storage Key:** `calmo_reminder_timer_state`

**Technical Details:**
- Timer countdown uses `Date.now()` diff for accuracy, checking every 100ms
- Prevents drift from interval timing issues
- Handles edge cases: timer running when closed, phase transitions while closed

### 2. REST Phase Messaging ✅
**Problem:** REST phase showed incorrect message: "Vuelve al trabajo en 45/60/90 min" (showing WORK duration instead of REST).

**Solution:**
- Fixed message to: "Descanso activo · vuelves al trabajo en 5/10 min"
- Now correctly shows REST duration (5 min for Standard, 10 min for Ligero/Enfoque)

### 3. Preset Range Labels ✅
**Problem:** Preset labels showed ranges (45-60, 30-45, 60-90) but timer used fixed values, causing confusion.

**Solution:**
- Updated Standard preset range from "30-45 min" to "35-45 min" (more accurate)
- Added explicit duration display under each preset: "Duración: X min trabajo / Y min descanso"
- Added code comments explaining that ranges are recommendations, timer uses fixed defaults:
  - Ligero: 60 min work (range: 45-60 min)
  - Standard: 45 min work (range: 35-45 min)
  - Enfoque: 90 min work (range: 60-90 min)

### 4. Preset Selection Logic ✅
**Problem:** Preset selection logic was implicit and could be confusing.

**Solution:**
- Made defaults explicit in code comments
- Preset change always resets to WORK phase
- Preset change clears exercise recommendation state
- Clear documentation of default values

### 5. Streak and Habit Logic ✅
**Problem:** Unclear whether completed REST phases count as habits for streak.

**Solution:**
- Added code comment in Reminders component: "A completed REST counts as a habit for streak calculation"
- Updated `stats.ts` documentation to clarify:
  - Completed breaks from Reminders timer (type="reminder") count as habits
  - Streak includes any activity: breaks, water, or pain records
  - Reminder-triggered breaks are logged to `break_logs` and contribute to streak

### 6. Exercise Recommendation Placeholder ✅
**Problem:** No UI preparation for future exercise recommendations after REST completion.

**Solution:**
- Added calm, optional suggestion card after REST completion
- Copy: "¿Te gustaría hacer un ejercicio rápido?"
- Includes "Tal vez después" dismiss button
- "Ver ejercicios" button is disabled with TODO comment
- Clearly marked as placeholder for future backend/content integration

## Current Behavior

### Timer Flow
1. User selects preset → Timer resets to WORK phase with preset's default duration
2. User starts timer → Counts down using `Date.now()` diff for accuracy
3. Timer state persists to localStorage on every change
4. If app closes mid-WORK:
   - On reload, computes elapsed time
   - If WORK finished, transitions to REST immediately
   - If WORK still running, resumes with correct remaining time
5. WORK completes → Transitions to REST phase, shows notification/sound
6. REST completes → Transitions to WORK, logs break (counts as habit), shows exercise recommendation

### Preset Behavior
- **Ligero**: 60 min work / 10 min rest (range: 45-60 min)
- **Standard**: 45 min work / 5 min rest (range: 35-45 min)
- **Enfoque**: 90 min work / 10 min rest (range: 60-90 min)

### Streak Contribution
- Completed REST phases log to `break_logs` with `type="reminder"`
- These breaks count as valid habits for streak calculation
- Streak continues if at least one activity (break, water, or pain) occurs per day

## Backend Implications (Not Implemented)

### Timer State Persistence (Optional)
**Current:** localStorage only (works in Guest and Auth modes)

**If Needed:**
- Store timer state in Supabase for cross-device sync
- Table: `reminder_timer_state` or extend `reminder_settings`
- Fields: `current_phase`, `remaining_seconds`, `last_tick_timestamp`, `is_running`
- Sync on app open/close, handle conflicts if timer running on multiple devices

**Decision:** Not implemented. localStorage is sufficient for single-device use.

### Exercise Recommendations (Future)
**Current:** UI placeholder only

**If Needed:**
- Backend API or content database for exercise suggestions
- Exercise library with metadata (duration, difficulty, body parts)
- Recommendation algorithm based on user history, time of day, etc.
- Integration with Exercises page/module

**Decision:** Documented as TODO, not implemented.

### Custom Work/Rest Durations (Future Enhancement)
**Current:** Fixed defaults per preset

**If Needed:**
- Allow users to customize work and rest durations within preset ranges
- Store in `reminder_settings`: `custom_work_minutes`, `custom_rest_minutes`
- UI controls to adjust durations

**Decision:** Not implemented. Presets provide good UX without complexity.

## Testing Checklist

- [x] Timer continues accurately after page reload
- [x] REST messaging shows correct duration (5 or 10 min)
- [x] Preset labels match actual behavior
- [x] No dead or misleading UI text remains
- [x] No backend calls introduced
- [x] Build passes
- [x] App remains calm, non-intrusive

## Files Modified

- `src/pages/app/Reminders.tsx` - Timer persistence, messaging fixes, exercise placeholder
- `src/lib/stats.ts` - Updated streak documentation
- `REMINDERS_AUDIT.md` - This audit document

