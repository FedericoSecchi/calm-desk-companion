/**
 * Stats calculation utilities
 * Used for computing streak and aggregating daily stats
 */

import { formatDateToYYYYMMDD, getTodayDateString } from "./utils";

export interface ActivityLog {
  created_at: string;
}

/**
 * Calculate streak days from activity logs
 * 
 * Streak Rule:
 * - A day counts toward the streak if the user has at least 1 activity:
 *   - Completed break (from break_logs, including reminder-triggered breaks)
 *   - Logged water glass (from water_logs)
 *   - Logged pain record (from pain_records)
 * 
 * Important: A completed REST phase from the Reminders timer logs a break to break_logs
 * with type="reminder", which counts as a valid habit for streak calculation.
 * 
 * Streak is consecutive days from today backwards (inclusive if today has activity).
 */
export function calculateStreak(
  breakLogs: ActivityLog[],
  waterLogs: ActivityLog[],
  painLogs: ActivityLog[]
): number {
  // Combine all logs and extract unique dates
  const allDates = new Set<string>();
  
  [...breakLogs, ...waterLogs, ...painLogs].forEach((log) => {
    const date = formatDateToYYYYMMDD(log.created_at);
    allDates.add(date);
  });

  if (allDates.size === 0) {
    return 0;
  }

  // Sort dates descending (most recent first)
  const sortedDates = Array.from(allDates).sort().reverse();

  // Calculate streak from today backwards
  const today = getTodayDateString();
  let streak = 0;
  let currentDate = new Date(today);

  for (const dateStr of sortedDates) {
    const logDate = formatDateToYYYYMMDD(dateStr);
    const expectedDate = formatDateToYYYYMMDD(currentDate);

    if (logDate === expectedDate) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Gap found, streak breaks
      break;
    }
  }

  return streak;
}

/**
 * Get count of activities for today
 */
export function getTodayCount(logs: ActivityLog[]): number {
  const today = getTodayDateString();
  return logs.filter((log) => {
    const logDate = formatDateToYYYYMMDD(log.created_at);
    return logDate === today;
  }).length;
}

/**
 * Get most recent pain record
 */
export interface PainRecord {
  intensity: number;
  area: string;
  created_at: string;
}

export function getLastPain(painRecords: Array<{ intensity: number; area: string; created_at: string }>): {
  intensity: number;
  area: string;
  time: string;
} | null {
  if (painRecords.length === 0) {
    return null;
  }

  // Sort by created_at descending and get first
  const sorted = [...painRecords].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const latest = sorted[0];

  return {
    intensity: latest.intensity,
    area: latest.area,
    time: new Date(latest.created_at).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

