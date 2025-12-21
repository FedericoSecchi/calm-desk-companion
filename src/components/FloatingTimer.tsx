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

import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, GripVertical } from "lucide-react";
import { useFocusTimer } from "@/contexts/FocusTimerContext";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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
  
  // Position persistence
  const POSITION_STORAGE_KEY = "calmo_floating_timer_position";
  
  // Calculate default position (bottom-right corner)
  const getDefaultPosition = () => {
    const elementWidth = 280; // Approximate width
    const elementHeight = 60; // Approximate height
    return {
      x: window.innerWidth - elementWidth - 24, // 24px = bottom-6
      y: window.innerHeight - elementHeight - 24, // 24px = right-6
    };
  };
  
  // Motion values for position (single source of truth)
  // Initialize with default position, will be overridden if stored position exists
  const defaultPos = getDefaultPosition();
  const x = useMotionValue(defaultPos.x);
  const y = useMotionValue(defaultPos.y);
  
  // Rehydrate position from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(POSITION_STORAGE_KEY);
      if (stored) {
        const position = JSON.parse(stored) as { x: number; y: number };
        if (typeof position.x === "number" && typeof position.y === "number") {
          x.set(position.x);
          y.set(position.y);
          if (import.meta.env.DEV) {
            console.debug("[FloatingTimer] Restored position:", position);
          }
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.debug("[FloatingTimer] Failed to restore position:", e);
      }
    }
  }, [x, y]);
  
  // Handle drag end - persist position
  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Get current position from motion values
    const currentX = x.get();
    const currentY = y.get();
    
    const position = { x: currentX, y: currentY };
    try {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
      if (import.meta.env.DEV) {
        console.debug("[FloatingTimer] Saved position:", position);
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.debug("[FloatingTimer] Failed to save position:", e);
      }
    }
  };
  
  // Calculate drag constraints based on element size
  const getDragConstraints = () => {
    const elementWidth = 280;
    const elementHeight = 60;
    return {
      left: 0,
      right: window.innerWidth - elementWidth,
      top: 0,
      bottom: window.innerHeight - elementHeight,
    };
  };

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
          dragConstraints={getDragConstraints()}
          style={{
            x,
            y,
          }}
          onDragStart={() => {
            setIsDragging(true);
          }}
          onDragEnd={handleDragEnd}
          className={cn(
            "fixed z-[2147483647]",
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

