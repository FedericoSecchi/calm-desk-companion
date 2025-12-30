import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  Dumbbell, 
  Activity, 
  Settings,
  Play,
  Pause
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { EndOfFocusDialog } from "@/components/EndOfFocusDialog";
import { ScreenBreakBanner } from "@/components/ScreenBreakBanner";
import { AppBackground } from "@/components/AppBackground";
import { useFocusTimer } from "@/contexts/FocusTimerContext";

// Navigation items for bottom nav - 5 columns: [Inicio, Ejercicios, FAB, Dolor, Ajustes]
const bottomNavItems = [
  { to: "/app", icon: Home, label: "Inicio", end: true },
  { to: "/app/exercises", icon: Dumbbell, label: "Ejercicios" },
  null, // Slot central reservado para FAB
  { to: "/app/pain", icon: Activity, label: "Dolor" },
  { to: "/app/settings", icon: Settings, label: "Ajustes" },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isGuest, user } = useAuth();
  
  // useFocusTimer is safe here because AppLayout is wrapped by FocusTimerProvider in App.tsx
  const { 
    showEndOfFocusDialog, 
    dismissEndOfFocusDialog,
    isRunning = false,
    timeRemaining = 0,
    formatTime,
    toggleTimer
  } = useFocusTimer();

  // Defensive: ensure formatTime exists and handles edge cases
  const safeFormatTime = (seconds: number | undefined | null): string => {
    if (formatTime && typeof formatTime === 'function') {
      return formatTime(seconds ?? 0);
    }
    // Fallback formatter
    const safeSeconds = Math.max(0, seconds ?? 0);
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Defensive: ensure toggleTimer exists
  const safeToggleTimer = () => {
    if (toggleTimer && typeof toggleTimer === 'function') {
      toggleTimer();
    } else if (import.meta.env.DEV) {
      console.warn("[AppLayout] toggleTimer not available");
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    try {
      const email = user.email;
      const name = email.split("@")[0];
      if (name.length >= 2) {
        return name.substring(0, 2).toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    } catch (e) {
      return "U";
    }
  };

  return (
    <>
      {/* Global Background Layer - Aurora animated background */}
      <AppBackground />
      
      {/* Main App Container - positioned relative with z-index to stay above background */}
      <div className="relative z-10 min-h-screen bg-background">
        {/* End-of-Focus Dialog - visible from any route when REST phase completes */}
        <EndOfFocusDialog 
          open={showEndOfFocusDialog} 
          onClose={dismissEndOfFocusDialog}
        />
        
        {/* Screen Break Banner - 20-20-20 rule during WORK phase */}
        <ScreenBreakBanner />
      {/* Header - Fixed at top (h-16) to stay visible while scrolling */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <Logo size="sm" />
        <NavLink
          to="/app/settings"
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm"
        >
          {getUserInitials()}
        </NavLink>
      </div>

      {/* Main Content */}
      <main className="flex flex-col">
        {isGuest && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              🎭 Modo invitado - Los datos no se guardarán
            </p>
          </div>
        )}
        
        {/* Content area: pt-16 for fixed header (h-16), pb-24 for fixed bottom nav (h-16) + FAB elevation */}
        <div className="pt-16 pb-24 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation with FAB - Always visible */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-safe">
        <div className="grid grid-cols-5 items-center h-16 relative">
          {bottomNavItems.map((item, index) => {
            // Slot central (índice 2) - reservado para FAB
            if (item === null) {
              return (
                <div key="fab-slot" className="relative flex items-center justify-center h-full">
                  {/* FAB - ÚNICO control del timer (play/pause) */}
                  <div className="absolute -top-6 z-10">
                    <button
                      onClick={() => {
                        safeToggleTimer();
                        navigate("/app/reminders");
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center",
                        "w-16 h-16 rounded-full",
                        "bg-primary text-primary-foreground",
                        "shadow-xl shadow-primary/30",
                        "transition-all hover:scale-105 active:scale-95",
                        "border-4 border-background"
                      )}
                      aria-label={isRunning ? `Pausar timer. ${safeFormatTime(timeRemaining)} restantes.` : `Iniciar timer. ${safeFormatTime(timeRemaining)} restantes.`}
                      disabled={!toggleTimer}
                    >
                      {isRunning ? (
                        <>
                          <Pause className="h-6 w-6 mb-0.5" />
                          <span className="text-[9px] font-bold leading-tight">
                            {safeFormatTime(timeRemaining)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Play className="h-6 w-6 mb-0.5" />
                          <span className="text-[9px] font-bold leading-tight">
                            {safeFormatTime(timeRemaining)}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            }

            // Botones laterales - centrados en sus columnas
            const isActive = item.end 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to);
            
            return (
              <div key={item.to} className="flex items-center justify-center h-full">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
    </>
  );
};

export default AppLayout;
