import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get today's date as YYYY-MM-DD string
 * Centralized utility for consistent date formatting across the app
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Format a date string to YYYY-MM-DD
 * Useful for normalizing dates from various sources
 */
export function formatDateToYYYYMMDD(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString().split("T")[0];
}
