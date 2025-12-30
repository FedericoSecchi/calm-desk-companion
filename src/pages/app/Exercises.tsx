import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  Check,
  X,
  Activity,
  Move,
  Wind,
  Brain
} from "lucide-react";
import { ExercisePlayer } from "@/components/ExercisePlayer";
import { getExerciseById } from "@/lib/exercises";
import { Exercise as ExerciseType } from "@/lib/exerciseTypes";

// Map old exercise IDs to new exercise engine IDs
const exerciseIdMap: Record<string, string> = {
  "1": "neck-rotation",
  "2": "shoulder-stretch",
  "3": "lumbar-flex",
  "4": "lumbar-flex",
  "5": "wrist-stretch",
  "6": "wrist-stretch",
  "7": "lumbar-flex",
  "8": "lumbar-flex",
};

// Legacy exercise interface for display (mapped to new engine)
interface ExerciseDisplay {
  id: string;
  name: string;
  duration: string;
  area: string;
  difficulty: "easy" | "medium";
  description: string;
  engineId?: string;
  category: "physical" | "stretch" | "breathing";
}

// Categorize exercises
const physicalExercises: ExerciseDisplay[] = [
  {
    id: "1",
    name: "Rotación de cuello",
    duration: "2 min",
    area: "cervical",
    difficulty: "easy",
    description: "Movimientos suaves para aliviar tensión en el cuello",
    engineId: "neck-rotation",
    category: "physical",
  },
  {
    id: "7",
    name: "Rotación de tronco",
    duration: "3 min",
    area: "lumbar",
    difficulty: "medium",
    description: "Aumenta la movilidad de toda la columna",
    engineId: "lumbar-flex",
    category: "physical",
  },
  {
    id: "6",
    name: "Ejercicio de dedos",
    duration: "1 min",
    area: "wrist",
    difficulty: "easy",
    description: "Mejora la circulación en manos y dedos",
    engineId: "wrist-stretch",
    category: "physical",
  },
];

const stretchExercises: ExerciseDisplay[] = [
  {
    id: "2",
    name: "Estiramiento de hombros",
    duration: "3 min",
    area: "cervical",
    difficulty: "easy",
    description: "Libera la tensión acumulada en hombros y trapecios",
    engineId: "shoulder-stretch",
    category: "stretch",
  },
  {
    id: "3",
    name: "Flexión lumbar sentado",
    duration: "2 min",
    area: "lumbar",
    difficulty: "easy",
    description: "Estira la espalda baja sin levantarte de la silla",
    engineId: "lumbar-flex",
    category: "stretch",
  },
  {
    id: "4",
    name: "Gato-vaca de escritorio",
    duration: "3 min",
    area: "lumbar",
    difficulty: "easy",
    description: "Movilidad de columna adaptada para la oficina",
    engineId: "lumbar-flex",
    category: "stretch",
  },
  {
    id: "5",
    name: "Estiramiento de muñecas",
    duration: "2 min",
    area: "wrist",
    difficulty: "easy",
    description: "Previene el síndrome del túnel carpiano",
    engineId: "wrist-stretch",
    category: "stretch",
  },
  {
    id: "8",
    name: "Estiramiento lateral",
    duration: "2 min",
    area: "lumbar",
    difficulty: "easy",
    description: "Estira los músculos laterales del tronco",
    engineId: "lumbar-flex",
    category: "stretch",
  },
];

const breathingExercises: ExerciseDisplay[] = [
  {
    id: "b1",
    name: "Respiración 4-7-8",
    duration: "2 min",
    area: "general",
    difficulty: "easy",
    description: "Técnica de respiración para calmar la mente y reducir el estrés",
    category: "breathing",
  },
  {
    id: "b2",
    name: "Respiración profunda",
    duration: "3 min",
    area: "general",
    difficulty: "easy",
    description: "Respiración diafragmática para relajación profunda",
    category: "breathing",
  },
];

const Exercises = () => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDisplay | null>(null);
  const [playingExercise, setPlayingExercise] = useState<ExerciseType | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const handleStartExercise = (exercise: ExerciseDisplay) => {
    if (exercise.category === "breathing") {
      // Breathing exercises are placeholders for now
      return;
    }
    
    if (exercise.engineId) {
      const engineExercise = getExerciseById(exercise.engineId);
      if (engineExercise) {
        setPlayingExercise(engineExercise);
        setSelectedExercise(null);
      }
    }
  };

  const handleExerciseComplete = () => {
    if (playingExercise) {
      if (!completedExercises.includes(playingExercise.id)) {
        setCompletedExercises([...completedExercises, playingExercise.id]);
      }
    }
    setPlayingExercise(null);
  };

  const handleExerciseClose = () => {
    setPlayingExercise(null);
  };

  const renderExerciseCard = (exercise: ExerciseDisplay, index: number) => {
    const isCompleted = completedExercises.includes(exercise.id);
    return (
      <motion.button
        key={exercise.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        onClick={() => setSelectedExercise(exercise)}
        className={`text-left p-4 rounded-2xl border-2 transition-all w-full ${
          isCompleted
            ? "border-success/50 bg-success/5"
            : "border-border bg-card hover:border-primary/30 hover:shadow-soft"
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {exercise.duration}
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
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    exercises: ExerciseDisplay[],
    isPlaceholder: boolean = false
  ) => (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="font-heading text-xl text-foreground">{title}</h2>
      </div>
      
      {isPlaceholder ? (
        <div className="bg-card rounded-2xl p-6 border border-border/50 text-center">
          <p className="text-muted-foreground mb-2">Próximamente</p>
          <p className="text-sm text-muted-foreground/70">
            Estamos trabajando en ejercicios de meditación guiada
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {exercises.map((exercise, index) => renderExerciseCard(exercise, index))}
        </div>
      )}
    </motion.section>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[420px] md:max-w-[520px] lg:max-w-[640px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-heading text-2xl lg:text-3xl text-foreground">
          Ejercicios
        </h1>
        <p className="text-muted-foreground mt-1">
          Micro-ejercicios de movilidad para tu bienestar
        </p>
      </motion.div>

      {/* Sección 1: Ejercicios físicos */}
      {renderSection(
        "Ejercicios físicos",
        <Activity className="h-5 w-5 text-primary" />,
        physicalExercises
      )}

      {/* Sección 2: Estiramientos */}
      {renderSection(
        "Estiramientos",
        <Move className="h-5 w-5 text-primary" />,
        stretchExercises
      )}

      {/* Sección 3: Respiración */}
      {renderSection(
        "Respiración",
        <Wind className="h-5 w-5 text-primary" />,
        breathingExercises
      )}

      {/* Sección 4: Meditación */}
      {renderSection(
        "Meditación",
        <Brain className="h-5 w-5 text-primary" />,
        [],
        true // Placeholder
      )}

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
            onClick={(e) => e.stopPropagation()}
            className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-medium border border-border"
          >
            <button
              onClick={() => setSelectedExercise(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {selectedExercise.duration}
            </span>
            
            <h2 className="font-heading text-xl text-foreground mt-4 mb-2">
              {selectedExercise.name}
            </h2>
            
            <p className="text-muted-foreground mb-4">
              {selectedExercise.description}
            </p>
            
            {selectedExercise.category !== "breathing" && (
              <div className="bg-muted rounded-xl p-4 mb-6">
                <h3 className="font-medium text-foreground mb-2">Instrucciones:</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Siéntate con la espalda recta</li>
                  <li>Realiza movimientos suaves y controlados</li>
                  <li>Respira profundamente durante el ejercicio</li>
                  <li>Detente si sientes dolor</li>
                </ol>
              </div>
            )}
            
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
              {selectedExercise.category === "breathing" ? (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled
                >
                  Próximamente
                </Button>
              ) : (
                <Button 
                  variant="hero" 
                  className="flex-1"
                  onClick={() => handleStartExercise(selectedExercise)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Empezar ejercicio
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Exercise Player */}
      {playingExercise && (
        <ExercisePlayer
          exercise={playingExercise}
          onComplete={handleExerciseComplete}
          onClose={handleExerciseClose}
        />
      )}
    </div>
  );
};

export default Exercises;
