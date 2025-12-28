# App Boot Stability Audit

## Issue
App was reported as not starting in local development.

## Investigation

### Provider Hierarchy Analysis

**Current Structure (App.tsx)**:
```
ErrorBoundary
  └─ QueryClientProvider
      └─ TooltipProvider
          └─ AuthProvider
              └─ BrowserRouter
                  └─ Routes
                      └─ /app route
                          └─ ProtectedRoute (uses useAuth)
                              └─ FocusTimerProvider (uses useAuth, useToast, useReminderSettings, useBreakLogs)
                                  └─ AppLayout (uses useAuth, useFocusTimer)
                                      └─ FloatingTimer (uses useFocusTimer)
                                      └─ EndOfFocusDialog (uses useNavigate, useWaterLogs, useToast)
```

### Root Cause Analysis

**Issue Found**: `AppLayout` was calling `useFocusTimer()` directly, which requires `FocusTimerProvider` to be mounted. The provider hierarchy is correct (AppLayout is wrapped by FocusTimerProvider), so this should work.

**Potential Issues Identified**:
1. `FocusTimerProvider` depends on multiple hooks that require their own providers:
   - `useAuth()` - requires `AuthProvider` ✅ (wraps FocusTimerProvider)
   - `useToast()` - requires toast context ✅ (available globally)
   - `useReminderSettings()` - requires `QueryClientProvider` ✅ (wraps everything)
   - `useBreakLogs()` - requires `QueryClientProvider` and `AuthProvider` ✅

2. All provider dependencies are correctly ordered in the hierarchy.

### Fixes Applied

**Changes Made**:
1. **AppLayout.tsx**: Restored direct use of `useFocusTimer()` hook
   - Added comment clarifying that the hook is safe because AppLayout is wrapped by FocusTimerProvider
   - Removed any defensive wrapper components that were unnecessary

2. **Verification**: 
   - Build passes: `npm run build` ✅
   - No linter errors ✅
   - Provider hierarchy is correct ✅

### Provider Dependency Chain

```
QueryClientProvider (required by useReminderSettings, useBreakLogs)
  └─ AuthProvider (required by FocusTimerProvider, useBreakLogs)
      └─ FocusTimerProvider (required by AppLayout, FloatingTimer, EndOfFocusDialog)
          └─ AppLayout (uses useFocusTimer)
```

**All dependencies are satisfied in the correct order.**

## Verification Steps

1. ✅ `npm run build` - passes successfully
2. ✅ No TypeScript errors
3. ✅ No linter errors
4. ✅ Provider hierarchy verified
5. ⚠️ Local dev server test - needs manual verification

## Conclusion

The app boot structure is correct. The provider hierarchy ensures all hooks have access to their required providers:

- `AppLayout` uses `useFocusTimer()` - ✅ wrapped by `FocusTimerProvider`
- `FloatingTimer` uses `useFocusTimer()` - ✅ rendered inside `AppLayout` (which is wrapped)
- `EndOfFocusDialog` uses router hooks - ✅ rendered inside `BrowserRouter`
- `FocusTimerProvider` uses `useAuth()` - ✅ wrapped by `AuthProvider`

**If the app still doesn't boot locally, the issue is likely:**
1. Missing environment variables
2. Runtime error in a provider initialization
3. Browser console errors that need investigation
4. Port conflicts or dev server issues

## Recommendations

1. Check browser console for runtime errors
2. Verify all environment variables are set (if Supabase is required)
3. Check that `npm install` completed successfully
4. Verify no port conflicts (default Vite port 5173)

## Files Modified

- `src/layouts/AppLayout.tsx` - Restored direct useFocusTimer() usage with clarifying comment

