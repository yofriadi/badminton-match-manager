import { ScheduleData, PlaySession } from "./types";
import { formatIDR, formatDateID, formatTimeID } from "@/lib/utils";
import { mergeSessionsByTime } from "@/lib/schedule-utils";

// Types for database row data
interface ScheduleRow {
  id: string;
  hallId: string;
  hallName: string;
  price: number;
  scheduleDate: string | Date;
  levelMin: string | number;
  levelMax: string | number;
}

interface CourtRow {
  scheduleId: string;
  courtNumber: number;
  startAt: Date;
  endAt: Date;
}

/**
 * Transform raw database rows to PlaySession format
 */
export function transformCourtRowsToSessions(
  courtRows: CourtRow[],
  levelMin: string | number,
  levelMax: string | number,
): PlaySession[] {
  return courtRows.map((row) => {
    return {
      timeStart: formatTimeID(row.startAt),
      timeEnd: formatTimeID(row.endAt),
      court: [String(row.courtNumber)],
      playerLevel: `${levelMin} - ${levelMax}`,
    };
  });
}

/**
 * Format a single schedule row for display
 */
export function formatScheduleForDisplay(
  row: ScheduleRow,
  sessions: PlaySession[],
): ScheduleData {
  return {
    id: row.id,
    hallId: row.hallId,
    hall: row.hallName,
    price: formatIDR(row.price),
    date: formatDateID(row.scheduleDate),
    tags: [],
    sessions: mergeSessionsByTime(sessions),
  };
}

/**
 * Process schedule rows with their associated court data
 */
export function processScheduleRows(
  schedulesRows: ScheduleRow[],
  courtRows: CourtRow[],
): ScheduleData[] {
  if (schedulesRows.length === 0) return [];

  // Group court rows by schedule ID
  const courtsBySchedule: Record<string, CourtRow[]> = {};
  for (const row of courtRows) {
    if (!courtsBySchedule[row.scheduleId]) {
      courtsBySchedule[row.scheduleId] = [];
    }
    courtsBySchedule[row.scheduleId]!.push(row);
  }

  // Transform each schedule row
  return schedulesRows.map((row) => {
    const scheduleCourtRows = courtsBySchedule[row.id] ?? [];
    const sessions = transformCourtRowsToSessions(
      scheduleCourtRows,
      row.levelMin,
      row.levelMax,
    );

    return formatScheduleForDisplay(row, sessions);
  });
}
