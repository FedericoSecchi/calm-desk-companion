import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FocusTimerProvider } from "./contexts/FocusTimerContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import Reminders from "./pages/app/Reminders";
import Exercises from "./pages/app/Exercises";
import Pain from "./pages/app/Pain";
import Settings from "./pages/app/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle redirect from 404.html
const RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      // Remove the redirect parameter and navigate to the route
      navigate(redirect, { replace: true });
    }
  }, [searchParams, navigate]);
  
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  // Allow access if user is authenticated OR is a guest
  if (!user && !isGuest) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// OAuth Callback Handler
const AuthCallback = () => {
  const { loading, user, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // If we have a user/session, redirect to app
    if (user || session) {
      navigate("/app", { replace: true });
      return;
    }

    // If no user after loading, there might be an error or the callback failed
    // Wait a bit more for Supabase to process the callback, then redirect to auth
    const timeout = setTimeout(() => {
      if (!user && !session) {
        // Redirect to auth page if callback didn't result in a session
        navigate("/auth", { replace: true });
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [loading, user, session, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-muted-foreground mb-2">Completando inicio de sesión...</div>
        {loading && (
          <div className="text-sm text-muted-foreground">Por favor espera...</div>
        )}
      </div>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.PROD ? "/calm-desk-companion" : ""}>
            <RedirectHandler />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <FocusTimerProvider>
                      <AppLayout />
                    </FocusTimerProvider>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="reminders" element={<Reminders />} />
                <Route path="exercises" element={<Exercises />} />
                <Route path="pain" element={<Pain />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
