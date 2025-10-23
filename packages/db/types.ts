export type PlayerLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'pro';

export type ScheduleStatus = 'open' | 'full' | 'cancelled' | 'completed';

export interface ScheduleWithDetails {
	id: string;
	hallId: string;
	hallName: string;
	pricePerPerson: number;
	date: string; // YYYY-MM-DD format
	timeStart: string; // HH:MM format
	timeEnd: string; // HH:MM format
	playerLevelMin: PlayerLevel;
	playerLevelMax: PlayerLevel;
	courtNumbers: string[];
	tags: string[];
	maxPlayers: number;
	currentPlayers: number;
	status: ScheduleStatus;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateScheduleInput {
	hallId: string;
	hallName: string;
	pricePerPerson: number;
	date: string; // YYYY-MM-DD format
	timeStart: string; // HH:MM format
	timeEnd: string; // HH:MM format
	playerLevelMin: PlayerLevel;
	playerLevelMax: PlayerLevel;
	courtNumbers: string[];
	tags?: string[];
	maxPlayers?: number;
	description?: string;
}

export interface ScheduleFilter {
	hallId?: string;
	dateFrom?: string;
	dateTo?: string;
	playerLevel?: PlayerLevel;
	status?: ScheduleStatus;
	tags?: string[];
	courtNumbers?: string[];
}

// Helper functions for validation
export const playerLevels: PlayerLevel[] = ['beginner', 'novice', 'intermediate', 'advanced', 'pro'];

export const scheduleStatuses: ScheduleStatus[] = ['open', 'full', 'cancelled', 'completed'];

export function isValidPlayerLevel(level: string): level is PlayerLevel {
	return playerLevels.includes(level as PlayerLevel);
}

export function isValidScheduleStatus(status: string): status is ScheduleStatus {
	return scheduleStatuses.includes(status as ScheduleStatus);
}

export function validateTimeRange(start: string, end: string): boolean {
	const [startHour, startMin] = start.split(':').map(Number);
	const [endHour, endMin] = end.split(':').map(Number);

	const startMinutes = startHour * 60 + startMin;
	const endMinutes = endHour * 60 + endMin;

	return startMinutes < endMinutes;
}

export function validatePlayerLevelRange(min: PlayerLevel, max: PlayerLevel): boolean {
	const levels = playerLevels;
	return levels.indexOf(min) <= levels.indexOf(max);
}

// Court Session Types
export interface CourtSessionWithDetails {
	id: string;
	scheduleId: string;
	timeStart: string; // HH:MM format
	timeEnd: string; // HH:MM format
	playerLevelMin: PlayerLevel;
	playerLevelMax: PlayerLevel;
	courtNumber: string;
	maxPlayers: number;
	currentPlayers: number;
	status: ScheduleStatus;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateCourtSessionInput {
	scheduleId: string;
	timeStart: string; // HH:MM format
	timeEnd: string; // HH:MM format
	playerLevelMin: PlayerLevel;
	playerLevelMax: PlayerLevel;
	courtNumber: string;
	maxPlayers?: number;
	notes?: string;
}

export interface CourtSessionFilter {
	scheduleId?: string;
	courtNumber?: string;
	playerLevel?: PlayerLevel;
	status?: ScheduleStatus;
	timeStart?: string;
	timeEnd?: string;
}