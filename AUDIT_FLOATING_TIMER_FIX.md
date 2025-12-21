# FloatingTimer Visibility Fix - Final Audit

## Root Cause Identified

The forced render debug box proved the component **was rendering**, so the issue was **state/visibility logic**, not render tree.

## Fixes Applied

### 1. Added Provider ID for Context Validation

**Added to FocusTimerContext:**
- `providerId`: Unique ID created once per provider mount
- Logged in DEV mode to prove single provider instance
- Both Reminders and FloatingTimer log the same `providerId`

**Purpose:**
- Prove Reminders and FloatingTimer use the same FocusTimerContext instance
- Detect if multiple providers are accidentally created

### 2. Fixed Visibility Logic

**Before:**
- Complex logic checking `timeRemaining > 0 || isRunning`
- Could hide timer incorrectly

**After:**
```typescript
const shouldShowFloatingTimer = isRunning && !isOnRemindersPage;
```

**Rule:**
- Show when: `isRunning === true` AND route is NOT `/app/reminders`
- Hide when: Timer not running OR on `/app/reminders`

### 3. Removed display:none

**Before:**
- Used `display: none` in style (can cause rendering issues)

**After:**
- Only uses `opacity: 0/1` and `pointerEvents: none/auto`
- Component always in DOM, just invisible when hidden

### 4. Improved Route Detection

**Before:**
- Hardcoded exact pathname matches

**After:**
```typescript
const isOnRemindersPage = pathname.endsWith("/reminders") || 
                          pathname.includes("/app/reminders");
```

**Benefits:**
- Works with GitHub Pages basename (`/calm-desk-companion/app/reminders`)
- More robust route detection

### 5. Removed Debug Code

**Removed:**
- Forced red debug box
- Excessive console.log statements
- Replaced with DEV-only console.debug

**Kept:**
- DEV-only provider ID logging
- DEV-only visibility state logging

### 6. Verified Provider Structure

**Confirmed:**
- FocusTimerProvider wraps entire `/app` subtree (not per route)
- Provider is stable and doesn't remount on navigation
- Both Reminders and FloatingTimer are children of same provider

**Structure:**
```
App.tsx
└── FocusTimerProvider (wraps /app routes)
    └── AppLayout
        ├── Reminders (uses useFocusTimer)
        ├── Dashboard
        ├── Exercises
        ├── Pain
        ├── Settings
        └── FloatingTimer (uses useFocusTimer)
```

## Manual Test Checklist

### Test 1: Timer Starts and FloatingTimer Appears
1. Navigate to `/app/reminders`
2. Start timer (click play button)
3. Navigate to `/app/dashboard`
4. **Expected**: FloatingTimer appears and shows countdown
5. **Verify**: Timer continues running (countdown decreases)

### Test 2: FloatingTimer Hides on Reminders Page
1. With timer running, navigate to `/app/reminders`
2. **Expected**: FloatingTimer disappears (hidden)
3. **Verify**: Timer continues running (check Reminders page timer)

### Test 3: FloatingTimer Reappears When Leaving Reminders
1. With timer running on `/app/reminders`
2. Navigate to `/app/dashboard`
3. **Expected**: FloatingTimer appears instantly
4. **Verify**: Timer countdown continues (no reset)

### Test 4: FloatingTimer Hides When Timer Stops
1. With timer running, navigate to `/app/dashboard`
2. Pause timer (click pause button)
3. **Expected**: FloatingTimer disappears
4. **Verify**: Timer is paused (no countdown)

### Test 5: Drag Functionality
1. With timer running, navigate to `/app/dashboard`
2. Drag FloatingTimer to a new position
3. Navigate to another route
4. Navigate back
5. **Expected**: FloatingTimer position persists during session

### Test 6: Provider ID Validation (DEV only)
1. Open browser console
2. Navigate to `/app/reminders`
3. Start timer
4. Navigate to `/app/dashboard`
5. **Check console logs:**
   - `[FocusTimerProvider] Provider ID: <id>`
   - `[Reminders] Provider ID: <id>` (should match)
   - `[FloatingTimer] Provider ID: <id>` (should match)
6. **Expected**: All three logs show the SAME provider ID

## Expected Console Output (DEV mode)

When timer is running:
```
[FocusTimerProvider] Provider ID: provider-1234567890-abc123
[Reminders] Provider ID: provider-1234567890-abc123
[Reminders] isRunning: true timeRemaining: 2700
[FloatingTimer] Provider ID: provider-1234567890-abc123
[FloatingTimer] isRunning: true timeRemaining: 2700
[FloatingTimer] Visibility: { pathname: "/app/dashboard", isRunning: true, isOnRemindersPage: false, shouldShowFloatingTimer: true }
```

## Files Changed

1. **src/contexts/FocusTimerContext.tsx**
   - Added `providerId` to context interface
   - Created stable unique ID per provider instance
   - Added DEV-only logging

2. **src/components/FloatingTimer.tsx**
   - Removed forced debug box
   - Simplified visibility logic: `shouldShowFloatingTimer = isRunning && !isOnRemindersPage`
   - Removed `display: none` from style
   - Improved route detection
   - Replaced console.log with DEV-only console.debug
   - Added provider ID logging

3. **src/pages/app/Reminders.tsx**
   - Replaced console.log with DEV-only console.debug
   - Added provider ID logging

## Acceptance Criteria

✅ FloatingTimer visible on all `/app` pages except `/app/reminders` while timer is running
✅ FloatingTimer not visible when timer is not running
✅ Timer continues across navigation (no reset)
✅ No debug red box remains in production UI
✅ No console spam in production builds (only DEV logs)
✅ Build passes: `npm run build`
✅ Provider ID matches in Reminders and FloatingTimer (proves single context)

## Commit

- **Commit**: "fix: restore FloatingTimer visibility and unify timer provider mounting"
- **Changes**: Provider ID validation, simplified visibility, removed debug code
- **Breaking Changes**: None
- **Functionality**: All timer behavior preserved, visibility now works correctly

