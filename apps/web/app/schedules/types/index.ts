// Re-export from existing lib/types for backward compatibility
export type { PlaySession, ScheduleData, PlaysProps } from "../lib/types";

// Re-export match generator types
export type { Player, MatchType, GeneratedMatch } from "../lib/match-generator";

export { SKILL_LEVELS } from "../lib/match-generator";

// Import for use within this file
import type { ScheduleData } from "../lib/types";
import type { Player } from "../lib/match-generator";

// Additional schedule-specific types
export interface ScheduleFormData {
  hallId: string;
  registeredPlayers: string[];
  scheduleDate: Date;
  slots: ScheduleSlotFormData[];
  price: number;
}

export interface ScheduleSlotFormData {
  startTime: string;
  endTime: string;
  courts: string[];
}

export interface CreateScheduleRequest {
  hallId: string;
  scheduleDate: string;
  price: number;
  registeredPlayers: string[];
  slots: Array<{
    startAt: string;
    endAt: string;
    courts: string[];
  }>;
}

export interface ScheduleListResponse {
  schedules: ScheduleData[];
  total: number;
  page: number;
  limit: number;
}

export interface ScheduleDetail extends Omit<ScheduleData, "hall"> {
  hall: {
    id: string;
    name: string;
    address: string;
    amenities: string[];
  };
  players: Player[];
}

/**
 * Schedule loading states
 */
export type ScheduleLoadingState =
  | "loading-schedules"
  | "loading-detail"
  | "loading-players"
  | "creating"
  | "updating"
  | "error";

/**
 * Schedule filter options
 */
export interface ScheduleFilters {
  dateFrom?: Date;
  dateTo?: Date;
  hallId?: string;
  playerLevel?: string;
  priceMin?: number;
  priceMax?: number;
}

/**
 * Schedule sorting options
 */
export type ScheduleSortBy = "date" | "price" | "hallName" | "createdAt";

export interface ScheduleSortConfig {
  field: ScheduleSortBy;
  direction: "asc" | "desc";
}
