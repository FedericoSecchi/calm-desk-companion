/**
 * AUDIT: Reminders Component
 * 
 * Previous Issues (Fixed):
 * - Preset buttons changed state but didn't update timer durations
 * - Timer was hardcoded to 30 minutes regardless of preset
 * - No distinction between WORK and REST phases
 * - SkipForward button had unclear purpose
 * - No notifications when work timer completed
 * 
 * Current Implementation:
 * - Timer has two phases: WORK (countdown to break) and REST (break duration)
 * - Presets define both work and rest durations
 * - When WORK completes, automatically switches to REST phase
 * - When REST completes, switches back to WORK and logs a break
 * - SkipForward button skips to next phase
 * - Notifications fire when WORK phase completes
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
  Briefcase
} from "lucide-react";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useBreakLogs } from "@/hooks/useBreakLogs";

type TimerPhase = "work" | "rest";

interface PresetConfig {
  id: "light" | "standard" | "focus";
  name: string;
  interval: string;
  description: string;
  workMinutes: number; // Work duration in minutes
  restMinutes: number; // Rest duration in minutes
}

const presets: PresetConfig[] = [
  { id: "light", name: "Ligero", interval: "45-60 min", description: "Para días intensos", workMinutes: 60, restMinutes: 10 },
  { id: "standard", name: "Estándar", interval: "30-45 min", description: "Recomendado", workMinutes: 45, restMinutes: 5 },
  { id: "focus", name: "Enfoque", interval: "60-90 min", description: "Trabajo profundo", workMinutes: 90, restMinutes: 10 },
];

const Reminders = () => {
  const { isGuest } = useAuth();
  const { toast } = useToast();
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
  
  // Timer state
  const [currentPhase, setCurrentPhase] = useState<TimerPhase>("work");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const presetConfig = getPresetConfig(selectedPreset);
  const [timeRemaining, setTimeRemaining] = useState(presetConfig.workMinutes * 60); // Start with work time

  // Sync local state with database settings when they load
  useEffect(() => {
    if (settings && !isGuest) {
      setSelectedPreset(settings.preset);
      setSoundEnabled(settings.sound_enabled);
    }
  }, [settings, isGuest]);

  // Update timer duration when preset changes
  useEffect(() => {
    const config = getPresetConfig(selectedPreset);
    if (currentPhase === "work") {
      setTimeRemaining(config.workMinutes * 60);
    } else {
      setTimeRemaining(config.restMinutes * 60);
    }
    setIsTimerRunning(false); // Reset timer when preset changes
  }, [selectedPreset]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown logic
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false); // Stop timer when it reaches 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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

  // Handle timer completion and phase transitions
  const phaseTransitionRef = useRef(false);
  
  useEffect(() => {
    // Only trigger when timer reaches 0, timer was running, and we haven't already transitioned
    if (timeRemaining === 0 && !isTimerRunning && !phaseTransitionRef.current) {
      phaseTransitionRef.current = true; // Prevent multiple triggers
      const config = getPresetConfig(selectedPreset);

      if (currentPhase === "work") {
        // WORK phase completed - switch to REST
        setCurrentPhase("rest");
        setTimeRemaining(config.restMinutes * 60);
        
        // Trigger notification
        if (Notification.permission === "granted") {
          new Notification("Momento de pausar", {
            body: "Levántate y muévete. Tómate un descanso.",
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
            
            oscillator.frequency.value = 800;
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

        toast({
          title: "¡Hora de descansar!",
          description: `Tómate ${config.restMinutes} minutos de pausa.`,
        });
      } else {
        // REST phase completed - switch back to WORK and log break
        setCurrentPhase("work");
        setTimeRemaining(config.workMinutes * 60);
        
        // Log the completed break
        logBreak("reminder");
        
        toast({
          title: "Pausa completada",
          description: "¡Bien hecho! Vuelve al trabajo.",
        });
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
              : `Vuelve al trabajo en ${presetConfig.workMinutes} min`}
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
