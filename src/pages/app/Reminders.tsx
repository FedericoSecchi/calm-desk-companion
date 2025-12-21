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
  Loader2
} from "lucide-react";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const presets = [
  { id: "light", name: "Ligero", interval: "45-60 min", description: "Para días intensos" },
  { id: "standard", name: "Estándar", interval: "30-45 min", description: "Recomendado" },
  { id: "focus", name: "Enfoque", interval: "60-90 min", description: "Trabajo profundo" },
];

const Reminders = () => {
  const { isGuest } = useAuth();
  const { toast } = useToast();
  const { settings, isLoading, updateSettings, isUpdating } = useReminderSettings();
  
  // Use settings from database if available, otherwise use local state
  const [selectedPreset, setSelectedPreset] = useState<"light" | "standard" | "focus">(
    settings?.preset || "standard"
  );
  const [soundEnabled, setSoundEnabled] = useState(settings?.sound_enabled ?? true);
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds

  // Sync local state with database settings when they load
  useEffect(() => {
    if (settings && !isGuest) {
      setSelectedPreset(settings.preset);
      setSoundEnabled(settings.sound_enabled);
    }
  }, [settings, isGuest]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            // Timer completed - could trigger notification here
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
  }, [isTimerRunning]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const skipTimer = () => {
    setTimeRemaining(30 * 60);
    setIsTimerRunning(false);
  };

  const handlePresetChange = async (preset: "light" | "standard" | "focus") => {
    setSelectedPreset(preset);
    
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
        setSelectedPreset(settings?.preset || "standard");
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
        className="bg-card rounded-3xl p-8 border border-border/50 shadow-soft mb-8 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Clock className="h-12 w-12 text-primary" />
        </div>
        
        <p className="text-6xl font-heading text-foreground mb-2">
          {formatTime(timeRemaining)}
        </p>
        <p className="text-muted-foreground mb-8">
          {isTimerRunning ? "Hasta tu próxima pausa" : "Timer en pausa"}
        </p>
        
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
            onClick={skipTimer}
            className="h-12 w-12 rounded-xl"
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
