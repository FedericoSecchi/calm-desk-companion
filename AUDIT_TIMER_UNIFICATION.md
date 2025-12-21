# Timer Unification Audit

## Overview

This document describes the unification of the Reminders timer into a global persistent timer with floating draggable UI. The timer now persists across route changes and continues running independently of page lifecycle.

## Architecture

### Single Source of Truth: `FocusTimerContext`

All timer state and logic is managed by `FocusTimerContext` (`src/contexts/FocusTimerContext.tsx`), which provides:

- **State Management**: Timer phase, remaining time, running status, preset, sound settings
- **Persistence**: Automatic localStorage sync for timer state
- **Phase Transitions**: Automatic WORK → REST → WORK cycle
- **Notifications & Sound**: Browser notifications and audio cues on phase transitions
- **Countdown Alerts**: Subtle alerts at 10, 5, 3, 2, 1 seconds before phase completion
- **Break Logging**: Automatically logs completed breaks for streak calculation

### Component Structure

```
App.tsx
└── FocusTimerProvider (wraps /app routes)
    ├── AppLayout
    │   ├── Reminders (control panel)
    │   ├── Dashboard
    │   ├── Exercises
    │   ├── Pain
    │   ├── Settings
    │   └── FloatingTimer (persistent UI)
    └── Other /app routes
```

### Key Components

#### 1. `FocusTimerContext` (`src/contexts/FocusTimerContext.tsx`)

**Responsibilities:**
- Manages all timer state (phase, time, running status, preset, sound)
- Handles timer countdown logic using `Date.now()` diff for accuracy
- Manages phase transitions (WORK → REST → WORK)
- Triggers notifications and sound cues
- Persists state to localStorage
- Syncs with database settings (preset, sound_enabled)
- Logs breaks automatically on REST completion

**Key Features:**
- Timer continues running when navigating away from `/app/reminders`
- State persists across page reloads
- Accurate time calculation even if app is closed mid-timer
- Automatic phase transitions with notifications
- Countdown alerts at 10, 5, 3, 2, 1 seconds

**Exposed API:**
```typescript
{
  // State
  currentPhase: "work" | "rest"
  timeRemaining: number // seconds
  isRunning: boolean
  selectedPreset: "light" | "standard" | "focus"
  soundEnabled: boolean
  lastRestCompletion: number // timestamp for exercise recommendation
  
  // Actions
  startTimer: () => void
  pauseTimer: () => void
  toggleTimer: () => void
  skipToNextPhase: () => void
  setPreset: (preset) => Promise<void>
  setSoundEnabled: (enabled) => Promise<void>
  
  // Helpers
  getPresetConfig: (presetId) => PresetConfig
  formatTime: (seconds) => string
}
```

#### 2. `Reminders` (`src/pages/app/Reminders.tsx`)

**Responsibilities:**
- Control panel for timer configuration
- Displays timer UI (large display with controls)
- Preset selection
- Sound toggle
- Notification permission request
- Exercise recommendation after REST completion

**Changes Made:**
- Removed all local timer state management
- Removed timer countdown logic
- Removed phase transition logic
- Removed notification/sound logic
- Now consumes `useFocusTimer()` hook for all timer state and actions
- UI and UX remain **identical** to previous version
- Exercise recommendation uses `lastRestCompletion` from context

**Preserved Features:**
- All original texts and labels
- All original UI layout and styling
- All original preset configurations
- All original button behaviors
- Exercise recommendation timing logic

#### 3. `FloatingTimer` (`src/components/FloatingTimer.tsx`)

**Responsibilities:**
- Persistent floating timer UI visible across `/app` routes
- Draggable position (persists to localStorage)
- Quick controls (pause/resume, skip phase)
- Navigation to `/app/reminders` on click

**Visibility Rules:**
- Hidden on `/app/reminders` (full timer UI is there)
- Hidden when timer is not active (`timeRemaining === 0 && !isRunning`)
- Visible on other `/app` routes when timer is active

**Features:**
- Draggable with mouse and touch
- Position persists during session
- Default position: bottom-right
- Visual feedback during drag (scale, shadow)
- Grip icon indicates draggability

## Data Flow

### Timer State Persistence

1. **localStorage Key**: `calmo_reminder_timer_state`
2. **Stored Data**:
   ```typescript
   {
     phase: "work" | "rest"
     remainingSeconds: number
     lastTickTimestamp: number
     isRunning: boolean
     presetId: "light" | "standard" | "focus"
   }
   ```
3. **Sync Behavior**: State is saved to localStorage whenever any timer state changes
4. **Recovery**: On app reload, elapsed time is calculated using `Date.now()` diff

### Phase Transitions

1. **WORK → REST**:
   - When WORK timer reaches 0
   - Automatically switches to REST phase
   - Sets REST duration based on preset
   - Triggers notification + sound
   - Automatically starts REST timer after 500ms

2. **REST → WORK**:
   - When REST timer reaches 0
   - Automatically switches to WORK phase
   - Sets WORK duration based on preset
   - Logs break (for streak calculation)
   - Records `lastRestCompletion` timestamp
   - Triggers notification + sound
   - Automatically starts WORK timer after 500ms
   - Shows exercise recommendation in Reminders page

### Navigation Persistence

- Timer state is stored in React Context (provider at App level)
- Context persists across route changes
- Timer continues running when navigating away from `/app/reminders`
- FloatingTimer appears on other routes when timer is active
- No timer reset on navigation

## Key Decisions

### 1. Single Source of Truth

**Decision**: All timer logic in `FocusTimerContext`, no duplication.

**Rationale**:
- Prevents state synchronization issues
- Ensures consistent behavior across components
- Simplifies debugging and maintenance
- Single localStorage key prevents conflicts

### 2. Preserved Reminders UX

**Decision**: Reminders page UI/UX remains identical to previous version.

**Rationale**:
- User familiarity and muscle memory
- No learning curve for existing users
- Maintains all original functionality
- Only internal implementation changed

### 3. FloatingTimer Visibility

**Decision**: Hidden on `/app/reminders`, visible on other routes when active.

**Rationale**:
- Avoids duplicate timer UI on same page
- Provides continuity when navigating away
- Non-intrusive when user is actively managing timer

### 4. Countdown Alerts

**Decision**: Added subtle alerts at 10, 5, 3, 2, 1 seconds (from previous FloatingTimer implementation).

**Rationale**:
- Improves user awareness of upcoming transitions
- Subtle enough not to be disruptive
- Only shown in final seconds (1-3) as toasts
- Sound cues are very subtle

### 5. Exercise Recommendation

**Decision**: Show exercise recommendation after REST completion using `lastRestCompletion` timestamp.

**Rationale**:
- Encourages movement after breaks
- Only shown when relevant (just after REST)
- Uses timestamp to avoid stale recommendations
- Can be dismissed or navigated to Exercises

## Testing Checklist

- [x] Timer continues running when navigating away from `/app/reminders`
- [x] Timer persists across page reloads
- [x] FloatingTimer appears on other routes when timer is active
- [x] FloatingTimer is hidden on `/app/reminders`
- [x] FloatingTimer is draggable and position persists
- [x] Reminders page UI is identical to previous version
- [x] Preset buttons work correctly
- [x] Sound toggle works correctly
- [x] Phase transitions work automatically
- [x] Notifications and sound trigger on phase transitions
- [x] Countdown alerts work at 10, 5, 3, 2, 1 seconds
- [x] Exercise recommendation appears after REST completion
- [x] Break logging works for streak calculation
- [x] Timer doesn't reset on navigation
- [x] Build passes without errors

## Migration Notes

### What Changed

1. **Reminders.tsx**:
   - Removed ~300 lines of timer logic
   - Now consumes `useFocusTimer()` hook
   - UI/UX remains identical

2. **FocusTimerContext.tsx**:
   - Added `lastRestCompletion` state
   - Enhanced `setPreset` to handle timer reset and error recovery
   - Already had all timer logic from previous implementation

3. **FloatingTimer.tsx**:
   - Already using context correctly
   - No changes needed

### What Stayed the Same

- All UI/UX in Reminders page
- All preset configurations
- All texts and labels
- All button behaviors
- Timer persistence mechanism
- Phase transition logic
- Notification and sound behavior

## Future Improvements

1. **Backend Sync**: Sync timer state to Supabase for multi-device support
2. **Timer History**: Track completed work/rest cycles for analytics
3. **Custom Presets**: Allow users to create custom presets
4. **Timer Statistics**: Show daily/weekly timer usage
5. **Pause Reasons**: Track why timer was paused (manual, break, etc.)

## Conclusion

The timer unification successfully:
- ✅ Creates a single source of truth for timer state
- ✅ Ensures timer persists across navigation
- ✅ Provides floating draggable UI for continuity
- ✅ Preserves all Reminders page UX
- ✅ Maintains all existing functionality
- ✅ Improves code maintainability
- ✅ Eliminates state synchronization issues

The implementation is production-ready and maintains backward compatibility with existing user workflows.

