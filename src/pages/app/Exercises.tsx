import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  Filter,
  Check,
  X
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  duration: string;
  area: string;
  difficulty: "easy" | "medium";
  description: string;
}

const exercises: Exercise[] = [
  {
    id: "1",
    name: "Rotación de cuello",
    duration: "2 min",
    area: "cervical",
    difficulty: "easy",
    description: "Movimientos suaves para aliviar tensión en el cuello"
  },
  {
    id: "2",
    name: "Estiramiento de hombros",
    duration: "3 min",
    area: "cervical",
    difficulty: "easy",
    description: "Libera la tensión acumulada en hombros y trapecios"
  },
  {
    id: "3",
    name: "Flexión lumbar sentado",
    duration: "2 min",
    area: "lumbar",
    difficulty: "easy",
    description: "Estira la espalda baja sin levantarte de la silla"
  },
  {
    id: "4",
    name: "Gato-vaca de escritorio",
    duration: "3 min",
    area: "lumbar",
    difficulty: "easy",
    description: "Movilidad de columna adaptada para la oficina"
  },
  {
    id: "5",
    name: "Estiramiento de muñecas",
    duration: "2 min",
    area: "wrist",
    difficulty: "easy",
    description: "Previene el síndrome del túnel carpiano"
  },
  {
    id: "6",
    name: "Ejercicio de dedos",
    duration: "1 min",
    area: "wrist",
    difficulty: "easy",
    description: "Mejora la circulación en manos y dedos"
  },
  {
    id: "7",
    name: "Rotación de tronco",
    duration: "3 min",
    area: "lumbar",
    difficulty: "medium",
    description: "Aumenta la movilidad de toda la columna"
  },
  {
    id: "8",
    name: "Estiramiento lateral",
    duration: "2 min",
    area: "lumbar",
    difficulty: "easy",
    description: "Estira los músculos laterales del tronco"
  },
];

const areaLabels: Record<string, string> = {
  cervical: "Cuello",
  lumbar: "Lumbar",
  wrist: "Muñecas",
};

const Exercises = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const filteredExercises = selectedArea
    ? exercises.filter((e) => e.area === selectedArea)
    : exercises;

  const markComplete = (id: string) => {
    if (!completedExercises.includes(id)) {
      setCompletedExercises([...completedExercises, id]);
    }
    setSelectedExercise(null);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="font-heading text-2xl lg:text-3xl text-foreground">
          Ejercicios
        </h1>
        <p className="text-muted-foreground mt-1">
          Micro-ejercicios de movilidad para tu bienestar
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-2 mb-6 overflow-x-auto pb-2"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
          <Filter className="h-4 w-4" />
          Filtrar:
        </div>
        <button
          onClick={() => setSelectedArea(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            selectedArea === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Todos
        </button>
        {Object.entries(areaLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedArea(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedArea === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        ))}
      </motion.div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExercises.map((exercise, index) => {
          const isCompleted = completedExercises.includes(exercise.id);
          return (
            <motion.button
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setSelectedExercise(exercise)}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${
                isCompleted
                  ? "border-success/50 bg-success/5"
                  : "border-border bg-card hover:border-primary/30 hover:shadow-soft"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {areaLabels[exercise.area]}
                </span>
                {isCompleted && (
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <Check className="h-4 w-4 text-success-foreground" />
                  </div>
                )}
              </div>
              <h3 className="font-heading text-lg text-foreground mb-1">
                {exercise.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {exercise.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {exercise.duration}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Exercise Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExercise(null)}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-medium border border-border"
          >
            <button
              onClick={() => setSelectedExercise(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {areaLabels[selectedExercise.area]}
            </span>
            
            <h2 className="font-heading text-xl text-foreground mt-4 mb-2">
              {selectedExercise.name}
            </h2>
            
            <p className="text-muted-foreground mb-4">
              {selectedExercise.description}
            </p>
            
            <div className="bg-muted rounded-xl p-4 mb-6">
              <h3 className="font-medium text-foreground mb-2">Instrucciones:</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Siéntate con la espalda recta</li>
                <li>Realiza movimientos suaves y controlados</li>
                <li>Respira profundamente durante el ejercicio</li>
                <li>Detente si sientes dolor</li>
              </ol>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span className="font-medium">{selectedExercise.duration}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setSelectedExercise(null)}
              >
                Cancelar
              </Button>
              <Button 
                variant="hero" 
                className="flex-1"
                onClick={() => markComplete(selectedExercise.id)}
              >
                <Check className="h-4 w-4 mr-2" />
                Completado
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Exercises;
