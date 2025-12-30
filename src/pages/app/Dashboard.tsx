import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Droplets, 
  Play, 
  Target,
  Plus,
  Minus,
  Loader2,
  Clock,
  Pause,
  Brain
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useManualBreakAdjustments } from "@/hooks/useManualBreakAdjustments";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";
import { useFocusTimer } from "@/contexts/FocusTimerContext";

const Dashboard = () => {
  const { toast } = useToast();
  const stats = useDashboardStats();
  const { addWaterGlass, removeWaterGlass, isAdding: isAddingWater } = useWaterLogs();
  const { adjustToday } = useManualBreakAdjustments();
  const { 
    isRunning = false, 
    timeRemaining = 0, 
    currentPhase = "work", 
    selectedPreset = "standard", 
    formatTime, 
    getPresetConfig 
  } = useFocusTimer();
  
  // Defensive: ensure formatTime exists and handles edge cases
  const safeFormatTime = (seconds: number | undefined | null): string => {
    if (formatTime && typeof formatTime === 'function') {
      return formatTime(seconds ?? 0);
    }
    // Fallback formatter
    const safeSeconds = Math.max(0, seconds ?? 0);
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get preset config (getPresetConfig has built-in fallback to standard)
  const currentPreset = (getPresetConfig && typeof getPresetConfig === 'function') 
    ? getPresetConfig(selectedPreset) 
    : { name: "Ritmo Balanceado", workMinutes: 45, restMinutes: 5 };

  const handleAddWater = () => {
    addWaterGlass();
    toast({
      title: "Vaso de agua agregado",
      description: "¡Bien hecho! Mantente hidratado.",
    });
  };

  const handleRemoveWater = () => {
    removeWaterGlass();
    toast({
      title: "Vaso de agua removido",
      description: "Ajuste realizado.",
    });
  };

  const handleAdjustBreak = (delta: number) => {
    adjustToday(delta);
    toast({
      title: delta > 0 ? "Pausa agregada" : "Pausa removida",
      description: "Ajuste manual realizado.",
    });
  };

  // Today's stats
  const todayStats = useMemo(() => ({
    breaks: stats.breaksToday,
    water: stats.waterToday,
    timerBreaks: stats.timerBreaksToday,
    manualAdjustment: stats.manualAdjustment,
  }), [stats.breaksToday, stats.waterToday, stats.timerBreaksToday, stats.manualAdjustment]);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="font-heading text-2xl lg:text-3xl text-foreground">
          ¡Hola! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Tu día de hoy
        </p>
      </motion.div>

      {/* Timer Card - Large, visual only, first element */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isRunning ? "bg-primary/10" : "bg-muted"
            }`}>
              {isRunning ? (
                <Clock className="h-8 w-8 text-primary" />
              ) : (
                <Pause className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <p className="text-4xl font-bold text-foreground mb-2">
              {safeFormatTime(timeRemaining)}
            </p>
            <p className={`text-lg font-medium mb-1 ${
              isRunning ? "text-primary" : "text-muted-foreground"
            }`}>
              {isRunning ? "Estás en foco" : "En pausa"}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentPreset?.name || "Ritmo Balanceado"} • {currentPhase === "work" ? "Trabajo" : "Descanso"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* HOY Section - Primary Focus */}
      <section className="mb-12">
        <h2 className="font-heading text-lg text-foreground mb-4">
          Hoy
        </h2>
        
        {/* Today's Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Pausas hoy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-2xl p-5 border border-border/30 relative group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleAdjustBreak(-1)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  title="Quitar pausa"
                  aria-label="Quitar pausa"
                >
                  <Minus className="h-4 w-4 text-primary" />
                </button>
                <button
                  onClick={() => handleAdjustBreak(1)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  title="Agregar pausa"
                  aria-label="Agregar pausa"
                >
                  <Plus className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>
            <p className="text-3xl font-heading text-foreground mb-1">
              {todayStats.breaks}
            </p>
            <p className="text-sm text-muted-foreground">Pausas completadas</p>
            {todayStats.manualAdjustment !== 0 && (
              <p className="text-xs text-muted-foreground/70 mt-2">
                {todayStats.timerBreaks} automáticas {todayStats.manualAdjustment > 0 ? '+' : ''}{todayStats.manualAdjustment} ajuste
              </p>
            )}
          </motion.div>

          {/* Agua hoy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-card rounded-2xl p-5 border border-border/30 relative group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-success" />
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleRemoveWater}
                  disabled={todayStats.water === 0}
                  className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Quitar vaso de agua"
                  aria-label="Quitar vaso de agua"
                >
                  <Minus className="h-4 w-4 text-success" />
                </button>
                <button
                  onClick={handleAddWater}
                  disabled={isAddingWater}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  title="Agregar vaso de agua"
                  aria-label="Agregar vaso de agua"
                >
                  {isAddingWater ? (
                    <Loader2 className="h-4 w-4 text-success animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 text-success" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-3xl font-heading text-foreground mb-1">
              {todayStats.water}
            </p>
            <p className="text-sm text-muted-foreground">Vasos de agua</p>
          </motion.div>
        </div>

        {/* Quick Actions - Today's Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-heading text-base text-foreground/80 mb-3">
            ¿Qué querés hacer hoy?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Dolor */}
            <Button variant="outline" size="lg" className="justify-start h-auto py-4" asChild>
              <Link to="/app/pain">
                <Activity className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Registrar cómo me siento</p>
                  <p className="text-xs text-muted-foreground">Registro corporal</p>
                </div>
              </Link>
            </Button>

            {/* Ejercicios */}
            <Button variant="outline" size="lg" className="justify-start h-auto py-4" asChild>
              <Link to="/app/exercises">
                <Play className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Ejercicio rápido</p>
                  <p className="text-xs text-muted-foreground">2 minutos de movilidad</p>
                </div>
              </Link>
            </Button>

            {/* Meditación - Placeholder */}
            <Button 
              variant="outline" 
              size="lg" 
              className="justify-start h-auto py-4 opacity-50 cursor-not-allowed"
              disabled
            >
              <Brain className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Meditación</p>
                <p className="text-xs text-muted-foreground">Próximamente</p>
              </div>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Dashboard;
