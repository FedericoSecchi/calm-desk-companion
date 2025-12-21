import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export const TestimonialSection = () => {
  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="bg-card rounded-3xl p-8 md:p-12 border border-border/50 shadow-medium relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Quote className="h-6 w-6 text-primary" />
              </div>
              
              <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed font-light italic">
                "Después de meses con dolor lumbar constante, empecé a usar Calmo. 
                Los recordatorios sutiles y los ejercicios cortos se integraron perfectamente 
                en mi rutina. Hoy trabajo 8 horas sin molestias."
              </blockquote>
              
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-heading text-lg text-primary">C</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Coti</p>
                  <p className="text-sm text-muted-foreground">Diseñadora UX, trabajo remoto</p>
                </div>
              </div>
              
              <p className="mt-8 text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full inline-block">
                Historia real, nombre cambiado por privacidad
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
