export type PlayerLevel =
	| 'beginner'
	| 'novice'
	| 'intermediate'
	| 'advanced'
	| 'pro'
	| 'unrated';

export type ScheduleStatus = 'open' | 'full' | 'cancelled' | 'completed';

export interface ScheduleWithDetails {
	id: string;
	tenantId: string;
	hallId: string;
	pricePerPerson: number;
	startAt: Date;
	endAt: Date;
	playerLevelMin: PlayerLevel;
	playerLevelMax: PlayerLevel;
	tags: string[];
	createdAt: Date;
	updatedAt: Date | null;
}

export interface CreateScheduleInput {
	tenantId: string;
	hallId: string;
	pricePerPerson: number;
	startAt: string; // ISO string
	endAt: string; // ISO string
	playerLevelMin: PlayerLevel;
	playerLevelMax: PlayerLevel;
	tags?: string[];
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
export const playerLevels: PlayerLevel[] = [
	'unrated',
	'beginner',
	'novice',
	'intermediate',
	'advanced',
	'pro',
];

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

	const startMinutes = (startHour || 0) * 60 + (startMin || 0);
	const endMinutes = (endHour || 0) * 60 + (endMin || 0);

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
	hallId: string;
	courtId: string;
	startAt: Date;
	endAt: Date;
	playerLevelMin: PlayerLevel;
	playerLevelMax: PlayerLevel;
	createdAt: Date;
	updatedAt: Date | null;
}

export interface CreateCourtSessionInput {
	scheduleId: string;
	hallId: string;
	courtId: string;
	startAt: string; // ISO string
	endAt: string; // ISO string
	playerLevelMin: PlayerLevel;
	playerLevelMax: PlayerLevel;
}

export interface CourtSessionFilter {
	scheduleId?: string;
	hallId?: string;
	courtId?: string;
	playerLevel?: PlayerLevel;
	startAt?: string;
	endAt?: string;
}
