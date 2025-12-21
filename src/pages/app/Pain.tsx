import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const painAreas = [
  { id: "lumbar", label: "Lumbar" },
  { id: "cervical", label: "Cuello" },
  { id: "wrist", label: "Muñecas" },
  { id: "shoulders", label: "Hombros" },
];

const Pain = () => {
  const { toast } = useToast();
  const [painLevel, setPainLevel] = useState(5);
  const [selectedArea, setSelectedArea] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    toast({
      title: "Registro guardado",
      description: `Dolor nivel ${painLevel} en ${selectedArea || "general"}`,
    });
    setPainLevel(5);
    setSelectedArea("");
    setNote("");
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl text-foreground">Registrar dolor</h1>
        <p className="text-muted-foreground mt-1">¿Cómo te sientes hoy?</p>
      </motion.div>

      <div className="space-y-8">
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <label className="font-medium text-foreground mb-4 block">Nivel de dolor: {painLevel}/10</label>
          <input type="range" min="1" max="10" value={painLevel} onChange={(e) => setPainLevel(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Sin dolor</span><span>Dolor intenso</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <label className="font-medium text-foreground mb-4 block">Zona afectada</label>
          <div className="grid grid-cols-2 gap-2">
            {painAreas.map((area) => (
              <button key={area.id} onClick={() => setSelectedArea(area.id)} className={`p-3 rounded-xl border-2 transition-all ${selectedArea === area.id ? "border-primary bg-primary/5" : "border-border"}`}>
                {area.label}
                {selectedArea === area.id && <Check className="h-4 w-4 inline ml-2 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <label className="font-medium text-foreground mb-4 block">Nota (opcional)</label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="¿Qué estabas haciendo?" className="resize-none" />
        </div>

        <Button variant="hero" size="lg" className="w-full" onClick={handleSubmit}>Guardar registro</Button>
      </div>
    </div>
  );
};

export default Pain;
