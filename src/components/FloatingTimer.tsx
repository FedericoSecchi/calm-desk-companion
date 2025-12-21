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
import { Play, Pause, SkipForward, GripVertical } from "lucide-react";
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

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  // Component is always mounted - visibility controlled via AnimatePresence
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ 
            opacity: 0.9, 
            scale: isDragging ? 1.02 : 1,
            y: 0,
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
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
            "bg-background/60 backdrop-blur-sm",
            "rounded-full",
            "py-2 px-3",
            "cursor-grab active:cursor-grabbing",
            "select-none",
            "flex items-center gap-2"
          )}
          onClick={() => navigate("/app/reminders")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/app/reminders");
            }
          }}
          aria-label={`Timer: ${formatTime(timeRemaining)} restantes. Click para ver controles completos.`}
        >
          {/* Drag Handle */}
          <div className="opacity-20">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              toggleTimer();
            }}
            aria-label={isRunning ? "Pausar timer" : "Reanudar timer"}
          >
            {isRunning ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>

          {/* Timer Value */}
          <p className="text-xl font-heading text-foreground">
            {formatTime(timeRemaining)}
          </p>

          {/* Skip Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              skipToNextPhase();
            }}
            aria-label="Saltar fase"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

