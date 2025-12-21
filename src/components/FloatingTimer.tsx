/**
 * FloatingTimer Component
 * 
 * Persistent floating timer UI that appears when timer is active.
 * Visible across /app routes (except /app/reminders) to maintain focus continuity.
 * 
 * TEMPORARY: Using plain div with hardcoded styles to force visibility.
 * Will reintroduce Framer Motion and drag after confirming visibility works.
 */

import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, Briefcase, Coffee } from "lucide-react";
import { useFocusTimer } from "@/contexts/FocusTimerContext";
import { useNavigate, useLocation } from "react-router-dom";

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

  // Return null if should not show (for now, to force visibility test)
  if (!shouldShow) {
    return null;
  }

  const presetConfig = getPresetConfig(selectedPreset);
  const isWork = currentPhase === "work";
  const phaseLabel = isWork ? "Trabajo" : "Descanso";

  // FORCE VISIBILITY: Plain div with hardcoded styles, no Framer Motion
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "280px",
        height: "auto",
        background: "#111",
        color: "white",
        border: "2px solid red",
        zIndex: 2147483647,
        opacity: 1,
        pointerEvents: "auto",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
      }}
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
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Phase Icon */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isWork ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
          }}
        >
          {isWork ? (
            <Briefcase style={{ width: "24px", height: "24px", color: "#3b82f6" }} />
          ) : (
            <Coffee style={{ width: "24px", height: "24px", color: "#10b981" }} />
          )}
        </div>

        {/* Timer Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <p
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: isWork ? "#3b82f6" : "#10b981",
                margin: 0,
              }}
            >
              {formatTime(timeRemaining)}
            </p>
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
              {phaseLabel}
            </p>
          </div>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0 0" }}>
            {isWork
              ? `Descanso en ${presetConfig.restMinutes} min`
              : `Vuelves al trabajo en ${presetConfig.restMinutes} min`}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTimer();
            }}
            style={{
              width: "32px",
              height: "32px",
              border: "none",
              background: "transparent",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={isRunning ? "Pausar timer" : "Reanudar timer"}
          >
            {isRunning ? (
              <Pause style={{ width: "16px", height: "16px" }} />
            ) : (
              <Play style={{ width: "16px", height: "16px" }} />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              skipToNextPhase();
            }}
            style={{
              width: "32px",
              height: "32px",
              border: "none",
              background: "transparent",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={isWork ? "Saltar al descanso" : "Finalizar descanso"}
          >
            <SkipForward style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

