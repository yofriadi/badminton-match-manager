import type { MatchmakingOptions } from "./match-generator";

export interface PlaySession {
  timeStart: string;
  timeEnd: string;
  court: string | string[];
  playerLevel: string;
}

export interface ScheduleRoundOverride {
  game: number;
  number: string | number;
  players?: string[];
  playerIds: string[];
  time: string;
  type: "Mix Doubles" | "Men Doubles" | "Women Doubles";
  skillRange: string;
}

export interface ScheduleManualSubstitution {
  game: number;
  court: string | number;
  slot: 0 | 1 | 2 | 3;
  playerId: string;
}

export interface ScheduleData {
  id: string;
  hallId: string;
  hall: string;
  price: string;
  date: string;
  tags: string[];
  sessions: PlaySession[];
  numberOfSessions?: number | null;
  generatedMatches?: ScheduleRoundOverride[] | null;
  manualSubstitutions?: ScheduleManualSubstitution[] | null;
  matchmakingOptions?: MatchmakingOptions | null;
}

export interface PlaysProps {
  schedule: ScheduleData;
}
