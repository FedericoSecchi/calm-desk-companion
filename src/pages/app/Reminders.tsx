/**
 * Reminders Component
 * 
 * Control/configuration page for the focus timer.
 * Timer state is managed globally via FocusTimerContext.
 * This page allows users to:
 * - Configure presets (Ligero, Standard, Enfoque)
 * - Control timer (start/pause/skip)
 * - Adjust sound settings
 * - Request notification permissions
 * - See exercise recommendations after REST completion
 * 
 * All timer logic is handled by FocusTimerContext, ensuring the timer
 * persists across route changes and continues running independently.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Bell, 
  Volume2, 
  VolumeX,
  Check,
  Loader2,
  Coffee,
  Briefcase,
  Sparkles
} from "lucide-react";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useFocusTimer, presets } from "@/contexts/FocusTimerContext";

const Reminders = () => {
  const { isGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings, isLoading, updateSettings, isUpdating } = useReminderSettings();
  
  // Get timer state and controls from global context
  const focusTimerContext = useFocusTimer();
  const {
    currentPhase,
    timeRemaining,
    isRunning,
    selectedPreset,
    soundEnabled,
    toggleTimer,
    skipToNextPhase,
    setPreset,
    setSoundEnabled,
    formatTime,
    getPresetConfig,
    lastRestCompletion,
  } = focusTimerContext;
  
  // BRUTAL DEBUG: Log context in Reminders to compare with FloatingTimer
  console.log("[Reminders] CONTEXT OBJECT:", focusTimerContext);
  console.log("[Reminders] CONTEXT IDENTITY:", focusTimerContext === focusTimerContext ? "SAME" : "DIFFERENT");
  console.log("[Reminders] isRunning:", isRunning, typeof isRunning);
  console.log("[Reminders] timeRemaining:", timeRemaining);
  console.log("[Reminders] When toggleTimer called, isRunning will change to:", !isRunning);

  const presetConfig = getPresetConfig(selectedPreset);

  // Track if we've shown exercise recommendation after REST completion
  const [showExerciseRecommendation, setShowExerciseRecommendation] = useState(false);

  // Show exercise recommendation when REST phase just completed
  useEffect(() => {
    if (currentPhase === "work" && !isRunning && timeRemaining > 0) {
      // Check if we just transitioned from REST to WORK (within last 5 seconds)
      const now = Date.now();
      if (now - lastRestCompletion < 5000 && lastRestCompletion > 0) {
        setShowExerciseRecommendation(true);
      }
    } else {
      setShowExerciseRecommendation(false); // Hide if not in this specific state
    }
  }, [currentPhase, isRunning, timeRemaining, lastRestCompletion]);

  const handlePresetChange = async (preset: "light" | "standard" | "focus") => {
    try {
      await setPreset(preset);
      if (!isGuest) {
        toast({
          title: "Configuración guardada",
          description: `Preset ${preset} actualizado`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    }
  };

  const handleSoundToggle = async () => {
    try {
      await setSoundEnabled(!soundEnabled);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error updating sound setting:", error);
      }
      // Context will handle revert on error
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        if (!isGuest) {
          try {
            await updateSettings({ notifications_enabled: true });
            toast({
              title: "Notificaciones activadas",
              description: "Recibirás recordatorios aunque la app esté minimizada",
            });
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error("Error updating notification setting:", error);
            }
          }
        } else {
          toast({
            title: "Notificaciones activadas",
            description: "En modo invitado, las notificaciones solo funcionan en esta sesión",
          });
        }
      }
    } else if (Notification.permission === "granted") {
      toast({
        title: "Notificaciones ya activadas",
        description: "Ya tienes permisos para recibir notificaciones",
      });
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-heading text-2xl lg:text-3xl text-foreground">
          Recordatorios
        </h1>
        <p className="text-muted-foreground mt-1">
          Configura tus pausas de bienestar
        </p>
      </motion.div>

      {/* Timer Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`bg-card rounded-3xl p-8 border-2 shadow-soft mb-8 text-center transition-colors ${
          currentPhase === "work" 
            ? "border-primary/30 bg-primary/5" 
            : "border-secondary/30 bg-secondary/5"
        }`}
      >
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors ${
          currentPhase === "work" 
            ? "bg-primary/10" 
            : "bg-secondary/10"
        }`}>
          {currentPhase === "work" ? (
            <Briefcase className="h-12 w-12 text-primary" />
          ) : (
            <Coffee className="h-12 w-12 text-secondary" />
          )}
        </div>
        
        <p className="text-6xl font-heading text-foreground mb-2">
          {formatTime(timeRemaining)}
        </p>
        <div className="mb-8">
          <p className={`text-lg font-medium mb-1 ${
            currentPhase === "work" ? "text-primary" : "text-secondary"
          }`}>
            {currentPhase === "work" ? "⏱️ Tiempo de trabajo" : "☕ Tiempo de descanso"}
          </p>
          <p className="text-sm text-muted-foreground">
            {currentPhase === "work" 
              ? `Descanso de ${presetConfig.restMinutes} min después`
              : `Descanso activo · vuelves al trabajo en ${presetConfig.restMinutes} min`}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSoundToggle}
            className="h-12 w-12 rounded-xl"
            disabled={isUpdating}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="hero"
            size="xl"
            onClick={toggleTimer}
            className="h-16 w-16 rounded-full p-0"
          >
            {isRunning ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={skipToNextPhase}
            className="h-12 w-12 rounded-xl"
            title={currentPhase === "work" ? "Saltar al descanso" : "Finalizar descanso"}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Presets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="font-heading text-lg text-foreground mb-4">
          Frecuencia
        </h2>
        <div className="space-y-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id as "light" | "standard" | "focus")}
              disabled={isUpdating}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                selectedPreset === preset.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-border/80"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="text-left">
                <p className="font-medium text-foreground">{preset.name}</p>
                <p className="text-sm text-muted-foreground">
                  {preset.interval} • {preset.description}
                </p>
              </div>
              {selectedPreset === preset.id && (
                isUpdating ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Check className="h-5 w-5 text-primary" />
                )
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Exercise Recommendation (shown after REST completion) */}
      {showExerciseRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">
                  ¿Te gustaría hacer un ejercicio rápido?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Unos minutos de movimiento pueden ayudarte a mantenerte activo.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowExerciseRecommendation(false)}
                  >
                    Tal vez después
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="text-primary-foreground"
                    onClick={() => {
                      setShowExerciseRecommendation(false);
                      navigate("/app/exercises");
                    }}
                  >
                    Ver ejercicios
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notification Permission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="bg-muted rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground mb-1">
                Notificaciones del navegador
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Recibe recordatorios aunque la app esté minimizada. 
                En iOS puede haber limitaciones.
              </p>
              <Button variant="outline" size="sm" onClick={requestNotificationPermission}>
                Activar notificaciones
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Reminders;
