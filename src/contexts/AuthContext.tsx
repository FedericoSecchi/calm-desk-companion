import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Define ensureProfile before useEffect to avoid reference issues
  const ensureProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      // Create profile if it doesn't exist
      if (!existingProfile) {
        const { error } = await supabase.from("profiles").insert({
          id: userId,
          // Add any default profile fields here if needed
        });

        if (error && error.code !== "23505") {
          // 23505 is unique violation, which is fine (race condition)
          // Only log errors in development
          if (import.meta.env.DEV) {
            console.error("Error creating profile:", error);
          }
        }
      }
    } catch (error) {
      // Profile might not exist yet, which is fine
      // Only log errors in development
      if (import.meta.env.DEV) {
        console.error("Error checking profile:", error);
      }
    }
  };

  useEffect(() => {
    // If Supabase is not configured, skip auth initialization completely
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Safely get initial session with error handling
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((error) => {
        // Only log errors in development
        if (import.meta.env.DEV) {
          console.error("Error getting session:", error);
        }
        setLoading(false);
      });

      // Listen for auth changes - wrap in try-catch in case it throws
      try {
        const {
          data: { subscription: sub },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          // Sync profile on sign in
          if (session?.user && _event === "SIGNED_IN") {
            await ensureProfile(session.user.id);
          }
        });
        subscription = sub;
      } catch (error) {
        // If onAuthStateChange fails, just log and continue
        if (import.meta.env.DEV) {
          console.error("Error setting up auth state listener:", error);
        }
        setLoading(false);
      }
    } catch (error) {
      // Catch any synchronous errors
      if (import.meta.env.DEV) {
        console.error("Error in auth initialization:", error);
      }
      setLoading(false);
    }

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          // Ignore unsubscribe errors
          if (import.meta.env.DEV) {
            console.warn("Error unsubscribing from auth:", error);
          }
        }
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: "Supabase is not configured", name: "ConfigurationError" } as AuthError };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: { message: "Supabase is not configured", name: "ConfigurationError" } as AuthError };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return { error: { message: "Supabase is not configured", name: "ConfigurationError" } as AuthError };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${import.meta.env.PROD ? "/calm-desk-companion" : ""}/auth/callback`,
      },
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

