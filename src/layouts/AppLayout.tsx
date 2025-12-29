import { Outlet, NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Bell, 
  Dumbbell, 
  Activity, 
  Settings,
  Menu,
  X,
  Clock,
  Play
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingTimer } from "@/components/FloatingTimer";
import { EndOfFocusDialog } from "@/components/EndOfFocusDialog";
import { useFocusTimer } from "@/contexts/FocusTimerContext";

// Navigation items for sidebars (desktop and mobile drawer)
const navItems = [
  { to: "/app", icon: LayoutDashboard, label: "Inicio", end: true },
  { to: "/app/reminders", icon: Bell, label: "Recordatorios" },
  { to: "/app/exercises", icon: Dumbbell, label: "Ejercicios" },
  { to: "/app/pain", icon: Activity, label: "Dolor" },
  { to: "/app/settings", icon: Settings, label: "Ajustes" },
];

// Navigation items for bottom nav - split around center FAB
const navItemsLeft = [
  { to: "/app", icon: LayoutDashboard, label: "Inicio", end: true },
  { to: "/app/exercises", icon: Dumbbell, label: "Ejercicios" },
];

const navItemsRight = [
  { to: "/app/pain", icon: Activity, label: "Dolor" },
  { to: "/app/settings", icon: Settings, label: "Ajustes" },
];

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isGuest } = useAuth();
  
  // useFocusTimer is safe here because AppLayout is wrapped by FocusTimerProvider in App.tsx
  const { 
    showEndOfFocusDialog, 
    dismissEndOfFocusDialog,
    isRunning,
    timeRemaining,
    formatTime
  } = useFocusTimer();
  
  // Helper to render Recordatorios nav item with timer state
  const renderRemindersNavItem = (item: typeof navItems[1], isActive: boolean, isMobile: boolean = false) => {
    const baseClasses = isMobile
      ? cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )
      : cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        );
    
    if (isRunning) {
      return (
        <NavLink
          to={item.to}
          className={baseClasses}
        >
          <Clock className="h-5 w-5 text-primary" />
          {isMobile ? (
            <>
              <span className="text-[10px] font-medium text-primary">{formatTime(timeRemaining)}</span>
            </>
          ) : (
            <span className="text-primary font-medium">{formatTime(timeRemaining)}</span>
          )}
        </NavLink>
      );
    }
    
    return (
      <NavLink
        to={item.to}
        className={baseClasses}
      >
        <item.icon className="h-5 w-5" />
        {item.label}
      </NavLink>
    );
  };

  return (
    <>
      {/* End-of-Focus Dialog - visible from any route when REST phase completes */}
      <EndOfFocusDialog 
        open={showEndOfFocusDialog} 
        onClose={dismissEndOfFocusDialog}
      />
      
      <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border">
        <div className="p-6">
          <Logo />
        </div>
        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isReminders = item.to === "/app/reminders";
              return (
                <li key={item.to}>
                  {isReminders ? (
                    renderRemindersNavItem(item, location.pathname === item.to || location.pathname.startsWith(item.to))
                  ) : (
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 mx-4 mb-4 bg-muted rounded-xl">
          <p className="text-xs text-muted-foreground">
            ⚠️ Calmo no reemplaza diagnóstico ni tratamiento médico.
          </p>
        </div>
      </aside>

      {/* Mobile Header - Fixed at top (h-16) to stay visible while scrolling */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <Logo size="sm" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-card border-r border-border z-50 flex flex-col"
            >
              <div className="p-6">
                <Logo />
              </div>
              <nav className="flex-1 px-4">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isReminders = item.to === "/app/reminders";
                    const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
                    return (
                      <li key={item.to}>
                        {isReminders ? (
                          <div onClick={() => setSidebarOpen(false)}>
                            {renderRemindersNavItem(item, isActive)}
                          </div>
                        ) : (
                          <NavLink
                            to={item.to}
                            end={item.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )
                            }
                          >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                          </NavLink>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 flex flex-col">
        {isGuest && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              🎭 Modo invitado - Los datos no se guardarán
            </p>
          </div>
        )}
        
        {/* Top Timer Bar - integrated in normal flow (not fixed) to avoid overlap with fixed mobile header */}
        {/* Mobile header is fixed (h-16), so content has pt-16. Timer appears below header in normal flow */}
        <FloatingTimer />
        
        {/* Content area: pt-16 on mobile for fixed header (h-16), pb-24 for fixed bottom nav (h-16) + FAB elevation */}
        <div className="pt-16 lg:pt-0 pb-24 lg:pb-0 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation with FAB */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-safe">
        <div className="relative flex items-center justify-around h-16">
          {/* Left side items */}
          <ul className="flex items-center justify-around flex-1">
            {navItemsLeft.map((item) => {
              const isActive = item.end 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to);
              return (
                <li key={item.to}>
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
                </li>
              );
            })}
          </ul>

          {/* Center FAB - Timer button (prominent, elevated) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
            <NavLink
              to="/app/reminders"
              className={cn(
                "flex flex-col items-center justify-center",
                "w-16 h-16 rounded-full",
                "bg-primary text-primary-foreground",
                "shadow-xl shadow-primary/30",
                "transition-all hover:scale-105 active:scale-95",
                "border-4 border-background",
                location.pathname === "/app/reminders" || location.pathname.startsWith("/app/reminders")
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              )}
            >
              {isRunning ? (
                <>
                  <Clock className="h-6 w-6 mb-0.5" />
                  <span className="text-[9px] font-bold leading-tight">
                    {formatTime(timeRemaining)}
                  </span>
                </>
              ) : (
                <Play className="h-7 w-7" />
              )}
            </NavLink>
          </div>

          {/* Right side items */}
          <ul className="flex items-center justify-around flex-1">
            {navItemsRight.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
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
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
    </>
  );
};

export default AppLayout;
