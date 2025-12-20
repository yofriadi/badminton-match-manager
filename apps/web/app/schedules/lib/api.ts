import { createDatabase, eq, courtSessions, schedules, halls, courts, schedulePlayers, tenantPlayers } from "@packages/db";
import { format } from "date-fns";
import { ScheduleData, PlaySession } from "./types";
import { formatIDR } from "@/lib/utils";
import { mergeSessionsByTime } from "@/lib/schedule-utils";

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

  // Transform sessions
  const rawSessions: PlaySession[] = sessionsData.map(session => ({
    timeStart: format(session.startAt, "HH:mm"),
    timeEnd: format(session.endAt, "HH:mm"),
    court: [session.courtNumber.toString()],
    playerLevel: `${session.playerLevelMin} - ${session.playerLevelMax}`,
  }));

  const sessions = mergeSessionsByTime(rawSessions, true);

  return {
    id: schedule.id,
    hallId: schedule.hallId,
    hall: hall.name,
    price: formatIDR(schedule.pricePerPerson),
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

  return players.map(player => ({
    ...player,
    gender: player.gender as "male" | "female",
    skillLevel: player.skillLevel as "beginner" | "novice" | "intermediate" | "advanced" | "pro"
  }));
}
