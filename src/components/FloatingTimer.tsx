/**
 * TopTimerBar Component
 * 
 * Minimal, transparent timer bar integrated at the top of app content.
 * Visible when timer is running, hidden on /app/reminders.
 * 
 * Design: Calm, minimal, integrated - feels like part of the header.
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
  } = focusTimerContext;
  const navigate = useNavigate();
  const location = useLocation();

  // Visibility Logic: Show when timer is running AND NOT on /app/reminders
  const pathname = location.pathname;
  const isOnRemindersPage = pathname.endsWith("/reminders") || pathname.includes("/app/reminders");
  const shouldShow = isRunning && !isOnRemindersPage;

  const isWork = currentPhase === "work";

  // Minimal top bar - integrated into layout
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "w-full",
            "bg-card/20 backdrop-blur-sm",
            "border-b border-border/30",
            "px-4 py-2",
            "flex items-center justify-between gap-3",
            "text-sm"
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
          {/* Left: Icon + Time */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                isWork ? "bg-primary/10" : "bg-secondary/10"
              )}
            >
              {isWork ? (
                <Briefcase className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Coffee className="h-3.5 w-3.5 text-secondary" />
              )}
            </div>
            <span className="font-medium text-foreground">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                skipToNextPhase();
              }}
              aria-label={isWork ? "Saltar al descanso" : "Finalizar descanso"}
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
