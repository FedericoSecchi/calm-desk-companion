/**
 * FloatingTimer Component
 * 
 * Persistent floating timer UI that appears when timer is running.
 * Visible across all /app routes to maintain focus continuity.
 * 
 * Features:
 * - Fixed position (bottom-right on desktop, bottom-center on mobile)
 * - Shows current phase, remaining time, and icon
 * - Controls: pause/resume and skip phase
 * - Clicking navigates to /app/reminders for full controls
 */

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, Briefcase, Coffee } from "lucide-react";
import { useFocusTimer } from "@/contexts/FocusTimerContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const FloatingTimer = () => {
  const {
    currentPhase,
    timeRemaining,
    isRunning,
    toggleTimer,
    skipToNextPhase,
    formatTime,
    getPresetConfig,
    selectedPreset,
  } = useFocusTimer();
  const navigate = useNavigate();
  const presetConfig = getPresetConfig(selectedPreset);

  // Only show when timer has time remaining (running or paused)
  // Hide when timer is at 0 and not running (initial state)
  if (timeRemaining === 0 && !isRunning) {
    return null;
  }

  const isWork = currentPhase === "work";
  const phaseLabel = isWork ? "Trabajo" : "Descanso";
  const phaseIcon = isWork ? Briefcase : Coffee;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed z-50",
          "bottom-4 right-4 lg:bottom-6 lg:right-6", // Desktop: bottom-right
          "w-[calc(100vw-2rem)] max-w-sm", // Mobile: full width with padding
          "mx-auto lg:mx-0", // Center on mobile
          "bg-card/95 backdrop-blur-sm",
          "rounded-2xl border-2 shadow-lg",
          "p-4",
          isWork
            ? "border-primary/30 bg-primary/5"
            : "border-secondary/30 bg-secondary/5"
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
        <div className="flex items-center gap-3">
          {/* Phase Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              isWork ? "bg-primary/10" : "bg-secondary/10"
            )}
          >
            {isWork ? (
              <Briefcase className="h-6 w-6 text-primary" />
            ) : (
              <Coffee className="h-6 w-6 text-secondary" />
            )}
          </div>

          {/* Timer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <p
                className={cn(
                  "text-2xl font-heading font-bold",
                  isWork ? "text-primary" : "text-secondary"
                )}
              >
                {formatTime(timeRemaining)}
              </p>
              <p className="text-xs text-muted-foreground">{phaseLabel}</p>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isWork
                ? `Descanso en ${presetConfig.restMinutes} min`
                : `Vuelves al trabajo en ${presetConfig.restMinutes} min`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 shrink-0">
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

