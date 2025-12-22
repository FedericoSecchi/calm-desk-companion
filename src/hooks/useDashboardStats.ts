import { useMemo } from "react";
import { useWaterLogs } from "./useWaterLogs";
import { useBreakLogs } from "./useBreakLogs";
import { usePainRecords } from "./usePainRecords";
import { useManualBreakAdjustments } from "./useManualBreakAdjustments";
import { calculateStreak, getTodayCount, getLastPain } from "@/lib/stats";

export const useDashboardStats = () => {
  const { logs: waterLogs } = useWaterLogs();
  const { logs: breakLogs } = useBreakLogs();
  const { records: painRecords } = usePainRecords(365); // Get all records for streak calculation
  const { todayAdjustment } = useManualBreakAdjustments();

  const stats = useMemo(() => {
    // Separate timer breaks (type="reminder") from other breaks
    const timerBreaks = breakLogs.filter((log) => log.type === "reminder");
    const timerBreaksToday = getTodayCount(timerBreaks);
    
    // Total breaks = timer breaks + manual adjustment
    const breaksToday = Math.max(0, timerBreaksToday + todayAdjustment);
    
    const waterToday = getTodayCount(waterLogs);
    
    // Convert pain records to format expected by calculateStreak
    const painLogs = painRecords.map((r) => ({ created_at: r.created_at }));
    // For streak: include both timer breaks and manual adjustments
    // (both count as valid habits)
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
      timerBreaksToday,
      manualAdjustment: todayAdjustment,
      waterToday,
      streak,
      lastPain,
    };
  }, [breakLogs, waterLogs, painRecords, todayAdjustment]);

  return stats;
};

