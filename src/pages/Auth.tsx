import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { HeroBackground } from "@/components/HeroBackground";
import { Mail, Lock, ArrowRight, Loader2, Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

type AuthMode = "login" | "signup" | "magic-link";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/app", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      toast({
        title: "Configuración requerida",
        description: "La autenticación no está configurada. Por favor, contacta al administrador.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (mode === "magic-link") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}${import.meta.env.PROD ? "/calm-desk-companion" : ""}/auth/callback`,
          },
        });

        if (error) throw error;

        toast({
          title: "Enlace enviado",
          description: "Revisa tu correo electrónico para iniciar sesión.",
        });
        setIsLoading(false);
        return;
      }

      let error;
      if (mode === "signup") {
        const result = await signUp(email, password);
        error = result.error;
        
        if (!error) {
          toast({
            title: "Cuenta creada",
            description: "Revisa tu correo para confirmar tu cuenta.",
          });
          // Don't navigate yet, wait for email confirmation
          setIsLoading(false);
          return;
        }
      } else {
        const result = await signIn(email, password);
        error = result.error;
      }

      if (error) {
        throw error;
      }

      // Success - navigation will happen via useEffect when user state updates
      if (mode === "signup") {
        navigate("/onboarding");
      } else {
        navigate("/app");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Navigation will happen via OAuth callback
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar sesión con Google.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <HeroBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-medium">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          
          <h1 className="font-heading text-2xl text-center text-foreground mb-2">
            {mode === "login" && "Bienvenido de vuelta"}
            {mode === "signup" && "Crea tu cuenta"}
            {mode === "magic-link" && "Inicio sin contraseña"}
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-8">
            {mode === "login" && "Ingresa tus credenciales para continuar"}
            {mode === "signup" && "Comienza tu camino hacia el bienestar"}
            {mode === "magic-link" && "Te enviaremos un enlace a tu correo"}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            {mode !== "magic-link" && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}
            
            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" && "Iniciar sesión"}
                  {mode === "signup" && "Crear cuenta"}
                  {mode === "magic-link" && "Enviar enlace"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">o continúa con</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <Chrome className="h-4 w-4" />
              Google
            </Button>
            
            {/* Apple login placeholder - not enabled yet */}
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              disabled
              title="Próximamente"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.08-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </Button>
            
            {mode !== "magic-link" && (
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-full"
                onClick={() => setMode("magic-link")}
                disabled={isLoading}
              >
                <Mail className="h-4 w-4" />
                Enlace mágico (sin contraseña)
              </Button>
            )}
          </div>
          
          <div className="mt-6 text-center text-sm">
            {mode === "login" ? (
              <p className="text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <button 
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Regístrate
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <button 
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Inicia sesión
                </button>
              </p>
            )}
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-6">
          Al continuar, aceptas nuestros{" "}
          <Link to="/terms" className="underline hover:text-foreground">
            Términos
          </Link>{" "}
          y{" "}
          <Link to="/privacy" className="underline hover:text-foreground">
            Política de Privacidad
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
