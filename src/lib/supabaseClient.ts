import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured at module load time
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Temporary DEV-only log to verify environment variables are loaded
if (import.meta.env.DEV) {
  if (isSupabaseConfigured) {
    console.log("✓ Supabase environment variables loaded successfully");
  } else {
    console.warn(
      "⚠ Missing Supabase environment variables. Authentication features will be disabled. " +
      "Please update .env.local with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
}

// Create a dummy client if env vars are missing to prevent app crash
// The AuthContext will handle the missing configuration gracefully
// This allows the app to render even without Supabase configured
let supabase: SupabaseClient;

// Safely create Supabase client - never throw, always return a valid client
try {
  if (!isSupabaseConfigured) {
    // Create a dummy client with placeholder values to prevent crashes
    // This client will never make real network requests
    // Wrap in try-catch in case createClient validates and throws
    try {
      supabase = createClient(
        "https://placeholder.supabase.co",
        "placeholder-key",
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );
    } catch (e) {
      // If even placeholder client fails, create a minimal mock
      // This should never happen, but safety first
      if (import.meta.env.DEV) {
        console.warn("Failed to create placeholder Supabase client:", e);
      }
      // Re-throw only in dev to catch issues, but in prod create a safe fallback
      if (import.meta.env.DEV) {
        throw e;
      }
      // In production, create a minimal client that won't crash
      supabase = createClient("https://placeholder.supabase.co", "placeholder-key");
    }
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
} catch (error) {
  // Ultimate fallback - should never reach here, but if it does, log and create minimal client
  if (import.meta.env.DEV) {
    console.error("Critical error creating Supabase client:", error);
  }
  // Create absolute minimal client as last resort
  supabase = createClient("https://placeholder.supabase.co", "placeholder-key");
}

export { supabase };

