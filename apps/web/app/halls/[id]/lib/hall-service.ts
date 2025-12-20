import {
  createDatabase,
  schedules as schedulesTable,
  scheduleCourts,
  courts,
  eq,
  inArray,
  and,
} from "@packages/db";
import { getHallById } from "../../../../lib/halls";
import { formatIDR, formatDateID, formatTimeID } from "../../../../lib/utils";
import { mergeSessionsByTime } from "../../../../lib/schedule-utils";
import { ScheduleData } from "../../schedules/lib/types";

/**
 * Get complete hall details including layout and players
 */
export async function getHallWithDetails(id: string) {
  // getHallById already includes layout blueprint and players
  return await getHallById(id);
}

/**
 * Load and transform hall schedules with court data
 */
export async function getHallSchedules(
  hallId: string,
  hallName: string,
): Promise<ScheduleData[]> {
  const db = createDatabase();
  const tenant = await db.query.tenants.findFirst();
  if (!tenant) return [];

  const scheduleRows = await db
    .select({
      id: schedulesTable.id,
      hallId: schedulesTable.hallId,
      price: schedulesTable.pricePerPerson,
      scheduleDate: schedulesTable.scheduleDate,
      levelMin: schedulesTable.playerLevelMin,
      levelMax: schedulesTable.playerLevelMax,
    })
    .from(schedulesTable)
    .where(
      and(
        eq(schedulesTable.tenantId, tenant.id),
        eq(schedulesTable.hallId, hallId),
      ),
    );

  if (scheduleRows.length === 0) return [];

  const scheduleIds = scheduleRows.map((row) => row.id);

  const courtRows = await db
    .select({
      scheduleId: scheduleCourts.scheduleId,
      courtNumber: courts.number,
      startAt: scheduleCourts.startAt,
      endAt: scheduleCourts.endAt,
    })
    .from(scheduleCourts)
    .innerJoin(courts, eq(scheduleCourts.courtId, courts.id))
    .where(inArray(scheduleCourts.scheduleId, scheduleIds));

  return transformScheduleData(scheduleRows, courtRows, hallName);
}

/**
 * Transform raw schedule and court data into the expected format
 */
function transformScheduleData(
  scheduleRows: any[],
  courtRows: any[],
  hallName: string,
): ScheduleData[] {
  const courtsBySchedule: Record<string, typeof courtRows> = {};
  for (const row of courtRows) {
    if (!courtsBySchedule[row.scheduleId]) {
      courtsBySchedule[row.scheduleId] = [];
    }
    courtsBySchedule[row.scheduleId]!.push(row);
  }

  return scheduleRows.map((row) => {
    const sessions = (courtsBySchedule[row.id] ?? []).map((session) => {
      return {
        timeStart: formatTimeID(session.startAt as string),
        timeEnd: formatTimeID(session.endAt as string),
        court: [String(session.courtNumber)],
        playerLevel: `${row.levelMin} - ${row.levelMax}`,
      };
    });

    const mergedSessions = mergeSessionsByTime(sessions);

    return {
      id: row.id,
      hallId: row.hallId,
      hall: hallName,
      price: formatIDR(row.price),
      date: formatDateID(row.scheduleDate as string),
      tags: [],
      sessions: mergedSessions,
    };
  });
}