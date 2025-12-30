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
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  SkipForward, 
  Bell, 
  Volume2, 
  VolumeX,
  Check,
  Loader2,
  Coffee,
  Briefcase,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Settings
} from "lucide-react";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useFocusTimer, presets } from "@/contexts/FocusTimerContext";
import { ExercisePlayer } from "@/components/ExercisePlayer";
import { getExerciseById } from "@/lib/exercises";
import { Exercise as ExerciseType } from "@/lib/exerciseTypes";

const Reminders = () => {
  const { isGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, updateSettings, isUpdating } = useReminderSettings();
  
  // Get timer state and controls from global context
  const focusTimerContext = useFocusTimer();
  const {
    currentPhase,
    timeRemaining,
    isRunning,
    selectedPreset,
    soundEnabled,
    skipToNextPhase,
    setPreset,
    setCustomTimings,
    setSoundEnabled,
    formatTime,
    getPresetConfig,
    lastRestCompletion,
    startTimer,
  } = focusTimerContext;
  
  // Check if user came from Dashboard to show rhythm selection modal
  // Only show if timer is not already running
  const shouldShowRhythmModal = searchParams.get("from") === "dashboard" && !isRunning;
  const [rhythmModalOpen, setRhythmModalOpen] = useState(false);
  
  // Sync modal state with searchParams changes
  useEffect(() => {
    if (shouldShowRhythmModal) {
      setRhythmModalOpen(true);
    }
  }, [shouldShowRhythmModal]);
  
  // DEV-only debug: Log provider ID to prove single context instance
  if (import.meta.env.DEV) {
    console.debug("[Reminders] Provider ID:", focusTimerContext.providerId);
    console.debug("[Reminders] isRunning:", isRunning, "timeRemaining:", timeRemaining);
  }

  const presetConfig = getPresetConfig(selectedPreset);

  // Track if we've shown exercise recommendation after REST completion
  const [showExerciseRecommendation, setShowExerciseRecommendation] = useState(false);
  const [playingExercise, setPlayingExercise] = useState<ExerciseType | null>(null);
  
  // Advanced section state
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [customWorkMinutes, setCustomWorkMinutes] = useState(45);
  const [customRestMinutes, setCustomRestMinutes] = useState(5);
  const [showResetWarning, setShowResetWarning] = useState(false);

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
    // Prevent frequency change while timer is running
    if (isRunning) {
      return; // UI should be disabled, but guard just in case
    }

    // Show reset warning if timer is paused
    if (!isRunning && timeRemaining > 0) {
      setShowResetWarning(true);
      setTimeout(() => setShowResetWarning(false), 5000);
    }

    try {
      await setPreset(preset);
      if (!isGuest) {
        toast({
          title: "Configuración guardada",
          description: `Ritmo ${preset} actualizado`,
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

  const handleCustomTimings = () => {
    // Prevent change while timer is running
    if (isRunning) {
      return;
    }

    // Validate inputs
    if (customWorkMinutes < 1 || customRestMinutes < 1) {
      toast({
        title: "Valores inválidos",
        description: "Los minutos deben ser al menos 1",
        variant: "destructive",
      });
      return;
    }

    // Show reset warning if timer is paused
    if (!isRunning && timeRemaining > 0) {
      setShowResetWarning(true);
      setTimeout(() => setShowResetWarning(false), 5000);
    }

    setCustomTimings(customWorkMinutes, customRestMinutes);
    toast({
      title: "Ritmo personalizado aplicado",
      description: `${customWorkMinutes} min trabajo · ${customRestMinutes} min descanso`,
    });
  };

  // Handle rhythm selection from modal
  const handleRhythmSelect = async (presetId: "light" | "standard" | "focus") => {
    try {
      // Close modal immediately for better UX
      setRhythmModalOpen(false);
      // Remove query param immediately
      setSearchParams({}, { replace: true });
      
      // Set preset and start timer
      await setPreset(presetId);
      startTimer();
      
      toast({
        title: "¡Foco iniciado!",
        description: `Ritmo ${getPresetConfig(presetId).name} activado`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error starting focus:", error);
      }
      toast({
        title: "Error",
        description: "No se pudo iniciar el foco",
        variant: "destructive",
      });
      // Reopen modal on error
      setRhythmModalOpen(true);
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
    <>
      {/* Rhythm Selection Modal (shown when coming from Dashboard) */}
      <Dialog 
        open={rhythmModalOpen} 
        onOpenChange={(open) => {
          setRhythmModalOpen(open);
          // If modal is closed, remove query param
          if (!open) {
            setSearchParams({}, { replace: true });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Elige tu ritmo de trabajo</DialogTitle>
            <DialogDescription>
              Selecciona el ritmo que mejor se adapte a tu día
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleRhythmSelect(preset.id as "light" | "standard" | "focus")}
                disabled={isUpdating}
                className="w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between text-left hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed border-border bg-card"
              >
                <div>
                  <p className="font-medium text-foreground">{preset.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {preset.description}
                  </p>
                </div>
                {isUpdating ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
              disabled={isUpdating || isRunning}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                selectedPreset === preset.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-border/80"
              } ${isUpdating || isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
              title={isRunning ? "Pausá el timer para cambiar el ritmo" : undefined}
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

        {/* Inline info message when timer is running */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 p-3 rounded-xl bg-muted/50 border border-border/50"
            >
              <p className="text-sm text-foreground font-medium mb-1">
                Para cambiar el ritmo, primero pausá el timer.
              </p>
              <p className="text-xs text-muted-foreground">
                Al reanudar, el tiempo se reiniciará con la nueva frecuencia.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset warning when timer is paused and user changes rhythm */}
        <AnimatePresence>
          {showResetWarning && !isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
              <p className="text-sm text-foreground font-medium">
                El tiempo se reiniciará con el nuevo ritmo.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced section - collapsible */}
        <div className="mt-6">
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            disabled={isRunning}
            className={`w-full flex items-center justify-between p-3 rounded-xl border border-border/50 transition-all ${
              isRunning ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Avanzado</span>
            </div>
            {advancedOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {advancedOpen && !isRunning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 p-4 rounded-xl border border-border/50 bg-card/50"
              >
                <p className="text-sm font-medium text-foreground mb-3">Ritmo Personalizado</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Trabajo (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customWorkMinutes}
                      onChange={(e) => setCustomWorkMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Descanso (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customRestMinutes}
                      onChange={(e) => setCustomRestMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                  <Button
                    onClick={handleCustomTimings}
                    className="w-full"
                    size="sm"
                  >
                    Aplicar ritmo personalizado
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Este ritmo solo se aplica a la sesión actual y no se guarda.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                      // Suggest a quick exercise (neck rotation - 2 min)
                      const suggestedExercise = getExerciseById("neck-rotation");
                      if (suggestedExercise) {
                        setShowExerciseRecommendation(false);
                        setPlayingExercise(suggestedExercise);
                      } else {
                        // Fallback: navigate to exercises page
                        setShowExerciseRecommendation(false);
                        navigate("/app/exercises");
                      }
                    }}
                  >
                    Empezar ejercicio
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

      {/* Exercise Player (shown when user starts exercise from recommendation) */}
      {playingExercise && (
        <ExercisePlayer
          exercise={playingExercise}
          onComplete={() => {
            setPlayingExercise(null);
            // Exercise completes, user returns to REST phase (which continues running)
          }}
          onClose={() => {
            setPlayingExercise(null);
          }}
        />
      )}
      </div>
    </>
  );
};

export default Reminders;
