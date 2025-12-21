/**
 * FloatingTimer Component
 * 
 * Persistent floating timer UI that appears when timer is active.
 * Visible across /app routes (except /app/reminders) to maintain focus continuity.
 * 
 * Features:
 * - Fixed position per section (no drag)
 * - Shows current phase, remaining time, and icon
 * - Controls: pause/resume and skip phase
 * - Clicking navigates to /app/reminders for full controls
 * - Hidden on /app/reminders page (full timer UI is there)
 */

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, Briefcase, Coffee } from "lucide-react";
import { useFocusTimer } from "@/contexts/FocusTimerContext";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const FloatingTimer = () => {
  // ALL HOOKS MUST BE CALLED FIRST - No early returns before hooks
  const focusTimerContext = useFocusTimer();
  const {
    currentPhase,
    timeRemaining,
    isRunning,
    toggleTimer,
    skipToNextPhase,
    formatTime,
    getPresetConfig,
    selectedPreset,
  } = focusTimerContext;
  const navigate = useNavigate();
  const location = useLocation();

  // Visibility Logic: Show when timer is running AND NOT on /app/reminders
  const pathname = location.pathname;
  const isOnRemindersPage = pathname.endsWith("/reminders") || pathname.includes("/app/reminders");
  const shouldShow = isRunning && !isOnRemindersPage;

  // Determine fixed position based on current route
  const getPositionClasses = () => {
    if (pathname.includes("/exercises")) {
      return "top-20 right-6"; // Top-right for Exercises (below header)
    } else if (pathname.includes("/pain")) {
      return "bottom-6 left-6"; // Bottom-left for Pain
    } else {
      return "bottom-6 right-6"; // Default: bottom-right for Dashboard and others
    }
  };

  const presetConfig = getPresetConfig(selectedPreset);
  const isWork = currentPhase === "work";
  const phaseLabel = isWork ? "Trabajo" : "Descanso";

  // Component is always mounted - visibility controlled via AnimatePresence
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "fixed z-[2147483647]",
            getPositionClasses(),
            "bg-card rounded-2xl border border-border/50",
            "p-4",
            "shadow-soft",
            "select-none",
            "flex flex-col gap-2",
            "w-[260px]"
          )}
          onClick={() => navigate("/app/reminders")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/app/reminders");
            }
          }}
          aria-label={`Timer ${phaseLabel}: ${formatTime(timeRemaining)} restantes. Click para ver controles completos.`}
        >
          {/* Top Row: Phase Icon + Label */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                isWork ? "bg-primary/10" : "bg-secondary/10"
              )}
            >
              {isWork ? (
                <Briefcase className="h-4 w-4 text-primary" />
              ) : (
                <Coffee className="h-4 w-4 text-secondary" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {phaseLabel}
            </span>
          </div>

          {/* Middle: Big Timer */}
          <div>
            <p className="text-2xl font-heading text-foreground">
              {formatTime(timeRemaining)}
            </p>
          </div>

          {/* Bottom Row: Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                toggleTimer();
              }}
              aria-label={isRunning ? "Pausar timer" : "Reanudar timer"}
            >
              {isRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                skipToNextPhase();
              }}
              aria-label={
                isWork ? "Saltar al descanso" : "Finalizar descanso"
              }
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
