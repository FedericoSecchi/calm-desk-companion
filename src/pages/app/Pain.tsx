import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePainRecords } from "@/hooks/usePainRecords";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const painAreas = [
  { id: "lumbar", label: "Lumbar" },
  { id: "cervical", label: "Cuello" },
  { id: "wrist", label: "Muñecas" },
  { id: "shoulders", label: "Hombros" },
];

const Pain = () => {
  const { toast } = useToast();
  const { isGuest } = useAuth();
  const [painLevel, setPainLevel] = useState(5);
  const [selectedArea, setSelectedArea] = useState("");
  const [note, setNote] = useState("");
  const [daysFilter, setDaysFilter] = useState(30);
  const [localRecords, setLocalRecords] = useState<Array<{ date: string; intensity: number }>>([]);

  // Use Supabase hook for authenticated users, local state for guests
  const { records, isLoading, createRecord, isCreating, createError } = usePainRecords(daysFilter);

  // Aggregate records by day (average intensity per day)
  const chartData = useMemo(() => {
    const dataSource = isGuest ? localRecords : records;
    
    // Group by date and calculate average
    const grouped = dataSource.reduce((acc, record) => {
      const date = new Date(record.created_at || record.date).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, intensities: [] };
      }
      acc[date].intensities.push(record.intensity);
      return acc;
    }, {} as Record<string, { date: string; intensities: number[] }>);

    // Calculate daily averages and sort by date
    return Object.entries(grouped)
      .map(([dateStr, { intensities }]) => ({
        dateStr, // Keep original date string for sorting
        date: new Date(dateStr).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        intensity: Math.round(intensities.reduce((a, b) => a + b, 0) / intensities.length * 10) / 10,
      }))
      .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())
      .map(({ date, intensity }) => ({ date, intensity })); // Remove dateStr from final output
  }, [records, localRecords, isGuest]);

  const handleSubmit = async () => {
    if (!selectedArea) {
      toast({
        title: "Campo requerido",
        description: "Por favor selecciona una zona afectada",
        variant: "destructive",
      });
      return;
    }

    if (painLevel < 1 || painLevel > 10) {
      toast({
        title: "Valor inválido",
        description: "El nivel de dolor debe estar entre 1 y 10",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isGuest) {
        // For guest mode, store locally
        setLocalRecords([
          ...localRecords,
          {
            date: new Date().toISOString(),
            intensity: painLevel,
          },
        ]);
        toast({
          title: "Registro guardado (modo invitado)",
          description: `Dolor nivel ${painLevel} en ${selectedArea}`,
        });
      } else {
        // For authenticated users, save to Supabase
        await createRecord({
          area: selectedArea,
          intensity: painLevel,
          notes: note || undefined,
        });
        toast({
          title: "Registro guardado",
          description: `Dolor nivel ${painLevel} en ${selectedArea}`,
        });
      }

      // Reset form
      setPainLevel(5);
      setSelectedArea("");
      setNote("");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el registro. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
      if (import.meta.env.DEV) {
        console.error("Error saving pain record:", error);
      }
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl text-foreground">Registrar dolor</h1>
        <p className="text-muted-foreground mt-1">¿Cómo te sientes hoy?</p>
      </motion.div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-card rounded-2xl p-6 border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-foreground">Historial de dolor</h2>
            <div className="flex gap-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setDaysFilter(days)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    daysFilter === days
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  domain={[0, 10]}
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="intensity"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

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

        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar registro"
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="text-center text-muted-foreground py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Cargando historial...
        </div>
      )}
    </div>
  );
};

export default Pain;
