# Focus Timer Architecture

## Overview

The focus timer (work/rest cycles) is now a global, persistent feature that runs independently of page navigation. The timer remains active and visible across all `/app` routes, maintaining focus continuity.

## Architecture

### 1. FocusTimerContext (`src/contexts/FocusTimerContext.tsx`)

**Purpose:** Single source of truth for all timer state and logic.

**Responsibilities:**
- Timer state management (phase, time remaining, running status, preset)
- Timer countdown logic using `Date.now()` diff for accuracy
- Phase transitions (WORK → REST → WORK)
- localStorage persistence
- Notifications and sound on phase transitions
- Break logging when REST completes

**Key Features:**
- Persists to localStorage on every state change
- Computes elapsed time on reload using timestamp diff
- Handles phase transitions if timer finished while app was closed
- Fully automatic cycle continues indefinitely until paused
- Prevents duplicate notifications on reload

**Exports:**
- `useFocusTimer()` hook for accessing timer state and controls
- `presets` array with preset configurations
- `TimerPhase` and `PresetId` types

### 2. FloatingTimer Component (`src/components/FloatingTimer.tsx`)

**Purpose:** Persistent floating UI that shows timer status across all routes.

**Features:**
- Fixed position: bottom-right on desktop, bottom-center on mobile
- Only visible when timer has time remaining (running or paused)
- Shows: phase icon, remaining time, phase label, helper text
- Controls: pause/resume and skip phase buttons
- Clicking navigates to `/app/reminders` for full controls
- Smooth animations on appear/disappear

**Visibility Logic:**
- Shows when `timeRemaining > 0` OR `isRunning === true`
- Hides when `timeRemaining === 0` AND `isRunning === false` (initial state)

### 3. App-Level Integration

**App.tsx:**
- `FocusTimerProvider` wraps `/app` routes
- Provider is inside `ProtectedRoute` so it only loads for authenticated/guest users
- Timer context is available to all `/app` routes

**AppLayout.tsx:**
- `FloatingTimer` component rendered at layout level
- Visible on all `/app` pages when timer is active
- Positioned with `z-50` to appear above content

### 4. Reminders Page Refactor

**Before:** Reminders owned all timer state and logic.

**After:** Reminders is a control/configuration page:
- Uses `useFocusTimer()` to access global timer state
- Provides UI for:
  - Preset selection (Ligero, Standard, Enfoque)
  - Timer controls (start/pause/skip)
  - Sound toggle
  - Notification permission request
  - Exercise recommendations after REST completion

**Key Changes:**
- Removed all timer state management (moved to context)
- Removed timer countdown logic (moved to context)
- Removed phase transition logic (moved to context)
- Kept UI and configuration controls
- Exercise recommendation shown when REST → WORK transition detected

## Data Flow

```
FocusTimerContext (Global State)
    ↓
    ├─→ FloatingTimer (Persistent UI)
    ├─→ Reminders (Control Page)
    └─→ Any /app route (can access timer state)
```

## Persistence Model

**localStorage Key:** `calmo_reminder_timer_state`

**Stored Data:**
```typescript
{
  phase: "work" | "rest",
  remainingSeconds: number,
  lastTickTimestamp: number,
  isRunning: boolean,
  presetId: "light" | "standard" | "focus"
}
```

**On Reload:**
1. Load state from localStorage
2. Compute elapsed time using `Date.now() - lastTickTimestamp`
3. Adjust `remainingSeconds` if timer was running
4. Handle phase transitions if timer finished while closed
5. Resume timer if it was running

## Behavior Guarantees

✅ **Timer continues across route changes**
- Timer state is in context, not component state
- Route navigation does not affect timer execution

✅ **Floating timer visible on all /app pages**
- Rendered at AppLayout level
- Only shows when timer has time remaining

✅ **Fully automatic cycle**
- WORK → REST → WORK continues indefinitely
- User can pause/resume at any time
- Preset changes reset timer to WORK phase

✅ **Notifications and sound**
- Both transitions trigger notifications (if permission granted)
- Both transitions play sound (if enabled)
- Different sound frequencies for distinction (800Hz vs 600Hz)
- Prevents duplicates on reload using timestamp check

✅ **No duplicate timer logic**
- Single source of truth in FocusTimerContext
- Reminders page uses context, doesn't duplicate logic

## Testing Checklist

- [x] Timer continues running when navigating between /app routes
- [x] Floating timer appears on all /app pages when active
- [x] Floating timer hides when timer is at 0 and not running
- [x] Timer controls work from floating timer
- [x] Clicking floating timer navigates to /app/reminders
- [x] Timer persists across page reloads
- [x] Phase transitions work correctly after reload
- [x] Notifications fire on both transitions
- [x] Sound plays on both transitions (if enabled)
- [x] No duplicate notifications on reload
- [x] Preset changes reset timer correctly
- [x] Exercise recommendation shows after REST completion
- [x] Guest mode works correctly
- [x] Build passes without errors

## Files Modified

- `src/contexts/FocusTimerContext.tsx` - New global timer context
- `src/components/FloatingTimer.tsx` - New floating timer UI
- `src/App.tsx` - Added FocusTimerProvider wrapper
- `src/layouts/AppLayout.tsx` - Added FloatingTimer component
- `src/pages/app/Reminders.tsx` - Refactored to use global context

## Backend Implications

**None.** All timer functionality is frontend-only:
- Timer state in localStorage (works in Guest and Auth modes)
- Notifications use browser Notification API
- Sound uses Web Audio API
- No database tables or API endpoints needed

## Future Enhancements (Optional)

1. **Cross-Device Sync:** Store timer state in Supabase for multi-device support
2. **Timer Statistics:** Track completion rates, average cycle times
3. **Custom Durations:** Allow users to customize work/rest durations
4. **Background Notifications:** Service Worker for notifications when app is closed

All documented in `BACKEND_TODO.md` - not implemented yet.

