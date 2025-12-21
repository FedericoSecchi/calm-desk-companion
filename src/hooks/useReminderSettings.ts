import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface ReminderSettings {
  id: string;
  enabled: boolean;
  days: number[];
  times: string[];
  preset: "light" | "standard" | "focus";
  sound_enabled: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateReminderSettings {
  enabled?: boolean;
  days?: number[];
  times?: string[];
  preset?: "light" | "standard" | "focus";
  sound_enabled?: boolean;
  notifications_enabled?: boolean;
}

// Fetch reminder settings for authenticated user
const fetchReminderSettings = async (userId: string): Promise<ReminderSettings | null> => {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from("reminder_settings")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // If no settings exist yet, return null (not an error)
    if (error.code === "PGRST116") {
      return null;
    }
    if (import.meta.env.DEV) {
      console.error("Error fetching reminder settings:", error);
    }
    throw error;
  }

  return data;
};

// Create or update reminder settings
const upsertReminderSettings = async (settings: UpdateReminderSettings): Promise<ReminderSettings> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("reminder_settings")
    .upsert({
      id: user.id,
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error upserting reminder settings:", error);
    }
    throw error;
  }

  return data;
};

export const useReminderSettings = () => {
  const { user, isGuest } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["reminder-settings", user?.id],
    queryFn: () => user && !isGuest ? fetchReminderSettings(user.id) : Promise.resolve(null),
    enabled: !!user && !isGuest && isSupabaseConfigured,
  });

  const mutation = useMutation({
    mutationFn: upsertReminderSettings,
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ["reminder-settings"] });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: mutation.mutate,
    isUpdating: mutation.isPending,
    updateError: mutation.error,
  };
};

