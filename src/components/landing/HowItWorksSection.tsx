import { motion } from "framer-motion";
import { UserPlus, Settings, Leaf } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crea tu cuenta",
    description: "Regístrate en segundos. Sin tarjeta de crédito. Configura tus preferencias de trabajo."
  },
  {
    number: "02",
    icon: Settings,
    title: "Personaliza tus recordatorios",
    description: "Elige la frecuencia y tipo de pausas según tu estilo de trabajo y necesidades."
  },
  {
    number: "03",
    icon: Leaf,
    title: "Desarrolla hábitos saludables",
    description: "Sigue tus recordatorios, realiza ejercicios y registra tu bienestar. Mejora día a día."
  }
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl text-foreground">
            Comienza en{" "}
            <span className="text-secondary">3 simples pasos</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Sin complicaciones. Sin configuraciones técnicas. Solo bienestar.
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
            
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`relative flex items-center gap-8 mb-12 last:mb-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
                    <div className={`flex items-center gap-4 mb-3 ${
                      index % 2 === 0 ? "md:flex-row-reverse" : ""
                    }`}>
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <step.icon className="h-5 w-5 text-secondary" />
                      </div>
                      <span className="font-heading text-2xl text-muted-foreground/50">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-heading text-xl text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Center dot */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                
                {/* Empty space for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
