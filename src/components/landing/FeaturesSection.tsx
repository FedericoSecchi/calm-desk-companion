import { motion } from "framer-motion";
import { Bell, Activity, Dumbbell, TrendingUp, Music, Users } from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "Recordatorios inteligentes",
    description: "Pausas personalizadas según tu flujo de trabajo. Sin interrupciones molestas."
  },
  {
    icon: Dumbbell,
    title: "Ejercicios de movilidad",
    description: "Biblioteca de micro-ejercicios para cuello, espalda y muñecas. 2-5 minutos."
  },
  {
    icon: Activity,
    title: "Seguimiento del dolor",
    description: "Registra y visualiza tu progreso. Entiende patrones y mejora."
  },
  {
    icon: TrendingUp,
    title: "Sistema de rachas",
    description: "Mantén la consistencia con hábitos diarios y celebra tu progreso."
  },
  {
    icon: Music,
    title: "Playlists para enfoque",
    description: "Música seleccionada para concentración y relajación durante el trabajo."
  },
  {
    icon: Users,
    title: "Comunidad de apoyo",
    description: "Conecta con otros trabajadores remotos en nuestro grupo de Telegram."
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-surface">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl text-foreground">
            Todo lo que necesitas para{" "}
            <span className="text-primary">trabajar mejor</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Herramientas simples pero poderosas para cuidar tu bienestar físico mientras trabajas
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/20 hover:shadow-medium transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
