/**
 * useManualBreakAdjustments Hook
 * 
 * Manages manual break adjustments (+ / -) separate from timer-completed breaks.
 * These adjustments allow users to correct their daily break count.
 * 
 * Storage:
 * - Guest mode: localStorage (calmo_manual_break_adjustments)
 * - Auth mode: TODO - future backend table for manual adjustments
 * 
 * Model:
 * - Each day has a single adjustment value (can be positive or negative)
 * - Adjustment is added to timer breaks to get total breaks for the day
 * - Adjustments reset daily (but historical values are preserved)
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayDateString } from "@/lib/utils";

const STORAGE_KEY = "calmo_manual_break_adjustments";

interface ManualAdjustment {
  date: string; // ISO date string (YYYY-MM-DD)
  adjustment: number; // Can be positive or negative
}

// Get adjustments from localStorage (guest mode)
const getGuestAdjustments = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

// Save adjustments to localStorage (guest mode)
const saveGuestAdjustments = (adjustments: Record<string, number>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adjustments));
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error("Error saving manual break adjustments:", e);
    }
  }
};

export const useManualBreakAdjustments = () => {
  const { isGuest } = useAuth();
  const [adjustments, setAdjustments] = useState<Record<string, number>>(() => {
    if (isGuest) {
      return getGuestAdjustments();
    }
    // TODO: For auth mode, fetch from backend
    return {};
  });

  // Sync to localStorage when adjustments change (guest mode)
  useEffect(() => {
    if (isGuest) {
      saveGuestAdjustments(adjustments);
    }
  }, [adjustments, isGuest]);

  // Get today's adjustment
  const getTodayAdjustment = (): number => {
    const today = getTodayDateString();
    return adjustments[today] || 0;
  };

  // Adjust today's break count
  const adjustToday = (delta: number) => {
    const today = getTodayDateString();
    setAdjustments((prev) => {
      const current = prev[today] || 0;
      const newValue = current + delta;
      // Don't allow negative total (but allow negative adjustment to correct)
      return {
        ...prev,
        [today]: newValue,
      };
    });
  };

  // Reset today's adjustment (manual reset)
  const resetToday = () => {
    const today = getTodayDateString();
    setAdjustments((prev) => {
      const { [today]: _, ...rest } = prev;
      return rest;
    });
  };

  return {
    todayAdjustment: getTodayAdjustment(),
    adjustToday,
    resetToday,
  };
};

