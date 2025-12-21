import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Gratis",
    price: "$0",
    period: "para siempre",
    description: "Perfecto para comenzar tu camino al bienestar",
    features: [
      "Recordatorios básicos",
      "5 ejercicios de movilidad",
      "Seguimiento del dolor",
      "Racha diaria",
      "Acceso a comunidad Telegram"
    ],
    cta: "Comenzar gratis",
    variant: "outline" as const,
    popular: false
  },
  {
    name: "Premium",
    price: "$4.99",
    period: "/mes",
    description: "Para quienes quieren el máximo bienestar",
    features: [
      "Todo lo del plan Gratis",
      "Recordatorios personalizados ilimitados",
      "Biblioteca completa de ejercicios (20+)",
      "Análisis avanzado de dolor",
      "Playlists exclusivas de Spotify",
      "Exportar datos de salud",
      "Soporte prioritario"
    ],
    cta: "Próximamente",
    variant: "hero" as const,
    popular: true,
    comingSoon: true
  }
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl text-foreground">
            Planes simples,{" "}
            <span className="text-primary">sin sorpresas</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Comienza gratis y mejora cuando estés listo
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl p-8 border ${
                plan.popular 
                  ? "border-primary shadow-glow" 
                  : "border-border/50 shadow-soft"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Más popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="font-heading text-xl text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-heading text-4xl text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={plan.variant} 
                size="lg" 
                className="w-full"
                disabled={plan.comingSoon}
                asChild={!plan.comingSoon}
              >
                {plan.comingSoon ? (
                  <span>{plan.cta}</span>
                ) : (
                  <Link to="/auth?mode=signup">{plan.cta}</Link>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
