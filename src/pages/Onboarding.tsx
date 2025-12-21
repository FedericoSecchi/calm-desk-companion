import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { 
  Clock, 
  Target, 
  Activity, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Sun,
  Moon,
  Coffee
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  { id: "schedule", title: "Tu horario de trabajo", description: "¿Cuándo sueles trabajar?" },
  { id: "goal", title: "Tu objetivo principal", description: "¿Qué te gustaría mejorar?" },
  { id: "pain", title: "Zona de mayor molestia", description: "¿Dónde sientes más incomodidad?" },
  { id: "flow", title: "Tu flujo preferido", description: "Elige tu enfoque de ejercicios" },
  { id: "preferences", title: "Preferencias finales", description: "Personaliza tu experiencia" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    workStart: "09:00",
    workEnd: "18:00",
    lunchBreak: true,
    goal: "",
    painArea: "",
    flowMode: "",
    language: "es",
    reduceMotion: false,
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/app");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "schedule":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sun className="h-4 w-4 text-secondary" />
                  Inicio
                </label>
                <input
                  type="time"
                  value={preferences.workStart}
                  onChange={(e) => setPreferences({ ...preferences, workStart: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Moon className="h-4 w-4 text-primary" />
                  Fin
                </label>
                <input
                  type="time"
                  value={preferences.workEnd}
                  onChange={(e) => setPreferences({ ...preferences, workEnd: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, lunchBreak: !preferences.lunchBreak })}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                preferences.lunchBreak 
                  ? "border-primary bg-primary/5" 
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              <Coffee className={`h-5 w-5 ${preferences.lunchBreak ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-left flex-1">
                <p className="font-medium text-foreground">Pausa para almorzar</p>
                <p className="text-sm text-muted-foreground">Pausar recordatorios al mediodía</p>
              </div>
              {preferences.lunchBreak && <Check className="h-5 w-5 text-primary" />}
            </button>
          </div>
        );

      case "goal":
        return (
          <div className="space-y-3">
            {[
              { id: "pain", label: "Reducir dolor", desc: "Aliviar molestias físicas", icon: Activity },
              { id: "productivity", label: "Mejorar productividad", desc: "Trabajar con más energía", icon: Target },
              { id: "both", label: "Ambos", desc: "Bienestar integral", icon: Clock },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setPreferences({ ...preferences, goal: option.id })}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  preferences.goal === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  preferences.goal === option.id ? "bg-primary/20" : "bg-muted"
                }`}>
                  <option.icon className={`h-5 w-5 ${
                    preferences.goal === option.id ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </div>
                {preferences.goal === option.id && <Check className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </div>
        );

      case "pain":
        return (
          <div className="space-y-3">
            {[
              { id: "lumbar", label: "Zona lumbar", desc: "Espalda baja" },
              { id: "cervical", label: "Cuello y cervicales", desc: "Parte superior de la espalda" },
              { id: "wrist", label: "Muñecas y manos", desc: "Síndrome del túnel carpiano" },
              { id: "none", label: "Sin molestias", desc: "Prevención" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setPreferences({ ...preferences, painArea: option.id })}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  preferences.painArea === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                <div className="text-left">
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </div>
                {preferences.painArea === option.id && <Check className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </div>
        );

      case "flow":
        return (
          <div className="space-y-4">
            {[
              { 
                id: "lumbar", 
                label: "Flujo Lumbar", 
                desc: "Ejercicios enfocados en espalda baja y caderas",
                color: "bg-primary/10 text-primary"
              },
              { 
                id: "cervical", 
                label: "Flujo Cervical", 
                desc: "Ejercicios para cuello, hombros y parte superior",
                color: "bg-secondary/10 text-secondary"
              },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setPreferences({ ...preferences, flowMode: option.id })}
                className={`w-full p-6 rounded-2xl border-2 transition-all ${
                  preferences.flowMode === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl ${option.color} flex items-center justify-center mx-auto mb-4`}>
                    <Activity className="h-8 w-8" />
                  </div>
                  <p className="font-heading text-lg text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                </div>
              </button>
            ))}
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card">
              <label className="text-sm font-medium text-foreground mb-3 block">Idioma</label>
              <div className="flex gap-2">
                {[
                  { id: "es", label: "Español" },
                  { id: "en", label: "English" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setPreferences({ ...preferences, language: lang.id })}
                    className={`flex-1 py-3 rounded-lg border-2 transition-all font-medium ${
                      preferences.language === lang.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setPreferences({ ...preferences, reduceMotion: !preferences.reduceMotion })}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                preferences.reduceMotion
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              <div className="text-left">
                <p className="font-medium text-foreground">Reducir movimiento</p>
                <p className="text-sm text-muted-foreground">Desactivar animaciones continuas</p>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors ${
                preferences.reduceMotion ? "bg-primary" : "bg-muted"
              }`}>
                <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform mt-1 ${
                  preferences.reduceMotion ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Logo size="sm" />
        <span className="text-sm text-muted-foreground">
          {currentStep + 1} de {steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-4">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="text-center mb-8 mt-8">
              <h1 className="font-heading text-2xl text-foreground mb-2">
                {steps[currentStep].title}
              </h1>
              <p className="text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="flex-1">
              {renderStepContent()}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pb-4">
          {currentStep > 0 && (
            <Button variant="outline" size="lg" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="hero" 
            size="lg" 
            className="flex-1"
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? "Comenzar" : "Continuar"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
