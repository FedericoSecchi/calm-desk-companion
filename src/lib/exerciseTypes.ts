/**
 * Exercise Engine Types
 * 
 * Defines the data model for exercises with step-based instructions.
 * This is the foundation for the reusable exercise engine.
 */

export type ExerciseStepType = "posture" | "movement" | "breathing" | "pause";

export interface ExerciseStep {
  id: string;
  text: string; // Instruction shown to user
  durationSeconds: number;
  type: ExerciseStepType;
  notifyOnStart: boolean; // Play subtle sound when step starts
  notifyOnEnd: boolean; // Play subtle sound when step ends
}

export interface Exercise {
  id: string;
  name: string;
  targetDurationSeconds: number; // Total exercise duration (e.g. 120 for 2 min)
  preAlert: string; // Shown before starting (e.g. "Detente si sientes dolor")
  supportsMusic: boolean; // Whether this exercise supports background music
  steps: ExerciseStep[];
}

/**
 * Exercise runtime state
 */
export interface ExerciseState {
  exercise: Exercise;
  currentStepIndex: number;
  stepTimeRemaining: number; // Seconds remaining in current step
  totalTimeRemaining: number; // Seconds remaining in total exercise
  isPlaying: boolean;
  isPaused: boolean;
  musicPlaying: boolean;
}

