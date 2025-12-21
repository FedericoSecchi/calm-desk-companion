# React Hooks Order Fix - Audit Report

## Problem

The app was crashing with the error: **"Rendered fewer hooks than expected"**

This is a critical React error that occurs when hooks are called conditionally or in different orders between renders, violating the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks).

## Root Cause

The bug was in `src/components/FloatingTimer.tsx`. The component had an **early return** placed **after** some hooks but **before** other hooks:

### Before (Broken):
```typescript
export const FloatingTimer = () => {
  // ✅ Hooks called first
  const { ... } = useFocusTimer();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ❌ EARLY RETURN BEFORE MORE HOOKS
  if (isOnRemindersPage || !isTimerActive) {
    return null;
  }
  
  // ❌ These hooks were only called if early return didn't happen
  const [isDragging, setIsDragging] = useState(false);
  const [hasCustomPosition, setHasCustomPosition] = useState(false);
  const x = useMotionValue(...);
  const y = useMotionValue(...);
  useEffect(() => { ... }, []);
}
```

**Why this breaks:**
- When the component rendered on `/app/reminders` or when timer was inactive, it would return early
- This meant `useState`, `useMotionValue`, and `useEffect` were **not called**
- On the next render (when conditions changed), React expected the same number of hooks
- React detected fewer hooks than expected → crash

## Solution

Moved **ALL hooks to the top** of the component, then handled visibility with **conditional rendering AFTER all hooks**:

### After (Fixed):
```typescript
export const FloatingTimer = () => {
  // ✅ ALL HOOKS CALLED FIRST - Unconditionally
  const { ... } = useFocusTimer();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const [hasCustomPosition, setHasCustomPosition] = useState(false);
  const x = useMotionValue(...);
  const y = useMotionValue(...);
  useEffect(() => { ... }, []);
  
  // ✅ NOW we can compute derived values
  const isOnRemindersPage = ...;
  const isTimerActive = ...;
  
  // ✅ Conditional rendering AFTER all hooks
  if (isOnRemindersPage || !isTimerActive) {
    return null;
  }
  
  // Rest of component...
}
```

## Files Audited

### ✅ `src/components/FloatingTimer.tsx` - **FIXED**
- **Issue**: Early return before `useState`, `useMotionValue`, and `useEffect`
- **Fix**: Moved all hooks to top, conditional rendering after hooks
- **Status**: Fixed

### ✅ `src/pages/app/Reminders.tsx` - **NO ISSUES**
- All hooks (`useAuth`, `useToast`, `useNavigate`, `useReminderSettings`, `useFocusTimer`, `useState`, `useEffect`) are called at the top level
- No early returns before hooks
- **Status**: No changes needed

### ✅ `src/layouts/AppLayout.tsx` - **NO ISSUES**
- All hooks (`useState`, `useLocation`, `useAuth`) are called at the top level
- No early returns before hooks
- `FloatingTimer` is always rendered (it handles its own visibility internally)
- **Status**: No changes needed

## Rules of Hooks Compliance

✅ **All hooks are now called:**
1. At the top level of the component
2. In the same order on every render
3. Unconditionally (no early returns before hooks)
4. Not inside loops, conditions, or nested functions

## Testing

- ✅ `npm run build` - Passes without errors
- ✅ No linter errors
- ✅ Hook order is stable across all render scenarios

## Impact

- **Before**: App crashed when navigating to `/app/reminders` or when timer became inactive
- **After**: App works correctly in all scenarios:
  - Timer continues running across route changes
  - FloatingTimer hides on `/app/reminders` (via conditional rendering)
  - FloatingTimer hides when timer is inactive (via conditional rendering)
  - No crashes or hook order violations

## Key Takeaway

**Always call ALL hooks at the top of your component, before any conditional logic or early returns.**

If you need conditional rendering, do it **AFTER** all hooks have been called.

## Commit

- **File Changed**: `src/components/FloatingTimer.tsx`
- **Lines Changed**: ~20 lines (reordered hooks, moved early return)
- **Breaking Changes**: None
- **Functionality Preserved**: All timer behavior and visibility rules remain identical

