/**
 * Exercise Library
 * 
 * Sample exercises for the exercise engine.
 * In phase 2, this could be loaded from a backend or content management system.
 */

import { Exercise } from "./exerciseTypes";

export const exercises: Exercise[] = [
  {
    id: "neck-rotation",
    name: "Rotación de cuello",
    targetDurationSeconds: 120, // 2 minutes
    preAlert: "Detente si sientes dolor o molestia",
    supportsMusic: true,
    steps: [
      {
        id: "prepare",
        text: "Siéntate con la espalda recta y relaja los hombros",
        durationSeconds: 10,
        type: "posture",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "rotate-right",
        text: "Gira la cabeza suavemente hacia la derecha",
        durationSeconds: 15,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "pause-center",
        text: "Vuelve al centro y respira",
        durationSeconds: 5,
        type: "pause",
        notifyOnStart: false,
        notifyOnEnd: false,
      },
      {
        id: "rotate-left",
        text: "Gira la cabeza suavemente hacia la izquierda",
        durationSeconds: 15,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "pause-center-2",
        text: "Vuelve al centro y respira",
        durationSeconds: 5,
        type: "pause",
        notifyOnStart: false,
        notifyOnEnd: false,
      },
      {
        id: "tilt-forward",
        text: "Inclina la cabeza suavemente hacia adelante",
        durationSeconds: 10,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "tilt-back",
        text: "Inclina la cabeza suavemente hacia atrás",
        durationSeconds: 10,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "breathe",
        text: "Respira profundamente y relaja",
        durationSeconds: 20,
        type: "breathing",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "repeat",
        text: "Repite la secuencia completa",
        durationSeconds: 30,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
    ],
  },
  {
    id: "shoulder-stretch",
    name: "Estiramiento de hombros",
    targetDurationSeconds: 180, // 3 minutes
    preAlert: "Realiza movimientos suaves y controlados",
    supportsMusic: true,
    steps: [
      {
        id: "prepare",
        text: "Siéntate con la espalda recta",
        durationSeconds: 10,
        type: "posture",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "shoulder-roll-up",
        text: "Rueda los hombros hacia arriba y atrás",
        durationSeconds: 20,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "shoulder-roll-down",
        text: "Rueda los hombros hacia abajo y adelante",
        durationSeconds: 20,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "pause",
        text: "Descansa y respira",
        durationSeconds: 10,
        type: "pause",
        notifyOnStart: false,
        notifyOnEnd: false,
      },
      {
        id: "repeat",
        text: "Repite la secuencia",
        durationSeconds: 120,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
    ],
  },
  {
    id: "wrist-stretch",
    name: "Estiramiento de muñecas",
    targetDurationSeconds: 120, // 2 minutes
    preAlert: "Detente si sientes dolor o molestia",
    supportsMusic: true,
    steps: [
      {
        id: "prepare",
        text: "Extiende los brazos frente a ti",
        durationSeconds: 5,
        type: "posture",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "flex-up",
        text: "Flexiona las muñecas hacia arriba",
        durationSeconds: 15,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "flex-down",
        text: "Flexiona las muñecas hacia abajo",
        durationSeconds: 15,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "circles",
        text: "Rota las muñecas en círculos suaves",
        durationSeconds: 30,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "breathe",
        text: "Relaja y respira",
        durationSeconds: 25,
        type: "breathing",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "repeat",
        text: "Repite la secuencia",
        durationSeconds: 30,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
    ],
  },
  {
    id: "lumbar-flex",
    name: "Flexión lumbar sentado",
    targetDurationSeconds: 120, // 2 minutes
    preAlert: "Realiza movimientos suaves y controlados",
    supportsMusic: true,
    steps: [
      {
        id: "prepare",
        text: "Siéntate al borde de la silla con la espalda recta",
        durationSeconds: 10,
        type: "posture",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "forward",
        text: "Inclínate suavemente hacia adelante",
        durationSeconds: 20,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "pause",
        text: "Mantén la posición y respira",
        durationSeconds: 15,
        type: "pause",
        notifyOnStart: false,
        notifyOnEnd: false,
      },
      {
        id: "return",
        text: "Vuelve suavemente a la posición inicial",
        durationSeconds: 10,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "breathe",
        text: "Respira profundamente",
        durationSeconds: 20,
        type: "breathing",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
      {
        id: "repeat",
        text: "Repite la secuencia",
        durationSeconds: 45,
        type: "movement",
        notifyOnStart: true,
        notifyOnEnd: false,
      },
    ],
  },
];

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((ex) => ex.id === id);
}

