import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  Activity, 
  Droplets, 
  Play, 
  AlertTriangle,
  ChevronRight,
  Target,
  Plus,
  Minus,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useBreakLogs } from "@/hooks/useBreakLogs";
import { useManualBreakAdjustments } from "@/hooks/useManualBreakAdjustments";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const { addWaterGlass, removeWaterGlass, isAdding: isAddingWater } = useWaterLogs();
  const { logBreak, isLogging: isLoggingBreak } = useBreakLogs();
  const { adjustToday, resetToday } = useManualBreakAdjustments();
  
  const handleStartFocus = () => {
    // Navigate to reminders with query param to trigger modal
    navigate("/app/reminders?from=dashboard", { replace: false });
  };

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

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-heading text-2xl lg:text-3xl text-foreground">
          ¡Hola! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí está tu resumen de hoy
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl p-4 border border-border/50 relative group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleAdjustBreak(-1)}
                className="p-1.5 rounded-lg hover:bg-muted"
                title="Quitar pausa"
              >
                <Minus className="h-4 w-4 text-primary" />
              </button>
              <button
                onClick={() => handleAdjustBreak(1)}
                className="p-1.5 rounded-lg hover:bg-muted"
                title="Agregar pausa"
              >
                <Plus className="h-4 w-4 text-primary" />
              </button>
            </div>
          </div>
          <p className="text-2xl font-heading text-foreground">
            {stats.breaksToday}
          </p>
          <p className="text-xs text-muted-foreground">Pausas hoy</p>
          {stats.manualAdjustment !== 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {stats.timerBreaksToday} (timer) {stats.manualAdjustment > 0 ? "+" : ""}{stats.manualAdjustment} (ajuste)
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card rounded-2xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Flame className="h-4 w-4 text-secondary" />
            </div>
          </div>
          <p className="text-2xl font-heading text-foreground">
            {stats.streak}
          </p>
          <p className="text-xs text-muted-foreground">Días de racha</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-2xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <p className="text-2xl font-heading text-foreground">
            {stats.lastPain ? `${stats.lastPain.intensity}/10` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {stats.lastPain ? `Último dolor (${stats.lastPain.area})` : "Sin registros"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-card rounded-2xl p-4 border border-border/50 relative group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleRemoveWater}
                disabled={stats.waterToday === 0}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                title="Quitar vaso de agua"
              >
                <Minus className="h-4 w-4 text-success" />
              </button>
              <button
                onClick={handleAddWater}
                disabled={isAddingWater}
                className="p-1.5 rounded-lg hover:bg-muted"
                title="Agregar vaso de agua"
              >
                {isAddingWater ? (
                  <Loader2 className="h-4 w-4 text-success animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 text-success" />
                )}
              </button>
            </div>
          </div>
          <p className="text-2xl font-heading text-foreground">
            {stats.waterToday}
          </p>
          <p className="text-xs text-muted-foreground">Vasos de agua</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="font-heading text-lg text-foreground mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button 
            variant="warm" 
            size="lg" 
            className="justify-start h-auto py-4"
            onClick={handleStartFocus}
            type="button"
          >
            <Play className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Iniciar foco</p>
              <p className="text-xs opacity-80">Elige tu ritmo de trabajo</p>
            </div>
          </Button>
          
          <Button variant="outline" size="lg" className="justify-start h-auto py-4" asChild>
            <Link to="/app/pain">
              <Activity className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Registrar dolor</p>
                <p className="text-xs text-muted-foreground">Cómo te sientes</p>
              </div>
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" className="justify-start h-auto py-4" asChild>
            <Link to="/app/exercises">
              <Play className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Ejercicio 2 min</p>
                <p className="text-xs text-muted-foreground">Movilidad rápida</p>
              </div>
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Red Flags Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-foreground mb-1">
                Señales de alerta
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Consulta a un profesional si experimentas dolor intenso, hormigueo persistente, 
                debilidad o pérdida de sensibilidad.
              </p>
              <button className="text-sm font-medium text-destructive flex items-center gap-1 hover:underline">
                Saber más
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
