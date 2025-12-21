/**
 * Stats calculation utilities
 * Used for computing streak and aggregating daily stats
 */

export interface ActivityLog {
  created_at: string;
}

/**
 * Calculate streak days from activity logs
 * Streak rule: A day counts if user has at least 1 activity (break, water, or pain)
 * Streak is consecutive days from today backwards
 */
export function calculateStreak(
  breakLogs: ActivityLog[],
  waterLogs: ActivityLog[],
  painLogs: ActivityLog[]
): number {
  // Combine all logs and extract unique dates
  const allDates = new Set<string>();
  
  [...breakLogs, ...waterLogs, ...painLogs].forEach((log) => {
    const date = new Date(log.created_at).toISOString().split("T")[0];
    allDates.add(date);
  });

  if (allDates.size === 0) {
    return 0;
  }

  // Sort dates descending (most recent first)
  const sortedDates = Array.from(allDates).sort().reverse();

  // Calculate streak from today backwards
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  let currentDate = new Date(today);

  for (const dateStr of sortedDates) {
    const logDate = new Date(dateStr).toISOString().split("T")[0];
    const expectedDate = currentDate.toISOString().split("T")[0];

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
  const today = new Date().toISOString().split("T")[0];
  return logs.filter((log) => {
    const logDate = new Date(log.created_at).toISOString().split("T")[0];
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

