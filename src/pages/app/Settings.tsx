import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, Globe, Volume2, Sparkles, MessageCircle, Music, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl text-foreground">Ajustes</h1>
      </motion.div>

      <div className="space-y-4">
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div className="flex-1"><p className="font-medium">Idioma</p><p className="text-sm text-muted-foreground">Español</p></div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-primary" />
            <div className="flex-1"><p className="font-medium">Sonidos</p><p className="text-sm text-muted-foreground">Activado</p></div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex-1"><p className="font-medium">Reducir movimiento</p><p className="text-sm text-muted-foreground">Desactivado</p></div>
          </div>
        </div>

        <a href="https://t.me/calmo_community" target="_blank" rel="noopener noreferrer" className="block bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-secondary" />
            <div className="flex-1"><p className="font-medium">Comunidad Telegram</p><p className="text-sm text-muted-foreground">Únete a otros trabajadores remotos</p></div>
          </div>
        </a>

        <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="block bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3">
            <Music className="h-5 w-5 text-success" />
            <div className="flex-1"><p className="font-medium">Playlists de enfoque</p><p className="text-sm text-muted-foreground">Música para concentrarse</p></div>
          </div>
        </a>

        <div className="bg-destructive/5 rounded-2xl p-4 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <p className="text-sm text-muted-foreground">Calmo no reemplaza diagnóstico ni tratamiento médico. Consulta a un profesional de salud para problemas persistentes.</p>
          </div>
        </div>

        <Button variant="outline" size="lg" className="w-full text-destructive hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default Settings;
