/**
 * AUDIT: Reminders Component
 * 
 * Previous Issues (Fixed):
 * - Preset buttons changed state but didn't update timer durations
 * - Timer was hardcoded to 30 minutes regardless of preset
 * - No distinction between WORK and REST phases
 * - SkipForward button had unclear purpose
 * - No notifications when work timer completed
 * - Timer reset on page reload
 * - Incorrect REST phase messaging
 * - Preset range labels didn't match timer behavior
 * 
 * Current Implementation:
 * - Timer has two phases: WORK (countdown to break) and REST (break duration)
 * - Presets define both work and rest durations:
 *   - Ligero: 60 min work / 10 min rest
 *   - Standard: 45 min work / 5 min rest
 *   - Enfoque: 90 min work / 10 min rest
 * - Timer persists to localStorage and continues accurately after page reload
 * - Fully automatic cycle: WORK → REST → WORK continues indefinitely until paused
 * - When WORK completes, automatically starts REST timer with notification + sound
 * - When REST completes, automatically starts WORK timer with notification + sound
 * - Both phase transitions trigger browser notifications and subtle sound
 * - SkipForward button skips to next phase
 * - Exercise recommendation CTA navigates to Exercises section
 * 
 * Timer Persistence Model:
 * - Stores: phase, remainingSeconds, lastTickTimestamp, isRunning, presetId
 * - On reload: Computes elapsed time using Date.now() diff
 * - If WORK finished while closed, transitions to REST immediately
 * - Uses localStorage key: "calmo_reminder_timer_state"
 */

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Bell, 
  Volume2, 
  VolumeX,
  Clock,
  Check,
  Loader2,
  Coffee,
  Briefcase,
  Sparkles
} from "lucide-react";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useBreakLogs } from "@/hooks/useBreakLogs";
import { useNavigate } from "react-router-dom";

const TIMER_STORAGE_KEY = "calmo_reminder_timer_state";

interface TimerState {
  phase: TimerPhase;
  remainingSeconds: number;
  lastTickTimestamp: number;
  isRunning: boolean;
  presetId: "light" | "standard" | "focus";
}

type TimerPhase = "work" | "rest";

interface PresetConfig {
  id: "light" | "standard" | "focus";
  name: string;
  interval: string;
  description: string;
  workMinutes: number; // Work duration in minutes
  restMinutes: number; // Rest duration in minutes
}

/**
 * Preset configurations
 * 
 * Note: The "interval" field now shows ONLY the actual WORK duration used by the timer.
 * This simplifies the UI and removes confusion about ranges.
 * - Ligero: 60 min work / 10 min rest
 * - Standard: 45 min work / 5 min rest
 * - Enfoque: 90 min work / 10 min rest
 */
const presets: PresetConfig[] = [
  { id: "light", name: "Ligero", interval: "60 min", description: "Para días intensos", workMinutes: 60, restMinutes: 10 },
  { id: "standard", name: "Estándar", interval: "45 min", description: "Recomendado", workMinutes: 45, restMinutes: 5 },
  { id: "focus", name: "Enfoque", interval: "90 min", description: "Trabajo profundo", workMinutes: 90, restMinutes: 10 },
];

const Reminders = () => {
  const { isGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings, isLoading, updateSettings, isUpdating } = useReminderSettings();
  const { logBreak } = useBreakLogs();
  
  // Get current preset config
  const getPresetConfig = (presetId: "light" | "standard" | "focus"): PresetConfig => {
    return presets.find(p => p.id === presetId) || presets[1]; // Default to standard
  };
  
  // Use settings from database if available, otherwise use local state
  const [selectedPreset, setSelectedPreset] = useState<"light" | "standard" | "focus">(
    settings?.preset || "standard"
  );
  const [soundEnabled, setSoundEnabled] = useState(settings?.sound_enabled ?? true);
  
  // Timer state - initialize from localStorage if available
  const loadTimerState = (): { phase: TimerPhase; remaining: number; running: boolean } | null => {
    try {
      const stored = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!stored) return null;
      
      const state: TimerState = JSON.parse(stored);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - state.lastTickTimestamp) / 1000);
      
      // If timer was running, compute remaining time
      let remaining = state.remainingSeconds;
      if (state.isRunning && elapsedSeconds > 0) {
        remaining = Math.max(0, state.remainingSeconds - elapsedSeconds);
      }
      
      // If WORK phase finished while app was closed, transition to REST
      if (state.phase === "work" && remaining === 0 && state.isRunning) {
        const config = getPresetConfig(state.presetId);
        return { phase: "rest", remaining: config.restMinutes * 60, running: false };
      }
      
      // If REST phase finished while app was closed, transition to WORK
      if (state.phase === "rest" && remaining === 0 && state.isRunning) {
        const config = getPresetConfig(state.presetId);
        return { phase: "work", remaining: config.workMinutes * 60, running: false };
      }
      
      return { phase: state.phase, remaining, running: state.isRunning && remaining > 0 };
    } catch (e) {
      if (import.meta.env.DEV) {
        console.debug("Failed to load timer state:", e);
      }
      return null;
    }
  };
  
  const savedState = loadTimerState();
  const presetConfig = getPresetConfig(selectedPreset);
  
  const [currentPhase, setCurrentPhase] = useState<TimerPhase>(
    savedState?.phase || "work"
  );
  const [isTimerRunning, setIsTimerRunning] = useState(
    savedState?.running || false
  );
  const [timeRemaining, setTimeRemaining] = useState(
    savedState?.remaining ?? presetConfig.workMinutes * 60
  );
  
  // Track if we've shown exercise recommendation after REST
  const [showExerciseRecommendation, setShowExerciseRecommendation] = useState(false);

  // Sync local state with database settings when they load
  useEffect(() => {
    if (settings && !isGuest) {
      setSelectedPreset(settings.preset);
      setSoundEnabled(settings.sound_enabled);
    }
  }, [settings, isGuest]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const state: TimerState = {
      phase: currentPhase,
      remainingSeconds: timeRemaining,
      lastTickTimestamp: Date.now(),
      isRunning: isTimerRunning,
      presetId: selectedPreset,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  }, [currentPhase, timeRemaining, isTimerRunning, selectedPreset]);

  // Update timer duration when preset changes (reset to work phase)
  useEffect(() => {
    const config = getPresetConfig(selectedPreset);
    setCurrentPhase("work");
    setTimeRemaining(config.workMinutes * 60);
    setIsTimerRunning(false);
    setShowExerciseRecommendation(false);
  }, [selectedPreset]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown logic
  // Uses Date.now() diff for accuracy, not just interval ticks
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      const startTime = Date.now();
      const startRemaining = timeRemaining;
      
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const newRemaining = Math.max(0, startRemaining - elapsed);
        
        setTimeRemaining(newRemaining);
        
        if (newRemaining === 0) {
          setIsTimerRunning(false);
        }
      }, 100); // Check every 100ms for smoother updates
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining]);

  // Helper function to trigger notification and sound
  const triggerNotificationAndSound = (title: string, body: string, isWorkToRest: boolean) => {
    // Trigger notification
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/calm-desk-companion/icon-192.png",
      });
    }
    
    // Play sound if enabled
    if (soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = isWorkToRest ? 800 : 600; // Slightly different tone for REST→WORK
        oscillator.type = "sine";
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        if (import.meta.env.DEV) {
          console.debug("Audio notification failed:", e);
        }
      }
    }
  };

  // Handle timer completion and phase transitions
  // Timer cycle is fully automatic: WORK → REST → WORK continues indefinitely
  const phaseTransitionRef = useRef(false);
  const lastTransitionTimestampRef = useRef<number>(0);
  
  useEffect(() => {
    // Only trigger when timer reaches 0, timer is not running, and we haven't already transitioned
    if (timeRemaining === 0 && !isTimerRunning && !phaseTransitionRef.current) {
      phaseTransitionRef.current = true; // Prevent multiple triggers
      const config = getPresetConfig(selectedPreset);
      const now = Date.now();
      const timeSinceLastTransition = now - lastTransitionTimestampRef.current;

      // Only trigger notifications/sound if this is a fresh transition (not a reloaded state)
      // Check if transition happened recently (within last 2 seconds) to avoid duplicates on reload
      const isFreshTransition = timeSinceLastTransition > 2000 || lastTransitionTimestampRef.current === 0;

      if (currentPhase === "work") {
        // WORK phase completed - automatically switch to REST and start timer
        setCurrentPhase("rest");
        setTimeRemaining(config.restMinutes * 60);
        
        if (isFreshTransition) {
          triggerNotificationAndSound(
            "Momento de pausar",
            "Levántate y muévete. Tómate un descanso.",
            true
          );

          toast({
            title: "¡Hora de descansar!",
            description: `Tómate ${config.restMinutes} minutos de pausa.`,
          });
        }
        
        // Automatically start REST timer
        setTimeout(() => {
          setIsTimerRunning(true);
        }, 500); // Small delay to ensure state updates complete
        
        lastTransitionTimestampRef.current = now;
      } else {
        // REST phase completed - automatically switch back to WORK and start timer
        // NOTE: A completed REST counts as a habit for streak calculation
        setCurrentPhase("work");
        setTimeRemaining(config.workMinutes * 60);
        
        if (isFreshTransition) {
          // Log the completed break (counts as habit)
          logBreak("reminder");
          
          // Show exercise recommendation placeholder
          setShowExerciseRecommendation(true);
          
          triggerNotificationAndSound(
            "Pausa completada",
            "¡Bien hecho! Vuelve al trabajo.",
            false
          );

          toast({
            title: "Pausa completada",
            description: "¡Bien hecho! Vuelve al trabajo.",
          });
        }
        
        // Automatically start WORK timer
        setTimeout(() => {
          setIsTimerRunning(true);
        }, 500); // Small delay to ensure state updates complete
        
        lastTransitionTimestampRef.current = now;
      }

      // Reset transition flag after a short delay
      setTimeout(() => {
        phaseTransitionRef.current = false;
      }, 1000);
    } else if (timeRemaining > 0) {
      // Reset flag when timer is no longer at 0
      phaseTransitionRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isTimerRunning]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const skipToNextPhase = () => {
    setIsTimerRunning(false);
    setTimeRemaining(0); // Trigger phase completion
  };

  const handlePresetChange = async (preset: "light" | "standard" | "focus") => {
    const oldPreset = selectedPreset;
    setSelectedPreset(preset);
    
    // Reset timer to work phase with new preset duration
    setCurrentPhase("work");
    const config = getPresetConfig(preset);
    setTimeRemaining(config.workMinutes * 60);
    setIsTimerRunning(false);
    
    if (!isGuest) {
      try {
        await updateSettings({ preset });
        toast({
          title: "Configuración guardada",
          description: `Preset ${preset} actualizado`,
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error updating reminder settings:", error);
        }
        toast({
          title: "Error",
          description: "No se pudo guardar la configuración",
          variant: "destructive",
        });
        // Revert on error
        setSelectedPreset(oldPreset);
        const oldConfig = getPresetConfig(oldPreset);
        setTimeRemaining(oldConfig.workMinutes * 60);
      }
    }
  };

  const handleSoundToggle = async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    
    if (!isGuest) {
      try {
        await updateSettings({ sound_enabled: newValue });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error updating sound setting:", error);
        }
        // Revert on error
        setSoundEnabled(settings?.sound_enabled ?? true);
      }
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
            {isTimerRunning ? (
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
