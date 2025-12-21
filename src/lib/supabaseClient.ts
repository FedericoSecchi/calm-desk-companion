import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured at module load time
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create a dummy client if env vars are missing to prevent app crash
// The AuthContext will handle the missing configuration gracefully
// This allows the app to render even without Supabase configured
let supabase: SupabaseClient;

if (!isSupabaseConfigured) {
  // Only log in development mode
  if (import.meta.env.DEV) {
    console.warn(
      "Missing Supabase environment variables. Authentication features will be disabled. " +
      "Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
  
  // Create a dummy client with placeholder values to prevent crashes
  // This client will never make real network requests
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
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };

