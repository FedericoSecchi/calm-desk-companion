# Exercise Engine Implementation Audit

## Overview

This document describes the implementation of a reusable, step-based exercise engine with timers, notifications, and optional relaxation music, integrated with the existing FocusTimer REST phase.

## What Was Implemented

### 1. Exercise Data Model (`src/lib/exerciseTypes.ts`)

**Types Defined:**
- `ExerciseStepType`: `"posture" | "movement" | "breathing" | "pause"`
- `ExerciseStep`: Individual step with instruction text, duration, type, and notification flags
- `Exercise`: Complete exercise with name, target duration, pre-alert, music support, and steps
- `ExerciseState`: Runtime state tracking current step, time remaining, playing/paused status

**Design Decisions:**
- Steps are explicitly defined with durations (not inferred)
- Each step can independently trigger notifications on start/end
- Exercise has a `targetDurationSeconds` that may differ from sum of step durations (allows flexibility)
- `preAlert` is shown before exercise starts (safety/disclaimer)

### 2. Exercise Library (`src/lib/exercises.ts`)

**Sample Exercises:**
- `neck-rotation`: 2-minute neck rotation exercise (9 steps)
- `shoulder-stretch`: 3-minute shoulder stretch (5 steps)
- `wrist-stretch`: 2-minute wrist stretch (6 steps)
- `lumbar-flex`: 2-minute lumbar flexion (6 steps)

**Design Decisions:**
- Exercises are defined in code (phase 1)
- Easy to extend with more exercises
- Each exercise has realistic step durations and clear instructions
- All exercises support music (`supportsMusic: true`)

### 3. ExercisePlayer Component (`src/components/ExercisePlayer.tsx`)

**Features:**
- **Pre-alert screen**: Shows `preAlert` message and requires user confirmation before starting
- **Step-based timer**: Each step has its own countdown timer
- **Dual progress tracking**: Shows both current step time and total exercise time
- **Pause/Resume**: User can pause at any time
- **Skip step**: User can skip current step and move to next
- **Step notifications**: Subtle sound (600Hz sine wave) when steps start (if `notifyOnStart: true`)
- **Exercise completion**: Soft sound (500Hz) and toast notification when exercise ends
- **Music toggle**: UI button for music (state tracked, actual audio playback not implemented in phase 1)
- **Non-blocking**: Exercise runs in parallel with REST phase timer (does not pause it)

**Timer Implementation:**
- Uses `Date.now()` diff for accuracy (same approach as FocusTimer)
- 100ms interval for smooth countdown updates
- Prevents double-triggering of step completion using ref
- Automatically advances to next step when current step completes
- Stops when `targetDurationSeconds` is reached

**UI Design:**
- Calm, minimal interface
- Large, readable typography
- Progress bars for step and total time
- Mobile-first responsive layout
- No aggressive colors or flashing animations

### 4. Integration with Exercises Page (`src/pages/app/Exercises.tsx`)

**Changes:**
- Added `ExercisePlayer` component import
- Mapped old exercise IDs to new engine IDs (`exerciseIdMap`)
- Updated exercise display interface to include `engineId`
- Replaced "Completado" button with "Empezar ejercicio" button
- Button triggers `ExercisePlayer` with selected exercise
- Exercise completion marks exercise as completed in UI

**Design Decisions:**
- Backward compatible: old exercise IDs still work via mapping
- Exercises page shows all exercises, user selects one to play
- Exercise completion is tracked locally (not persisted to backend in phase 1)

### 5. REST Phase Exercise Suggestion (`src/pages/app/Reminders.tsx`)

**Integration:**
- Exercise recommendation card appears after REST phase completes
- Button changed from "Ver ejercicios" to "Empezar ejercicio"
- Clicking button starts `neck-rotation` exercise directly (2-minute quick exercise)
- Exercise runs in parallel with REST phase (REST timer continues)
- User can close exercise at any time and return to REST phase

**Design Decisions:**
- Suggests a quick exercise (neck rotation - 2 min) that fits well in REST phase
- Non-blocking: user can dismiss or start exercise
- Exercise completion returns user to REST phase automatically
- REST phase timer never stops (exercise is parallel activity)

### 6. Notifications and Sounds

**Step Start Sound:**
- 600Hz sine wave, 0.3s duration
- Volume: 0.2 → 0.01 (exponential fade)
- Only plays if `notifyOnStart: true` on step

**Exercise End Sound:**
- 500Hz sine wave, 0.3s duration
- Same volume fade
- Plays when exercise completes

**Toast Notifications:**
- Pre-alert shown as toast when exercise player opens
- Exercise completion shows "Buen trabajo" toast with "Volvemos al descanso" message

**Design Decisions:**
- Subtle, calm sounds (not aggressive)
- No countdown spam (only on step start, not every second)
- Sounds fail gracefully if AudioContext not available

### 7. Music Support (Phase 1 - State Only)

**Current Implementation:**
- Music toggle button in UI
- State tracked (`musicPlaying: boolean`)
- Actual audio playback not implemented (marked with TODO comment)

**Design Decisions:**
- Music support is part of the engine architecture
- UI ready for music integration
- In phase 2, would load and play local relaxation loop audio file
- Music auto-stops when exercise ends (cleanup in useEffect)

## What Was Intentionally Left Out (Phase 1)

### 1. Pain-Based Recommendations
- No logic to suggest exercises based on pain records
- All exercises are available equally
- **Extension Point**: `getExerciseById()` could be replaced with `getRecommendedExercise(userPainHistory)`

### 2. Exercise Rotation Intelligence
- No tracking of which exercises user has done recently
- No logic to avoid suggesting same exercise repeatedly
- **Extension Point**: Add `lastCompletedExercises` state and filter logic

### 3. Daily Personalization
- No time-of-day based recommendations
- No user preference learning
- **Extension Point**: Add recommendation algorithm in `Reminders.tsx` suggestion logic

### 4. Spotify Integration
- No external music services
- Music is local-only (when implemented)
- **Extension Point**: Add Spotify SDK integration in `toggleMusic()` function

### 5. Exercise Performance Scoring
- No tracking of completion rates
- No difficulty adjustment
- **Extension Point**: Add completion tracking and analytics

### 6. Backend Persistence
- Exercise completion not saved to Supabase
- No exercise history
- **Extension Point**: Add `exercise_completions` table and sync logic

### 7. Actual Music Playback
- Music state is tracked but audio file not loaded
- **Extension Point**: Add `<audio>` element or Web Audio API for local relaxation loop

## Extension Points for Phase 2

### 1. Recommendation Engine
**Location**: `src/pages/app/Reminders.tsx` (exercise suggestion logic)

**What to add:**
```typescript
// Replace hardcoded "neck-rotation" with:
const recommendedExercise = getRecommendedExercise({
  userPainHistory,
  lastCompletedExercises,
  timeOfDay,
  userPreferences
});
```

### 2. Exercise Library Expansion
**Location**: `src/lib/exercises.ts`

**What to add:**
- More exercises (back, legs, full body)
- Exercise difficulty levels
- Exercise categories/tags
- Load from backend API instead of hardcoded

### 3. Music Playback
**Location**: `src/components/ExercisePlayer.tsx` (`toggleMusic` function)

**What to add:**
```typescript
// Load and play local audio file
const audio = new Audio('/audio/relaxation-loop.mp3');
audio.loop = true;
audio.volume = 0.3;
audio.play();
```

### 4. Exercise Analytics
**Location**: New hook `src/hooks/useExerciseCompletions.ts`

**What to add:**
- Track exercise completions
- Calculate completion rates
- Store in Supabase `exercise_completions` table

### 5. Smart Exercise Selection
**Location**: `src/pages/app/Exercises.tsx` (exercise grid)

**What to add:**
- Highlight recommended exercises
- Show "Recently completed" badge
- Filter by difficulty, duration, body area

## UX Decisions

### 1. Non-Blocking Design
- Exercise never blocks REST phase timer
- User can always close exercise and return
- Exercise is optional, not required

### 2. Calm, Minimal UI
- No aggressive colors (uses primary/secondary)
- No flashing countdowns
- Large, readable text
- Progress bars are subtle

### 3. Clear Feedback
- Pre-alert shown before starting
- Step instructions are clear and concise
- Time remaining always visible
- Completion toast confirms success

### 4. User Control
- Can pause at any time
- Can skip steps
- Can close exercise early
- Can dismiss REST phase suggestion

### 5. Parallel Operation
- Exercise runs alongside REST timer
- No interference between timers
- Both can run simultaneously
- Exercise completion doesn't affect REST phase

## Technical Architecture

### Component Hierarchy
```
AppLayout
  └─ Reminders (or Exercises)
      └─ ExercisePlayer (when active)
          └─ Timer logic (isolated from FocusTimer)
```

### State Management
- Exercise state is local to `ExercisePlayer` component
- No global context needed (exercise is temporary)
- Exercise completion tracked in parent component (Exercises page)

### Timer Isolation
- Exercise timer uses separate `intervalRef` from FocusTimer
- No shared state between timers
- Both use `Date.now()` diff for accuracy

### Error Handling
- Audio context failures are silent (graceful degradation)
- Missing exercises show warning in DEV mode
- Exercise completion always calls `onComplete` callback

## Testing Checklist

- [x] Exercise starts after pre-alert confirmation
- [x] Step timer counts down correctly
- [x] Step advances automatically when time reaches 0
- [x] Total time counts down correctly
- [x] Pause/resume works
- [x] Skip step works
- [x] Exercise completes when target duration reached
- [x] Exercise can be closed early
- [x] REST phase timer continues during exercise
- [x] Exercise suggestion appears after REST completion
- [x] Exercise suggestion starts exercise directly
- [x] Sounds play on step start (if enabled)
- [x] Toast shows on exercise completion
- [x] Build passes
- [x] No linter errors

## Files Created/Modified

### Created:
- `src/lib/exerciseTypes.ts` - Type definitions
- `src/lib/exercises.ts` - Exercise library
- `src/components/ExercisePlayer.tsx` - Main exercise engine component
- `EXERCISE_ENGINE_AUDIT.md` - This document

### Modified:
- `src/pages/app/Exercises.tsx` - Integrated ExercisePlayer
- `src/pages/app/Reminders.tsx` - Added REST phase exercise suggestion

## Commit History

All changes committed with clear, atomic commits:
- `feat: add exercise engine types and data model`
- `feat: implement ExercisePlayer component with step-based timer`
- `feat: integrate ExercisePlayer with Exercises page`
- `feat: add REST phase exercise suggestion`
- `docs: document exercise engine in EXERCISE_ENGINE_AUDIT.md`

## Notes

- Music playback is stubbed (state only) - ready for phase 2 implementation
- Exercise library is hardcoded - ready for backend integration in phase 2
- No exercise analytics - ready for phase 2 tracking
- All exercises are equally available - ready for recommendation logic in phase 2

