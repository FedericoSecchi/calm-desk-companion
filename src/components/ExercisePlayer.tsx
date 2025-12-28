/**
 * ExercisePlayer Component
 * 
 * Reusable exercise engine that plays step-based exercises with timers,
 * notifications, and optional background music.
 * 
 * Runs in parallel with REST phase timer (does not pause it).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  SkipForward, 
  X,
  Music,
  Music2
} from "lucide-react";
import { Exercise, ExerciseState } from "@/lib/exerciseTypes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ExercisePlayerProps {
  exercise: Exercise;
  onComplete: () => void;
  onClose: () => void;
}

export const ExercisePlayer = ({ exercise, onComplete, onClose }: ExercisePlayerProps) => {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showPreAlert, setShowPreAlert] = useState(true);
  const [state, setState] = useState<ExerciseState>(() => {
    const firstStep = exercise.steps[0];
    return {
      exercise,
      currentStepIndex: 0,
      stepTimeRemaining: firstStep.durationSeconds,
      totalTimeRemaining: exercise.targetDurationSeconds,
      isPlaying: false,
      isPaused: false,
      musicPlaying: false,
    };
  });

  // Show preAlert on mount
  useEffect(() => {
    if (showPreAlert && exercise.preAlert) {
      toast({
        title: "Antes de empezar",
        description: exercise.preAlert,
        duration: 4000,
      });
    }
  }, [showPreAlert, exercise.preAlert, toast]);

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Play subtle sound for step notifications
  const playStepSound = useCallback((isStart: boolean) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Subtle, calm sound
      oscillator.frequency.value = isStart ? 600 : 500;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Silently fail if audio context not available
      if (import.meta.env.DEV) {
        console.debug("Step sound failed:", e);
      }
    }
  }, []);

  // Handle step completion
  const advanceStep = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentStepIndex + 1;
      
      // Check if exercise is complete
      if (nextIndex >= prev.exercise.steps.length || prev.totalTimeRemaining <= 0) {
        // Exercise complete
        playStepSound(false); // Soft end sound
        toast({
          title: "Buen trabajo",
          description: "Volvemos al descanso",
        });
        onComplete();
        return prev;
      }

      const nextStep = prev.exercise.steps[nextIndex];
      const stepDuration = Math.min(nextStep.durationSeconds, prev.totalTimeRemaining);
      
      // Notify on step start if configured
      if (nextStep.notifyOnStart) {
        playStepSound(true);
      }

      return {
        ...prev,
        currentStepIndex: nextIndex,
        stepTimeRemaining: stepDuration,
      };
    });
  }, [exercise.steps, onComplete, playStepSound, toast]);

  // Ref to track if step completion has been handled (prevents double-triggering)
  const stepCompletedRef = useRef(false);

  // Timer countdown logic - uses Date.now() diff for accuracy
  useEffect(() => {
    if (state.isPlaying && !state.isPaused && state.totalTimeRemaining > 0) {
      const startTime = Date.now();
      const startTotal = state.totalTimeRemaining;
      const startStep = state.stepTimeRemaining;
      stepCompletedRef.current = false;

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const newTotal = Math.max(0, startTotal - elapsed);
        const newStep = Math.max(0, startStep - elapsed);

        setState((prev) => {
          // Check if current step is complete (only trigger once)
          if (newStep === 0 && !stepCompletedRef.current && prev.stepTimeRemaining > 0) {
            stepCompletedRef.current = true;
            // Step completed, advance after a brief delay
            setTimeout(() => advanceStep(), 100);
            return { ...prev, stepTimeRemaining: 0, totalTimeRemaining: newTotal };
          }

          return {
            ...prev,
            stepTimeRemaining: newStep,
            totalTimeRemaining: newTotal,
          };
        });

        // Check if exercise is complete
        if (newTotal === 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          playStepSound(false);
          toast({
            title: "Buen trabajo",
            description: "Volvemos al descanso",
          });
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stepCompletedRef.current = false;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stepCompletedRef.current = false;
    };
  }, [state.isPlaying, state.isPaused, state.totalTimeRemaining, state.stepTimeRemaining, advanceStep, playStepSound, toast, onComplete]);

  // Music control (local relaxation loop)
  const toggleMusic = useCallback(() => {
    if (!exercise.supportsMusic) return;

    setState((prev) => {
      const newMusicState = !prev.musicPlaying;
      
      // In a real implementation, you would load and play a local audio file here
      // For now, we just track the state
      if (import.meta.env.DEV) {
        console.debug(`[ExercisePlayer] Music ${newMusicState ? 'playing' : 'stopped'}`);
      }

      return { ...prev, musicPlaying: newMusicState };
    });
  }, [exercise.supportsMusic]);

  // Stop music on unmount or exercise end
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleStart = useCallback(() => {
    setShowPreAlert(false);
    setState((prev) => ({ ...prev, isPlaying: true }));
    
    // Notify first step start
    const firstStep = exercise.steps[0];
    if (firstStep.notifyOnStart) {
      playStepSound(true);
    }
  }, [exercise.steps, playStepSound]);

  const currentStep = exercise.steps[state.currentStepIndex];
  const stepProgress = currentStep 
    ? ((currentStep.durationSeconds - state.stepTimeRemaining) / currentStep.durationSeconds) * 100
    : 0;
  const totalProgress = ((exercise.targetDurationSeconds - state.totalTimeRemaining) / exercise.targetDurationSeconds) * 100;

  // Pre-alert screen (before exercise starts)
  if (showPreAlert) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card rounded-2xl p-6 max-w-md w-full shadow-lg border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl text-foreground">{exercise.name}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {exercise.preAlert && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-foreground">{exercise.preAlert}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={handleStart}
            >
              <Play className="h-4 w-4 mr-2" />
              Empezar
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl p-6 max-w-md w-full shadow-lg border border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl text-foreground">{exercise.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Paso {state.currentStepIndex + 1} de {exercise.steps.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="mb-6">
            <div className="bg-muted rounded-xl p-6 mb-4 text-center">
              <p className="text-lg font-medium text-foreground mb-2">
                {currentStep.text}
              </p>
              <p className="text-3xl font-heading text-primary">
                {formatTime(state.stepTimeRemaining)}
              </p>
            </div>

            {/* Step Progress */}
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${stepProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Total Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Tiempo total</span>
            <span>{formatTime(state.totalTimeRemaining)}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-secondary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              if (state.isPaused) {
                setState((prev) => ({ ...prev, isPaused: false }));
              } else {
                setState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
              }
            }}
            className="flex-1"
            disabled={!state.isPlaying && !state.isPaused}
          >
            {state.isPlaying && !state.isPaused ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {state.isPaused ? "Reanudar" : "Iniciar"}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={advanceStep}
            disabled={!state.isPlaying}
            className="flex-1"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Saltar paso
          </Button>

          {exercise.supportsMusic && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMusic}
              className={cn(state.musicPlaying && "bg-primary/10")}
            >
              {state.musicPlaying ? (
                <Music className="h-4 w-4" />
              ) : (
                <Music2 className="h-4 w-4 opacity-50" />
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

