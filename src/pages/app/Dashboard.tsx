import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  Activity, 
  Droplets, 
  Play, 
  AlertTriangle,
  ChevronRight,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data - replace with actual data from state/database
  const todayStats = {
    remindersCompleted: 4,
    remindersTotal: 8,
    streak: 7,
    lastPainLevel: 3,
    hydrationCount: 5,
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
          className="bg-card rounded-2xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-heading text-foreground">
            {todayStats.remindersCompleted}/{todayStats.remindersTotal}
          </p>
          <p className="text-xs text-muted-foreground">Pausas hoy</p>
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
            {todayStats.streak}
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
            {todayStats.lastPainLevel}/10
          </p>
          <p className="text-xs text-muted-foreground">Último dolor</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-card rounded-2xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Droplets className="h-4 w-4 text-success" />
            </div>
          </div>
          <p className="text-2xl font-heading text-foreground">
            {todayStats.hydrationCount}
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
          <Button variant="warm" size="lg" className="justify-start h-auto py-4" asChild>
            <Link to="/app/reminders">
              <Play className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Iniciar pausa</p>
                <p className="text-xs opacity-80">Toma un descanso ahora</p>
              </div>
            </Link>
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
