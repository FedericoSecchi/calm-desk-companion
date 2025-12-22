/**
 * FocusTimerContext
 * 
 * Global timer context for work/rest focus cycles.
 * Timer persists across route changes and continues running independently of page lifecycle.
 * 
 * Features:
 * - Two phases: WORK (countdown to break) and REST (break duration)
 * - Fully automatic cycle: WORK → REST → WORK continues indefinitely
 * - Persists to localStorage and continues accurately after page reload
 * - Notifications and sound on phase transitions
 * - Single source of truth for timer state across the app
 */

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { useBreakLogs } from "@/hooks/useBreakLogs";
import { useToast } from "@/hooks/use-toast";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { useAuth } from "@/contexts/AuthContext";

const TIMER_STORAGE_KEY = "calmo_reminder_timer_state";

export type TimerPhase = "work" | "rest";
export type PresetId = "light" | "standard" | "focus";

export interface PresetConfig {
  id: PresetId;
  name: string;
  interval: string;
  description: string;
  workMinutes: number;
  restMinutes: number;
}

export const presets: PresetConfig[] = [
  { id: "light", name: "Ritmo Suave", interval: "60 min", description: "60 min trabajo · 10 min descanso", workMinutes: 60, restMinutes: 10 },
  { id: "standard", name: "Ritmo Balanceado", interval: "45 min", description: "45 min trabajo · 5 min descanso", workMinutes: 45, restMinutes: 5 },
  { id: "focus", name: "Ritmo Profundo", interval: "90 min", description: "90 min trabajo · 10 min descanso", workMinutes: 90, restMinutes: 10 },
];

interface TimerState {
  phase: TimerPhase;
  remainingSeconds: number;
  lastTickTimestamp: number;
  isRunning: boolean;
  presetId: PresetId;
}

interface FocusTimerContextType {
  // State
  currentPhase: TimerPhase;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  selectedPreset: PresetId;
  soundEnabled: boolean;
  lastRestCompletion: number; // Timestamp of last REST completion (for exercise recommendation)
  providerId: string; // Unique ID to prove single provider instance
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  skipToNextPhase: () => void;
  setPreset: (preset: PresetId) => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  // Helpers
  getPresetConfig: (presetId: PresetId) => PresetConfig;
  formatTime: (seconds: number) => string;
}

const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined);

export const useFocusTimer = () => {
  const context = useContext(FocusTimerContext);
  if (context === undefined) {
    throw new Error("useFocusTimer must be used within a FocusTimerProvider");
  }
  return context;
};

interface FocusTimerProviderProps {
  children: ReactNode;
}

export const FocusTimerProvider = ({ children }: FocusTimerProviderProps) => {
  const { isGuest } = useAuth();
  const { toast } = useToast();
  const { settings, updateSettings } = useReminderSettings();
  const { logBreak } = useBreakLogs();
  
  // Create stable unique ID for this provider instance (proves single provider)
  const getProviderId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `provider-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };
  const providerIdRef = useRef<string>(getProviderId());
  const providerId = providerIdRef.current;
  
  // Log provider ID in DEV mode
  if (import.meta.env.DEV) {
    console.debug("[FocusTimerProvider] Provider ID:", providerId);
  }
  
  // Get preset config helper
  const getPresetConfig = useCallback((presetId: PresetId): PresetConfig => {
    return presets.find(p => p.id === presetId) || presets[1]; // Default to standard
  }, []);

  // Load timer state from localStorage
  const loadTimerState = useCallback((): { phase: TimerPhase; remaining: number; running: boolean } | null => {
    try {
      const stored = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!stored) return null;
      
      const state: TimerState = JSON.parse(stored);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - state.lastTickTimestamp) / 1000);
      
      // If timer was running, compute remaining time
      let remaining = state.remainingSeconds;
      if (state.isRunning && elapsedSeconds > 0) {
        remaining = Math.max(0, state.remainingSeconds - elapsedSeconds);
      }
      
      // If WORK phase finished while app was closed, transition to REST
      if (state.phase === "work" && remaining === 0 && state.isRunning) {
        const config = getPresetConfig(state.presetId);
        return { phase: "rest", remaining: config.restMinutes * 60, running: false };
      }
      
      // If REST phase finished while app was closed, transition to WORK
      if (state.phase === "rest" && remaining === 0 && state.isRunning) {
        const config = getPresetConfig(state.presetId);
        return { phase: "work", remaining: config.workMinutes * 60, running: false };
      }
      
      return { phase: state.phase, remaining, running: state.isRunning && remaining > 0 };
    } catch (e) {
      if (import.meta.env.DEV) {
        console.debug("Failed to load timer state:", e);
      }
      return null;
    }
  }, [getPresetConfig]);

  // Initialize state from settings and localStorage
  const [selectedPreset, setSelectedPreset] = useState<PresetId>(
    settings?.preset || "standard"
  );
  const [soundEnabled, setSoundEnabledState] = useState(settings?.sound_enabled ?? true);
  
  const savedState = loadTimerState();
  const presetConfig = getPresetConfig(selectedPreset);
  
  const [currentPhase, setCurrentPhase] = useState<TimerPhase>(
    savedState?.phase || "work"
  );
  const [isRunning, setIsRunning] = useState(
    savedState?.running || false
  );
  const [timeRemaining, setTimeRemaining] = useState(
    savedState?.remaining ?? presetConfig.workMinutes * 60
  );
  const [lastRestCompletion, setLastRestCompletion] = useState<number>(0);

  // Sync with database settings
  useEffect(() => {
    if (settings && !isGuest) {
      setSelectedPreset(settings.preset);
      setSoundEnabledState(settings.sound_enabled);
    }
  }, [settings, isGuest]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const state: TimerState = {
      phase: currentPhase,
      remainingSeconds: timeRemaining,
      lastTickTimestamp: Date.now(),
      isRunning,
      presetId: selectedPreset,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  }, [currentPhase, timeRemaining, isRunning, selectedPreset]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTransitionRef = useRef(false);
  const lastTransitionTimestampRef = useRef<number>(0);

  // Helper function to trigger notification and sound
  const triggerNotificationAndSound = useCallback((title: string, body: string, isWorkToRest: boolean) => {
    // Trigger notification
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
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
        
        oscillator.frequency.value = isWorkToRest ? 800 : 600;
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
  }, [soundEnabled]);

  // Countdown alert tracking
  const countdownAlertsRef = useRef<Set<number>>(new Set());
  const lastCountdownSecondRef = useRef<number>(-1);

  // Helper to play subtle countdown sound
  const playCountdownSound = useCallback((seconds: number) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequency based on urgency (higher = more urgent)
      oscillator.frequency.value = seconds <= 3 ? 1000 : 600;
      oscillator.type = "sine";
      
      // Very subtle sound for countdown
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.debug("Countdown sound failed:", e);
      }
    }
  }, [soundEnabled]);

  // Timer countdown logic - uses Date.now() diff for accuracy
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      const startTime = Date.now();
      const startRemaining = timeRemaining;
      
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const newRemaining = Math.max(0, startRemaining - elapsed);
        const currentSecond = Math.floor(newRemaining);
        
        setTimeRemaining(newRemaining);
        
        // Countdown alerts at 10, 5, 3, 2, 1 seconds
        const alertSeconds = [10, 5, 3, 2, 1];
        if (alertSeconds.includes(currentSecond) && currentSecond !== lastCountdownSecondRef.current) {
          lastCountdownSecondRef.current = currentSecond;
          playCountdownSound(currentSecond);
          
          // Show subtle toast for final seconds (1-3)
          if (currentSecond <= 3) {
            toast({
              title: `${currentSecond} segundo${currentSecond > 1 ? 's' : ''}`,
              description: currentSecond === 1 
                ? (currentPhase === "work" ? "¡Momento de descansar!" : "¡Vuelve al trabajo!")
                : undefined,
              duration: 1000,
            });
          }
        }
        
        if (newRemaining === 0) {
          setIsRunning(false);
          lastCountdownSecondRef.current = -1; // Reset for next phase
        }
      }, 100); // Check every 100ms for smoother updates
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastCountdownSecondRef.current = -1; // Reset when paused
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, currentPhase, playCountdownSound, toast]);

  // Handle timer completion and phase transitions
  useEffect(() => {
    if (timeRemaining === 0 && !isRunning && !phaseTransitionRef.current) {
      phaseTransitionRef.current = true;
      const config = getPresetConfig(selectedPreset);
      const now = Date.now();
      const timeSinceLastTransition = now - lastTransitionTimestampRef.current;

      // Only trigger notifications/sound if this is a fresh transition
      const isFreshTransition = timeSinceLastTransition > 2000 || lastTransitionTimestampRef.current === 0;

      if (currentPhase === "work") {
        // WORK phase completed - automatically switch to REST and start timer
        setCurrentPhase("rest");
        setTimeRemaining(config.restMinutes * 60);
        
        if (isFreshTransition) {
          triggerNotificationAndSound(
            "Momento de pausar",
            "Levántate y muévete. Tómate un descanso.",
            true
          );

          toast({
            title: "¡Hora de descansar!",
            description: `Tómate ${config.restMinutes} minutos de pausa.`,
          });
        }
        
        // Automatically start REST timer
        setTimeout(() => {
          setIsRunning(true);
        }, 500);
        
        lastTransitionTimestampRef.current = now;
      } else {
        // REST phase completed - automatically switch back to WORK and start timer
        setCurrentPhase("work");
        setTimeRemaining(config.workMinutes * 60);
        setLastRestCompletion(now); // Record timestamp of REST completion
        
        if (isFreshTransition) {
          // Log the completed break (counts as habit)
          logBreak("reminder");
          
          triggerNotificationAndSound(
            "Pausa completada",
            "¡Bien hecho! Vuelve al trabajo.",
            false
          );

          toast({
            title: "Pausa completada",
            description: "¡Bien hecho! Vuelve al trabajo.",
          });
        }
        
        // Automatically start WORK timer
        setTimeout(() => {
          setIsRunning(true);
        }, 500);
        
        lastTransitionTimestampRef.current = now;
      }

      // Reset transition flag after a short delay
      setTimeout(() => {
        phaseTransitionRef.current = false;
      }, 1000);
    } else if (timeRemaining > 0) {
      phaseTransitionRef.current = false;
    }
  }, [timeRemaining, isRunning, currentPhase, selectedPreset, getPresetConfig, triggerNotificationAndSound, toast, logBreak]);

  // Actions
  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const skipToNextPhase = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(0); // Trigger phase completion
  }, []);

  const setPreset = useCallback(async (preset: PresetId) => {
    const oldPreset = selectedPreset;
    setSelectedPreset(preset);
    
    // Reset timer to work phase with new preset duration
    const config = getPresetConfig(preset);
    setCurrentPhase("work");
    setTimeRemaining(config.workMinutes * 60);
    setIsRunning(false);
    
    if (!isGuest) {
      try {
        await updateSettings({ preset });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error updating reminder settings:", error);
        }
        // Revert on error
        setSelectedPreset(oldPreset);
        const oldConfig = getPresetConfig(oldPreset);
        setTimeRemaining(oldConfig.workMinutes * 60);
        throw error; // Re-throw so caller can handle
      }
    }
  }, [isGuest, updateSettings, selectedPreset, getPresetConfig]);

  const setSoundEnabled = useCallback(async (enabled: boolean) => {
    setSoundEnabledState(enabled);
    
    if (!isGuest) {
      try {
        await updateSettings({ sound_enabled: enabled });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error updating sound setting:", error);
        }
      }
    }
  }, [isGuest, updateSettings]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const value: FocusTimerContextType = {
    currentPhase,
    timeRemaining,
    isRunning,
    selectedPreset,
    soundEnabled,
    lastRestCompletion,
    providerId,
    startTimer,
    pauseTimer,
    toggleTimer,
    skipToNextPhase,
    setPreset,
    setSoundEnabled,
    getPresetConfig,
    formatTime,
  };

  return (
    <FocusTimerContext.Provider value={value}>
      {children}
    </FocusTimerContext.Provider>
  );
};

