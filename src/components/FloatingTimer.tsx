/**
 * FloatingTimer Component
 * 
 * Persistent floating timer UI that appears when timer is active.
 * Visible across /app routes (except /app/reminders) to maintain focus continuity.
 * 
 * Features:
 * - Draggable position (persists during session)
 * - Shows current phase, remaining time, and icon
 * - Controls: pause/resume and skip phase
 * - Clicking navigates to /app/reminders for full controls
 * - Hidden on /app/reminders page (full timer UI is there)
 */

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, Briefcase, Coffee, GripVertical } from "lucide-react";
import { useFocusTimer } from "@/contexts/FocusTimerContext";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  
  // DEV-only debug: Log provider ID to prove single context instance
  if (import.meta.env.DEV) {
    console.debug("[FloatingTimer] Provider ID:", focusTimerContext.providerId);
    console.debug("[FloatingTimer] isRunning:", isRunning, "timeRemaining:", timeRemaining);
  }

  // Visibility Logic: Show when timer is running AND NOT on /app/reminders
  const pathname = location.pathname;
  const isOnRemindersPage = pathname.endsWith("/reminders") || pathname.includes("/app/reminders");
  const shouldShow = isRunning && !isOnRemindersPage;

  // DEV-only debug logs
  if (import.meta.env.DEV) {
    console.debug("[FloatingTimer] Visibility:", {
      pathname,
      isRunning,
      isOnRemindersPage,
      shouldShow,
    });
  }

  const presetConfig = getPresetConfig(selectedPreset);
  const isWork = currentPhase === "work";
  const phaseLabel = isWork ? "Trabajo" : "Descanso";
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  // Component is always mounted - visibility controlled via AnimatePresence
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ 
            opacity: 1, 
            scale: isDragging ? 1.03 : 1,
            y: 0,
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          drag
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={{
            left: -window.innerWidth + 280,
            right: window.innerWidth - 280,
            top: -window.innerHeight + 200,
            bottom: window.innerHeight - 200,
          }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className={cn(
            "fixed bottom-6 right-6 z-[2147483647]",
            "w-[260px] max-w-[90%] sm:max-w-[320px]",
            "bg-[rgba(17,17,17,0.92)] backdrop-blur-[8px]",
            "rounded-2xl border border-white/8",
            "px-4 py-3.5",
            "shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
            "cursor-grab active:cursor-grabbing",
            "select-none",
            "font-smoothing-antialiased",
            isDragging && "shadow-[0_15px_40px_rgba(0,0,0,0.45)]"
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
          {/* Drag Handle */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-30">
            <GripVertical className="h-3 w-3 text-foreground" />
          </div>

          {/* Top Row: Phase Icon + Label */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                isWork ? "bg-primary/10" : "bg-secondary/10"
              )}
            >
              {isWork ? (
                <Briefcase className="h-4 w-4 text-primary opacity-70" />
              ) : (
                <Coffee className="h-4 w-4 text-secondary opacity-70" />
              )}
            </div>
            <span className="text-xs uppercase tracking-wider opacity-65 font-medium">
              {phaseLabel}
            </span>
          </div>

          {/* Middle: Big Timer */}
          <div className="mb-3">
            <p
              className={cn(
                "text-[28px] font-semibold leading-none tracking-[-0.02em]",
                isWork ? "text-primary" : "text-secondary"
              )}
            >
              {formatTime(timeRemaining)}
            </p>
          </div>

          {/* Bottom Row: Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/8"
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
              className="h-8 w-8 hover:bg-white/8"
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

