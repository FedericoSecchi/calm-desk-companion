import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-50" style={{ background: 'var(--gradient-calm)' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
            Comienza a cuidar tu bienestar hoy
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Únete a cientos de trabajadores remotos que ya están mejorando su postura y bienestar con Calmo.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth?mode=signup">
              Crear cuenta gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
