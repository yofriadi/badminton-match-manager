/**
 * Time utility functions shared across the application
 */

/**
 * Convert time string in HH:MM format to minutes
 */
export const toMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Combine a date and time string into a Date object
 */
export const combineDateTime = (date: Date, time: string): Date => {
  const [hours = 0, minutes = 0] = time
    .split(":")
    .map((value) => Number.parseInt(value, 10));
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

export { formatIDR } from "./utils";

/**
 * Validate time string format (HH:MM)
 */
export const isValidTimeFormat = (time: string): boolean => {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
};

/**
 * Check if end time is after start time
 */
export const isEndTimeAfterStart = (
  startTime: string,
  endTime: string,
): boolean => {
  return startTime < endTime;
};

/**
 * Check if time duration meets minimum requirement in minutes
 */
export const meetsMinimumDuration = (
  startTime: string,
  endTime: string,
  minimumMinutes: number = 60,
): boolean => {
  return toMinutes(endTime) - toMinutes(startTime) >= minimumMinutes;
};
