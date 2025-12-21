# Backend Requirements for Reminders Feature

This document lists backend requirements discovered during frontend implementation. These are **NOT implemented yet** and should be added when backend persistence is needed.

## Current Frontend Implementation

The Reminders feature currently works with:
- **Guest mode**: All state is local (timer state, preset selection, sound preferences)
- **Auth mode**: Preset and sound preferences are persisted via `reminder_settings` table
- **Timer state**: Always starts fresh on page load (not persisted)

## Backend Requirements

### 1. Timer State Persistence (Optional)

**Current Behavior:** Timer resets to work phase on page refresh.

**If Needed:**
- Store current timer state (phase, time remaining, is running)
- Table: `reminder_timer_state` or extend `reminder_settings`
- Fields:
  - `current_phase` (work | rest)
  - `time_remaining_seconds` (integer)
  - `is_running` (boolean)
  - `last_updated` (timestamp)

**Decision:** Not implemented. Timer state is ephemeral by design - users start fresh each session.

### 2. Reminder History/Logs

**Current Behavior:** Breaks are logged via `break_logs` table when REST phase completes.

**Status:** ✅ Already implemented via `break_logs` table.

### 3. Custom Work/Rest Durations (Future Enhancement)

**Current Behavior:** Users can only select presets (Ligero, Standard, Enfoque).

**If Needed:**
- Allow users to customize work and rest durations
- Add fields to `reminder_settings`:
  - `custom_work_minutes` (integer, nullable)
  - `custom_rest_minutes` (integer, nullable)
- If custom values exist, use them instead of preset defaults

**Decision:** Not implemented. Presets provide good UX without complexity.

### 4. Notification Scheduling (Background)

**Current Behavior:** Notifications only fire when app is open and timer completes.

**If Needed:**
- Schedule notifications in background (Service Worker)
- Store scheduled notification times
- Requires Service Worker implementation
- Browser limitations: Notifications may not work reliably in background on all platforms

**Decision:** Not implemented. Current in-app notifications are sufficient for MVP.

### 5. Reminder Statistics

**Current Behavior:** Break logs are tracked but not aggregated for reminders page.

**If Needed:**
- Aggregate break logs by reminder type
- Show completion rate, average intervals
- Could reuse existing `break_logs` table with queries

**Decision:** Not implemented. Dashboard stats already show break counts.

## Summary

**Implemented:**
- ✅ Preset selection persistence (`reminder_settings.preset`)
- ✅ Sound preference persistence (`reminder_settings.sound_enabled`)
- ✅ Break logging (`break_logs` table)
- ✅ Timer state persistence (localStorage, works in Guest and Auth modes)

**Not Implemented (By Design):**
- ❌ Timer state persistence in Supabase (localStorage sufficient for single-device)
- ❌ Custom durations (presets are sufficient)
- ❌ Background notification scheduling (in-app only)
- ❌ Reminder-specific statistics (dashboard stats cover this)
- ❌ Exercise recommendation backend (UI placeholder exists, backend TODO)

## Updated Requirements (Latest Round)

### Timer State Persistence (localStorage)
**Status:** ✅ Implemented in localStorage

**Current Behavior:**
- Timer state persists to localStorage on every change
- On reload, computes elapsed time using `Date.now()` diff
- Handles phase transitions if timer finished while app was closed
- Works in both Guest and Auth modes

**If Cross-Device Sync Needed:**
- Store timer state in Supabase `reminder_timer_state` table
- Sync on app open/close
- Handle conflicts if timer running on multiple devices
- Fields: `current_phase`, `remaining_seconds`, `last_tick_timestamp`, `is_running`, `preset_id`

### Exercise Recommendations
**Status:** UI placeholder exists, backend TODO

**Current Behavior:**
- Calm suggestion card appears after REST completion
- "Ver ejercicios" button disabled with TODO comment
- User can dismiss with "Tal vez después"

**If Needed:**
- Backend API or content database for exercise suggestions
- Exercise library with metadata (duration, difficulty, body parts)
- Recommendation algorithm (user history, time of day, etc.)
- Integration with Exercises page/module

## Migration Notes

If any of these features are needed later:
1. Review this document
2. Create new migration files
3. Update `useReminderSettings` hook
4. Update UI to support new features

