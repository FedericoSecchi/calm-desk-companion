import { motion } from "framer-motion";

const FloatingShape = ({ 
  className, 
  delay = 0,
  duration = 8 
}: { 
  className?: string;
  delay?: number;
  duration?: number;
}) => (
  <motion.div
    className={className}
    initial={{ y: 0, scale: 1, opacity: 0.4 }}
    animate={{ 
      y: [-20, 20, -20], 
      scale: [1, 1.05, 1],
      opacity: [0.4, 0.6, 0.4]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

export const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: 'var(--gradient-calm)',
        }}
      />
      
      {/* Floating shapes */}
      <FloatingShape 
        className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-warm/20 blur-3xl"
        delay={0}
        duration={10}
      />
      <FloatingShape 
        className="absolute top-40 left-[10%] w-80 h-80 rounded-full bg-primary/15 blur-3xl"
        delay={2}
        duration={12}
      />
      <FloatingShape 
        className="absolute bottom-20 right-[25%] w-96 h-96 rounded-full bg-success/10 blur-3xl"
        delay={4}
        duration={14}
      />
      <FloatingShape 
        className="absolute bottom-40 left-[20%] w-72 h-72 rounded-full bg-secondary/20 blur-3xl"
        delay={1}
        duration={11}
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};
