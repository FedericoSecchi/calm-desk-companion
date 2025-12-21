import { useMemo } from "react";
import { useWaterLogs } from "./useWaterLogs";
import { useBreakLogs } from "./useBreakLogs";
import { usePainRecords } from "./usePainRecords";
import { calculateStreak, getTodayCount, getLastPain } from "@/lib/stats";

export const useDashboardStats = () => {
  const { logs: waterLogs } = useWaterLogs();
  const { logs: breakLogs } = useBreakLogs();
  const { records: painRecords } = usePainRecords(365); // Get all records for streak calculation

  const stats = useMemo(() => {
    const breaksToday = getTodayCount(breakLogs);
    const waterToday = getTodayCount(waterLogs);
    
    // Convert pain records to format expected by calculateStreak
    const painLogs = painRecords.map((r) => ({ created_at: r.created_at }));
    const streak = calculateStreak(breakLogs, waterLogs, painLogs);
    
    // Convert pain records to format expected by getLastPain
    const painForLast = painRecords.map((r) => ({
      intensity: r.intensity,
      area: r.area,
      created_at: r.created_at,
    }));
    const lastPain = getLastPain(painForLast);

    return {
      breaksToday,
      waterToday,
      streak,
      lastPain,
    };
  }, [breakLogs, waterLogs, painRecords]);

  return stats;
};

