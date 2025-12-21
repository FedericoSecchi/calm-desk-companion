import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo size="lg" />
            <p className="mt-4 text-muted-foreground max-w-sm">
              Hábitos saludables para trabajar con la computadora, sin dolor. Cuida tu postura y bienestar.
            </p>
            <p className="mt-4 text-sm text-muted-foreground flex items-center gap-1">
              Hecho con <Heart className="h-4 w-4 text-destructive" /> para trabajadores remotos
            </p>
          </div>
          
          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider text-foreground mb-4">
              Producto
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Funciones
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cómo funciona
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider text-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Calmo. Todos los derechos reservados.
            </p>
            <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              ⚠️ Calmo no reemplaza diagnóstico ni tratamiento médico.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
