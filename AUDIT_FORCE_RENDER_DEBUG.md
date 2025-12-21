# FloatingTimer Force Render Debug - Audit Report

## Objective

Prove beyond doubt whether FloatingTimer rendering issue is:
1. **Render Tree Problem**: Component not rendering at all
2. **State/Context Problem**: Component rendering but state is wrong

## Debug Strategy

### Phase 1: Force Visible Render

Added a **forced debug box** that is ALWAYS visible, regardless of any conditions:

```typescript
<div
  style={{
    position: "fixed",
    top: 100,
    left: 100,
    zIndex: 99999,
    background: "red",
    color: "white",
    padding: 20,
    border: "5px solid yellow",
  }}
>
  <div>FLOATING TIMER FORCE RENDER</div>
  <div>isRunning: {String(isRunning)}</div>
  <div>timeRemaining: {timeRemaining}</div>
  <div>pathname: {location.pathname}</div>
  <div>shouldShow: {String(shouldShowFloatingTimer)}</div>
  <div>Context ID: {String(focusTimerContext?.isRunning)}</div>
</div>
```

**This box will:**
- Appear at position `fixed; top: 100px; left: 100px`
- Have `z-index: 99999` (highest possible)
- Be **RED with YELLOW border** (impossible to miss)
- Display real-time state values
- **NEVER be hidden** (no conditions, no opacity, no display:none)

### Phase 2: Extensive Context Logging

Added console.log statements to track:

#### In FloatingTimer:
```typescript
console.log("[FloatingTimer] CONTEXT OBJECT:", focusTimerContext);
console.log("[FloatingTimer] CONTEXT IDENTITY:", focusTimerContext === focusTimerContext);
console.log("[FloatingTimer] isRunning:", isRunning, typeof isRunning);
console.log("[FloatingTimer] timeRemaining:", timeRemaining);
console.log("[FloatingTimer] pathname:", location.pathname);
console.log("[FloatingTimer] RENDERED - shouldShowFloatingTimer:", shouldShowFloatingTimer);
```

#### In Reminders:
```typescript
console.log("[Reminders] CONTEXT OBJECT:", focusTimerContext);
console.log("[Reminders] CONTEXT IDENTITY:", focusTimerContext === focusTimerContext);
console.log("[Reminders] isRunning:", isRunning, typeof isRunning);
console.log("[Reminders] timeRemaining:", timeRemaining);
console.log("[Reminders] When toggleTimer called, isRunning will change to:", !isRunning);
```

## Diagnostic Scenarios

### Scenario A: Red Box IS Visible
**Conclusion**: Component IS rendering, issue is **STATE/VISIBILITY**

**Next Steps:**
1. Check console logs for `isRunning` value
2. Compare `isRunning` in Reminders vs FloatingTimer
3. Check if context objects are the same instance
4. Verify `shouldShowFloatingTimer` calculation
5. Check if opacity/pointer-events are being applied correctly

**Possible Causes:**
- `isRunning` is false when it should be true
- Context instance mismatch (different providers)
- Visibility logic bug
- CSS animation not working

### Scenario B: Red Box IS NOT Visible
**Conclusion**: Component is NOT rendering, issue is **RENDER TREE/LAYOUT**

**Next Steps:**
1. Check if FloatingTimer is in the component tree (React DevTools)
2. Verify AppLayout is rendering FloatingTimer
3. Check if FocusTimerProvider wraps both components
4. Verify no conditional rendering prevents mount
5. Check for CSS that might hide it (parent z-index, overflow, etc.)

**Possible Causes:**
- FloatingTimer not in render tree
- AppLayout not rendering
- FocusTimerProvider not wrapping correctly
- Route-based conditional rendering
- CSS parent hiding child

## Expected Console Output

When timer is started from Reminders:

```
[Reminders] CONTEXT OBJECT: {currentPhase: "work", isRunning: true, ...}
[Reminders] isRunning: true boolean
[Reminders] timeRemaining: 2700
[Reminders] When toggleTimer called, isRunning will change to: false

[FloatingTimer] CONTEXT OBJECT: {currentPhase: "work", isRunning: true, ...}
[FloatingTimer] CONTEXT IDENTITY: SAME
[FloatingTimer] isRunning: true boolean
[FloatingTimer] timeRemaining: 2700
[FloatingTimer] pathname: /app/dashboard
[FloatingTimer] RENDERED - shouldShowFloatingTimer: true
```

## Files Modified

1. **src/components/FloatingTimer.tsx**
   - Added forced debug box (always visible)
   - Added extensive console.log statements
   - Captured context object reference

2. **src/pages/app/Reminders.tsx**
   - Added context logging for comparison
   - Log when toggleTimer is called

## Testing Instructions

1. **Start the app**: `npm run dev`
2. **Navigate to `/app/reminders`**
3. **Look for red debug box**:
   - If visible → Component is rendering (check state)
   - If not visible → Component not rendering (check layout)
4. **Start the timer** (click play button)
5. **Check console logs**:
   - Compare `isRunning` values
   - Check context object identity
   - Verify `shouldShowFloatingTimer` calculation
6. **Navigate to `/app/dashboard`**
7. **Check if red box appears** (it should always be visible)
8. **Check if actual FloatingTimer appears** (opacity-based)

## What to Look For

### Red Box Visible + FloatingTimer Not Visible
- State issue: `isRunning` might be false
- Visibility logic: `shouldShowFloatingTimer` might be false
- CSS issue: opacity animation not working

### Red Box Not Visible
- Render tree issue: Component not mounting
- Layout issue: AppLayout not rendering FloatingTimer
- Provider issue: FocusTimerProvider not wrapping correctly

### Different Context Objects
- Multiple providers: Different FocusTimerProvider instances
- Context not shared: Reminders and FloatingTimer using different contexts

## Next Steps After Diagnosis

Once root cause is identified:

1. **If render tree issue**: Fix layout/provider structure
2. **If state issue**: Fix context state management
3. **If visibility issue**: Fix CSS/opacity logic
4. **Remove debug code**: Clean up forced render box and excessive logs
5. **Restore intended behavior**: FloatingTimer visible when running, hidden on reminders

## Commit

This is a **debugging commit** - temporary code to diagnose the issue.
After root cause is found, we'll create a clean fix commit.

