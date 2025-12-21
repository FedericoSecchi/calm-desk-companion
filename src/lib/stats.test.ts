import { describe, it, expect } from "vitest";
import { calculateStreak, getTodayCount, getLastPain } from "./stats";

describe("calculateStreak", () => {
  it("returns 0 when no activities exist", () => {
    expect(calculateStreak([], [], [])).toBe(0);
  });

  it("calculates streak from today backwards", () => {
    const today = new Date().toISOString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);

    const breakLogs = [{ created_at: today }];
    const waterLogs = [{ created_at: yesterday.toISOString() }];
    const painLogs = [{ created_at: dayBefore.toISOString() }];

    expect(calculateStreak(breakLogs, waterLogs, painLogs)).toBe(3);
  });

  it("stops streak when gap is found", () => {
    const today = new Date().toISOString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const breakLogs = [{ created_at: today }];
    const waterLogs = [{ created_at: yesterday.toISOString() }];
    const painLogs = [{ created_at: threeDaysAgo.toISOString() }]; // Gap on day 2

    expect(calculateStreak(breakLogs, waterLogs, painLogs)).toBe(2);
  });

  it("handles multiple activities on same day", () => {
    const today = new Date().toISOString();
    const breakLogs = [
      { created_at: today },
      { created_at: today },
    ];
    const waterLogs = [{ created_at: today }];

    expect(calculateStreak(breakLogs, waterLogs, [])).toBe(1);
  });
});

describe("getTodayCount", () => {
  it("returns 0 when no logs exist", () => {
    expect(getTodayCount([])).toBe(0);
  });

  it("counts only today's logs", () => {
    const today = new Date().toISOString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const logs = [
      { created_at: today },
      { created_at: today },
      { created_at: yesterday.toISOString() },
    ];

    expect(getTodayCount(logs)).toBe(2);
  });
});

describe("getLastPain", () => {
  it("returns null when no pain records exist", () => {
    expect(getLastPain([])).toBeNull();
  });

  it("returns most recent pain record", () => {
    const older = new Date();
    older.setHours(older.getHours() - 2);
    const newer = new Date();
    newer.setHours(newer.getHours() - 1);

    const records = [
      { intensity: 3, area: "lumbar", created_at: older.toISOString() },
      { intensity: 5, area: "cervical", created_at: newer.toISOString() },
    ];

    const result = getLastPain(records);
    expect(result).not.toBeNull();
    expect(result?.intensity).toBe(5);
    expect(result?.area).toBe("cervical");
  });

  it("formats time correctly", () => {
    const now = new Date();
    const records = [
      { intensity: 3, area: "lumbar", created_at: now.toISOString() },
    ];

    const result = getLastPain(records);
    expect(result?.time).toMatch(/\d{2}:\d{2}/);
  });
});

