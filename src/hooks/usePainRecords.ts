import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

/**
 * PainRecord Interface
 * 
 * Current model: Single area per record
 * Future model: Multiple areas per record (see HABITS_MODEL.md)
 * 
 * TODO: When backend supports multiple areas:
 * - Change `area: string` to `areas: string[]`
 * - Update createPainRecord to handle array
 * - Update Pain.tsx UI to allow multiple area selection
 */
export interface PainRecord {
  id: string;
  user_id: string;
  area: string; // TODO: Change to `areas: string[]` when backend supports it
  intensity: number; // 1-10 (general intensity or average if multiple areas)
  notes: string | null; // Free text for specifying other discomforts
  created_at: string;
}

export interface CreatePainRecord {
  area: string; // TODO: Change to `areas: string[]` when backend supports it
  intensity: number;
  notes?: string; // Free text for specifying other discomforts
}

// Fetch pain records for authenticated user
const fetchPainRecords = async (userId: string, days: number = 30): Promise<PainRecord[]> => {
  if (!isSupabaseConfigured) {
    return [];
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("pain_records")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error fetching pain records:", error);
    }
    throw error;
  }

  return data || [];
};

// Create a new pain record
const createPainRecord = async (record: CreatePainRecord): Promise<PainRecord> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("pain_records")
    .insert({
      user_id: user.id,
      area: record.area,
      intensity: record.intensity,
      notes: record.notes || null,
    })
    .select()
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error creating pain record:", error);
    }
    throw error;
  }

  return data;
};

export const usePainRecords = (days: number = 30) => {
  const { user, isGuest } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pain-records", user?.id, days],
    queryFn: () => user && !isGuest ? fetchPainRecords(user.id, days) : Promise.resolve([]),
    enabled: !!user && !isGuest && isSupabaseConfigured,
  });

  const mutation = useMutation({
    mutationFn: createPainRecord,
    onSuccess: () => {
      // Invalidate and refetch pain records
      queryClient.invalidateQueries({ queryKey: ["pain-records"] });
    },
  });

  return {
    records: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createRecord: mutation.mutate,
    isCreating: mutation.isPending,
    createError: mutation.error,
  };
};

