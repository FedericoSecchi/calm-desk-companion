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
 * - Only visible when timer is active (has time remaining)
 */

import { motion, useMotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, Briefcase, Coffee, GripVertical } from "lucide-react";
import { useFocusTimer } from "@/contexts/FocusTimerContext";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const POSITION_STORAGE_KEY = "calmo_floating_timer_position";

interface SavedPosition {
  x: number;
  y: number;
}

export const FloatingTimer = () => {
  // ALL HOOKS MUST BE CALLED FIRST - No early returns before hooks
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
  const location = useLocation();
  
  // State hooks - must be called unconditionally
  const [isDragging, setIsDragging] = useState(false);
  const [hasCustomPosition, setHasCustomPosition] = useState(false);
  
  // Load saved position helper function
  const getSavedPosition = (): SavedPosition | null => {
    try {
      const saved = localStorage.getItem(POSITION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.x !== undefined && parsed.y !== undefined) {
          return { x: parsed.x, y: parsed.y };
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.debug("Failed to load timer position:", e);
      }
    }
    return null;
  };
  
  const savedPosition = getSavedPosition();
  
  // Motion value hooks - must be called unconditionally
  const x = useMotionValue(savedPosition?.x || 0);
  const y = useMotionValue(savedPosition?.y || 0);

  // Effect hooks - must be called unconditionally
  useEffect(() => {
    setHasCustomPosition(savedPosition !== null);
  }, [savedPosition]);

  // NOW we can compute derived values and handle visibility
  const presetConfig = getPresetConfig(selectedPreset);
  
  // Visibility rules:
  // 1. NOT visible on /app/reminders (full timer UI is there)
  // 2. NOT visible when timer is not active (timeRemaining === 0 && !isRunning)
  // 3. Visible on other /app routes when timer is active
  // IMPORTANT: Component is ALWAYS mounted, visibility controlled via CSS only
  const isOnRemindersPage = location.pathname === "/app/reminders" || location.pathname === "/calm-desk-companion/app/reminders";
  const isTimerActive = timeRemaining > 0 || isRunning;
  const isHidden = isOnRemindersPage || !isTimerActive;

  const isWork = currentPhase === "work";
  const phaseLabel = isWork ? "Trabajo" : "Descanso";

  // Save position when dragging ends
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const currentX = x.get();
    const currentY = y.get();
    const newX = currentX + info.offset.x;
    const newY = currentY + info.offset.y;
    
    x.set(newX);
    y.set(newY);
    
    const newPosition = { x: newX, y: newY };
    setHasCustomPosition(true);
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(newPosition));
  };

  // Component is ALWAYS mounted - visibility controlled via CSS only
  return (
    <motion.div
      initial={false}
      animate={{ 
        opacity: isHidden ? 0 : 1,
        scale: isDragging ? 1.05 : 1,
        pointerEvents: isHidden ? "none" : "auto",
      }}
      transition={{ duration: 0.2 }}
      drag={!isHidden} // Disable drag when hidden
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={
        typeof window !== "undefined"
          ? {
              left: -window.innerWidth + 400,
              right: window.innerWidth - 400,
              top: -window.innerHeight + 200,
              bottom: window.innerHeight - 200,
            }
          : undefined
      }
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{
        ...(hasCustomPosition ? {
          x,
          y,
          left: "auto",
          right: "auto",
          bottom: "auto",
          top: "auto",
        } : {}),
        // Hide via CSS when needed (component stays mounted)
        display: isHidden ? "none" : "block",
      }}
      className={cn(
        "fixed z-50",
        !hasCustomPosition && "bottom-4 right-4 lg:bottom-6 lg:right-6", // Default position
        !hasCustomPosition && "mx-auto lg:mx-0", // Center on mobile if default
        "w-[calc(100vw-2rem)] max-w-sm", // Mobile: full width with padding
        "bg-card/95 backdrop-blur-sm",
        "rounded-2xl border-2 shadow-lg",
        "p-4",
        "cursor-move",
        "select-none", // Prevent text selection while dragging
        isWork
          ? "border-primary/30 bg-primary/5"
          : "border-secondary/30 bg-secondary/5",
        isDragging && "shadow-2xl"
      )}
        onClick={(e) => {
          // Only navigate if not dragging
          if (!isDragging) {
            navigate("/app/reminders");
          }
        }}
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
          {/* Drag Handle */}
          <div className="shrink-0 text-muted-foreground/50 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>

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
  );
};

