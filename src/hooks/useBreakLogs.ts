import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface BreakLog {
  id: string;
  user_id: string;
  type: "reminder" | "exercise" | "other";
  created_at: string;
}

const STORAGE_KEY = "calmo_break_logs";

// Fetch break logs for authenticated user
const fetchBreakLogs = async (userId: string): Promise<BreakLog[]> => {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from("break_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error fetching break logs:", error);
    }
    throw error;
  }

  return data || [];
};

// Create a new break log
const createBreakLog = async (type: "reminder" | "exercise" | "other" = "reminder"): Promise<BreakLog> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("break_logs")
    .insert({
      user_id: user.id,
      type,
    })
    .select()
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error creating break log:", error);
    }
    throw error;
  }

  return data;
};

// Guest mode: localStorage helpers
const getGuestBreakLogs = (): BreakLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const dates = JSON.parse(stored) as string[];
    return dates.map((date, index) => ({
      id: `guest-${index}-${date}`,
      user_id: "guest",
      type: "reminder" as const,
      created_at: date,
    }));
  } catch {
    return [];
  }
};

const addGuestBreakLog = (type: "reminder" | "exercise" | "other" = "reminder"): BreakLog => {
  const now = new Date().toISOString();
  const existing = getGuestBreakLogs();
  const dates = existing.map((log) => log.created_at);
  dates.push(now);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  return {
    id: `guest-${dates.length}-${now}`,
    user_id: "guest",
    type,
    created_at: now,
  };
};

export const useBreakLogs = () => {
  const { user, isGuest } = useAuth();
  const queryClient = useQueryClient();

  // For guest mode, use localStorage
  const guestQuery = useQuery({
    queryKey: ["break-logs", "guest"],
    queryFn: () => Promise.resolve(getGuestBreakLogs()),
    enabled: isGuest,
  });

  // For authenticated users, use Supabase
  const authQuery = useQuery({
    queryKey: ["break-logs", user?.id],
    queryFn: () => user ? fetchBreakLogs(user.id) : Promise.resolve([]),
    enabled: !!user && !isGuest && isSupabaseConfigured,
  });

  const authMutation = useMutation({
    mutationFn: createBreakLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["break-logs"] });
    },
  });

  const logBreak = (type: "reminder" | "exercise" | "other" = "reminder") => {
    if (isGuest) {
      const newLog = addGuestBreakLog(type);
      queryClient.setQueryData(["break-logs", "guest"], (old: BreakLog[] = []) => [
        newLog,
        ...old,
      ]);
    } else {
      authMutation.mutate(type);
    }
  };

  const logs = isGuest ? (guestQuery.data || []) : (authQuery.data || []);

  return {
    logs,
    isLoading: isGuest ? guestQuery.isLoading : authQuery.isLoading,
    error: isGuest ? guestQuery.error : authQuery.error,
    logBreak,
    isLogging: authMutation.isPending,
    logError: authMutation.error,
  };
};

