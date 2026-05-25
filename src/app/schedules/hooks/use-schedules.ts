"use client";

import { useState, useEffect } from "react";
import type { ScheduleData } from "../lib/types";

/**
 * Client-side hook for fetching schedules
 * This can be used for client-side data fetching if needed
 */
export function useSchedules() {
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        setLoading(true);
        const response = await fetch("/api/schedules");
        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }
        const data = (await response.json()) as ScheduleData[];
        setSchedules(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, []);

  return { schedules, loading, error };
}
