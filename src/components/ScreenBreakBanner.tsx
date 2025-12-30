/**
 * ScreenBreakBanner Component
 * 
 * Displays a 20-20-20 screen break prompt during WORK phase.
 * Shows a countdown and allows dismissal or snooze.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Clock } from "lucide-react";
import { useFocusTimer } from "@/contexts/FocusTimerContext";

export const ScreenBreakBanner = () => {
  const { screenBreak, dismissScreenBreak, snoozeScreenBreak, currentPhase, isRunning } = useFocusTimer();

  // Only show during WORK phase
  if (!screenBreak.isOpen || currentPhase !== "work") {
    return null;
  }

  return (
    <AnimatePresence>
      {screenBreak.isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 right-0 z-50 px-4 pt-4 lg:pt-6"
          role="alert"
          aria-live="polite"
        >
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border/50 rounded-xl p-4 shadow-lg">
              {/* Pre-alert message */}
              <p className="text-xs text-muted-foreground mb-3 text-center">
                Si te molesta o te duele, ignorálo y seguí normal
              </p>
              
              {/* Main content */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground mb-1">
                      Regla 20-20-20: mirá 20s a 6 metros
                    </p>
                    <p 
                      className="text-sm text-muted-foreground"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {isRunning ? `${screenBreak.countdownSeconds}s` : "Pausado"}
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={snoozeScreenBreak}
                    className="text-xs"
                    aria-label="Posponer 5 minutos"
                  >
                    Posponer 5 min
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={dismissScreenBreak}
                    className="text-xs"
                    aria-label="Listo, completado"
                  >
                    Listo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

