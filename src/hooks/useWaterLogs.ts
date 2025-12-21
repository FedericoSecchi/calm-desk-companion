import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface WaterLog {
  id: string;
  user_id: string;
  created_at: string;
}

const STORAGE_KEY = "calmo_water_logs";

// Fetch water logs for authenticated user
const fetchWaterLogs = async (userId: string): Promise<WaterLog[]> => {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from("water_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error fetching water logs:", error);
    }
    throw error;
  }

  return data || [];
};

// Create a new water log
const createWaterLog = async (): Promise<WaterLog> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("water_logs")
    .insert({
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error creating water log:", error);
    }
    throw error;
  }

  return data;
};

// Guest mode: localStorage helpers
const getGuestWaterLogs = (): WaterLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const dates = JSON.parse(stored) as string[];
    return dates.map((date, index) => ({
      id: `guest-${index}-${date}`,
      user_id: "guest",
      created_at: date,
    }));
  } catch {
    return [];
  }
};

const addGuestWaterLog = (): WaterLog => {
  const now = new Date().toISOString();
  const existing = getGuestWaterLogs();
  const dates = existing.map((log) => log.created_at);
  dates.push(now);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  return {
    id: `guest-${dates.length}-${now}`,
    user_id: "guest",
    created_at: now,
  };
};

export const useWaterLogs = () => {
  const { user, isGuest } = useAuth();
  const queryClient = useQueryClient();

  // For guest mode, use localStorage
  const guestQuery = useQuery({
    queryKey: ["water-logs", "guest"],
    queryFn: () => Promise.resolve(getGuestWaterLogs()),
    enabled: isGuest,
  });

  // For authenticated users, use Supabase
  const authQuery = useQuery({
    queryKey: ["water-logs", user?.id],
    queryFn: () => user ? fetchWaterLogs(user.id) : Promise.resolve([]),
    enabled: !!user && !isGuest && isSupabaseConfigured,
  });

  const authMutation = useMutation({
    mutationFn: createWaterLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-logs"] });
    },
  });

  const addWaterGlass = () => {
    if (isGuest) {
      const newLog = addGuestWaterLog();
      queryClient.setQueryData(["water-logs", "guest"], (old: WaterLog[] = []) => [
        newLog,
        ...old,
      ]);
    } else {
      authMutation.mutate();
    }
  };

  const logs = isGuest ? (guestQuery.data || []) : (authQuery.data || []);

  return {
    logs,
    isLoading: isGuest ? guestQuery.isLoading : authQuery.isLoading,
    error: isGuest ? guestQuery.error : authQuery.error,
    addWaterGlass,
    isAdding: authMutation.isPending,
    addError: authMutation.error,
  };
};

