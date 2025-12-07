import { createDatabase, eq, courtSessions, schedules, halls, courts, schedulePlayers, tenantPlayers } from "@packages/db";
import { format } from "date-fns";
import { ScheduleData, PlaySession } from "./types";

export async function getScheduleById(id: string): Promise<ScheduleData | undefined> {
  const db = createDatabase();

  const result = await db
    .select({
      schedule: schedules,
      hall: halls,
    })
    .from(schedules)
    .innerJoin(halls, eq(schedules.hallId, halls.id))
    .where(eq(schedules.id, id))
    .limit(1);

  if (result.length === 0) {
    return undefined;
  }

  const { schedule, hall } = result[0]!;

  // Fetch sessions
  const sessionsData = await db
    .select({
      startAt: courtSessions.startAt,
      endAt: courtSessions.endAt,
      playerLevelMin: courtSessions.playerLevelMin,
      playerLevelMax: courtSessions.playerLevelMax,
      courtNumber: courts.number,
    })
    .from(courtSessions)
    .innerJoin(courts, eq(courtSessions.courtId, courts.id))
    .where(eq(courtSessions.scheduleId, id));

  // Group sessions
  const sessionsMap = new Map<string, PlaySession>();

  for (const session of sessionsData) {
    const timeStart = format(session.startAt, "HH:mm");
    const timeEnd = format(session.endAt, "HH:mm");
    const key = `${timeStart}-${timeEnd}-${session.playerLevelMin}-${session.playerLevelMax}`;

    if (!sessionsMap.has(key)) {
      sessionsMap.set(key, {
        timeStart,
        timeEnd,
        court: [],
        playerLevel: `${session.playerLevelMin} - ${session.playerLevelMax}`,
      });
    }

    const entry = sessionsMap.get(key)!;
    if (Array.isArray(entry.court)) {
      entry.court.push(session.courtNumber.toString());
    }
  }

  const sessions = Array.from(sessionsMap.values());

  return {
    id: schedule.id,
    hallId: schedule.hallId,
    hall: hall.name,
    price: `Rp ${schedule.pricePerPerson.toLocaleString('id-ID')}`,
    date: format(schedule.scheduleDate, "MMM d"),
    tags: schedule.tags || [],
    sessions,
  };
}

export async function getSchedulePlayers(scheduleId: string) {
  const db = createDatabase();
  
  const players = await db
    .select({
      id: tenantPlayers.id,
      name: tenantPlayers.name,
      gender: tenantPlayers.gender,
      skillLevel: tenantPlayers.skillLevel,
    })
    .from(schedulePlayers)
    .innerJoin(tenantPlayers, eq(schedulePlayers.tenantPlayerId, tenantPlayers.id))
    .where(eq(schedulePlayers.scheduleId, scheduleId));

  return players;
}
