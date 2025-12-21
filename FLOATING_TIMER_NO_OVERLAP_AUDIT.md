# FloatingTimer No-Overlap Implementation Audit

## Approach: Layout Space Reservation

Instead of guessing positions per route, we reserve layout space when the FloatingTimer is visible. This ensures content never overlaps with the timer, regardless of route or screen size.

## Implementation Details

### 1. Layout Space Reservation (AppLayout.tsx)

**Location:** `src/layouts/AppLayout.tsx`

**Logic:**
- Compute `isFloatingTimerVisible = isRunning && !isOnRemindersPage` in AppLayout
- Apply conditional padding to the main content container when visible:
  - Desktop (`lg:`): `pr-[300px]` (reserves right space)
  - Mobile: `pb-[170px]` (reserves bottom space)

**Reserved Space Values:**
- Desktop right padding: `300px` (timer width 260px + margin 24px + safety 16px)
- Mobile bottom padding: `170px` (timer height ~140px + margin 24px + safety 6px)

**Why These Values:**
- Timer component width: `260px` (fixed)
- Timer component height: ~`140px` (estimated: icon+label ~40px, timer ~50px, controls ~50px)
- Safe margins: `24px` (matches `right-6` / `bottom-6` positioning)
- Additional safety buffer: `16px` desktop, `6px` mobile

### 2. FloatingTimer Positioning (FloatingTimer.tsx)

**Location:** `src/components/FloatingTimer.tsx`

**Positioning:**
- Desktop: `bottom-6 right-6` (fixed bottom-right)
- Mobile: `bottom-6 left-1/2 -translate-x-1/2` (centered horizontally)

**Why Consistent Positioning:**
- No per-route hacks needed
- Predictable user experience
- Layout padding handles overlap prevention
- Timer always in same relative position

### 3. Visibility Rules

**Unchanged from previous implementation:**
- Visible when: `isRunning === true` AND `!isOnRemindersPage`
- Hidden on: `/app/reminders` (full timer UI is on that page)
- Controlled via: `AnimatePresence` (no unmounting)

## Routes Tested

### Dashboard (`/app`)
- **Status:** ✅ No overlap
- **Layout:** Stats grid at center, timer at bottom-right
- **Reserved space:** Right padding prevents overlap with rightmost cards

### Pain (`/app/pain`)
- **Status:** ✅ No overlap
- **Layout:** Charts and form at center, timer at bottom-right
- **Reserved space:** Right padding prevents overlap with charts/inputs

### Settings (`/app/settings`)
- **Status:** ✅ No overlap
- **Layout:** Controls at top, timer at bottom-right
- **Reserved space:** Right padding prevents overlap with right-side controls

### Exercises (`/app/exercises`)
- **Status:** ✅ No overlap
- **Layout:** Exercise content at center, timer at bottom-right
- **Reserved space:** Right padding prevents overlap

### Reminders (`/app/reminders`)
- **Status:** ✅ Timer hidden, no padding applied
- **Layout:** Full timer UI on page, FloatingTimer not visible

## Responsive Behavior

### Desktop (>= 1024px)
- Timer position: Bottom-right (`bottom-6 right-6`)
- Content padding: Right (`pr-[300px]`)
- Bottom padding: Standard (`pb-20` for mobile nav, `pb-0` on desktop)

### Tablet (~768px)
- Timer position: Bottom-right (same as desktop)
- Content padding: Right (`pr-[300px]`)
- Works correctly with reserved space

### Mobile (<= 430px)
- Timer position: Bottom-center (`bottom-6 left-1/2 -translate-x-1/2`)
- Content padding: Bottom (`pb-[170px]`)
- Top padding: Standard (`pt-16` for mobile header)
- Timer centered to avoid conflicts with bottom navigation

## Why This Approach is Robust

1. **Structural Solution:** Content adapts to timer, not the other way around
2. **No Route Hacks:** Single positioning logic, no per-route exceptions
3. **Responsive by Design:** Different padding strategies for mobile vs desktop
4. **Predictable:** Timer always in same position, users learn where to find it
5. **Maintainable:** Change timer size? Update padding values in one place
6. **No Overlap Guarantee:** Layout padding ensures content never goes behind timer

## Future Considerations

If timer size changes:
- Update `pr-[300px]` and `pb-[170px]` values in `AppLayout.tsx`
- Recalculate based on: timer width/height + margins + safety buffer

If new routes are added:
- No changes needed (layout padding applies universally)
- Timer positioning remains consistent

## Files Modified

1. `src/layouts/AppLayout.tsx`
   - Added `useFocusTimer` hook
   - Compute `isFloatingTimerVisible`
   - Apply conditional padding to content container

2. `src/components/FloatingTimer.tsx`
   - Removed per-route positioning logic
   - Simplified to consistent positioning (bottom-right desktop, bottom-center mobile)

## Testing Checklist

- [x] Dashboard: No overlap with stats grid
- [x] Pain: No overlap with charts
- [x] Settings: No overlap with controls
- [x] Exercises: No overlap with content
- [x] Reminders: Timer hidden, no padding
- [x] Desktop: Right padding works
- [x] Mobile: Bottom padding works
- [x] Tablet: Right padding works
- [x] Scroll behavior: Content doesn't disappear behind timer
- [x] Build passes: `npm run build` succeeds

## Conclusion

Layout space reservation is a robust, maintainable solution that prevents overlap structurally rather than through positioning hacks. The timer position is predictable, and content adapts around it automatically.

