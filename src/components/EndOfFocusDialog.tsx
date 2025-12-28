/**
 * EndOfFocusDialog Component
 * 
 * Calm, non-blocking UI shown when a REST phase completes (end of focus session).
 * Provides gentle reinforcement and quick actions without pressure.
 */

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Droplets, Activity, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useToast } from "@/hooks/use-toast";

interface EndOfFocusDialogProps {
  open: boolean;
  onClose: () => void;
}

export const EndOfFocusDialog = ({ open, onClose }: EndOfFocusDialogProps) => {
  const navigate = useNavigate();
  const { addWaterGlass } = useWaterLogs();
  const { toast } = useToast();

  const handleAddWater = () => {
    addWaterGlass();
    toast({
      title: "Vaso de agua agregado",
      description: "¡Bien hecho! Mantente hidratado.",
    });
    // Don't close dialog - user might want to do more actions
  };

  const handleGoToExercises = () => {
    onClose();
    navigate("/app/exercises");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Buen trabajo.</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Tomate un momento para resetear.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={handleAddWater}
          >
            <Droplets className="h-5 w-5 mr-3 text-success" />
            <div className="text-left">
              <p className="font-medium">Tomar agua</p>
              <p className="text-xs text-muted-foreground">Agregar vaso de agua</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={handleGoToExercises}
          >
            <Activity className="h-5 w-5 mr-3 text-primary" />
            <div className="text-left">
              <p className="font-medium">Ejercicio corto</p>
              <p className="text-xs text-muted-foreground">Movilidad rápida</p>
            </div>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full mt-2"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>

        {/* DEV-only debug info */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            [DEV] End-of-focus dialog visible
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

