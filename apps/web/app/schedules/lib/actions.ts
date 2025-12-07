"use server";

import { createDatabase, schedules, courtSessions, scheduleCourts, schedulePlayers, tenantPlayers, eq, and } from "@packages/db";

type SlotPayload = {
  startAt: string; // ISO string
  endAt: string; // ISO string
  courts: string[];
};

type CreateScheduleInput = {
  hallId: string;
  scheduleDate: string; // ISO date string
  price: number;
  slots: SlotPayload[];
  registeredPlayers: string[]; // Array of tenant player IDs
};

// Server action to persist a schedule and its court sessions.
export async function createSchedule(input: CreateScheduleInput) {
  const db = createDatabase();

  const tenant = await db.query.tenants.findFirst();
  if (!tenant) {
    throw new Error("No tenant found for schedule creation");
  }

  const [schedule] = await db
    .insert(schedules)
    .values({
      tenantId: tenant.id,
      hallId: input.hallId,
      pricePerPerson: input.price,
      scheduleDate: input.scheduleDate,
      playerLevelMin: "unrated",
      playerLevelMax: "pro",
      tags: [],
    })
    .returning();

  if (!schedule) {
    throw new Error("Failed to create schedule");
  }

  const allCourtRows = input.slots.flatMap((slot) =>
    slot.courts.map((courtId) => ({
      scheduleId: schedule.id,
      hallId: input.hallId,
      courtId,
      startAt: new Date(slot.startAt),
      endAt: new Date(slot.endAt),
    })),
  );

  if (allCourtRows.length > 0) {
    await db.insert(scheduleCourts).values(allCourtRows);
    await db.insert(courtSessions).values(
      allCourtRows.map((row) => ({
        ...row,
        playerLevelMin: "unrated",
        playerLevelMax: "pro",
      })),
    );
  }

  // Insert schedule players
  if (input.registeredPlayers.length > 0) {
    await db.insert(schedulePlayers).values(
      input.registeredPlayers.map((playerId) => ({
        scheduleId: schedule.id,
        tenantPlayerId: playerId,
      })),
    );
  }

  return schedule;
}

export async function getAvailablePlayers(scheduleId: string) {
  const db = createDatabase();

  const tenant = await db.query.tenants.findFirst();
  if (!tenant) {
    throw new Error("No tenant found");
  }

  // Get all tenant players
  const allPlayers = await db.query.tenantPlayers.findMany({
    where: eq(tenantPlayers.tenantId, tenant.id),
  });
  console.log(`[getAvailablePlayers] Tenant ID: ${tenant.id}, Found ${allPlayers.length} players`);

  // Get players already in schedule
  const existingSchedulePlayers = await db.query.schedulePlayers.findMany({
    where: eq(schedulePlayers.scheduleId, scheduleId),
  });
  console.log(`[getAvailablePlayers] Schedule ID: ${scheduleId}, Found ${existingSchedulePlayers.length} existing players`);

  const existingPlayerIds = new Set(existingSchedulePlayers.map(p => p.tenantPlayerId));

  // Filter out existing players
  const available = allPlayers.filter(p => !existingPlayerIds.has(p.id));
  console.log(`[getAvailablePlayers] Available players: ${available.length}`);
  return available;
}

export async function addPlayersToSchedule(scheduleId: string, playerIds: string[]) {
  const db = createDatabase();

  if (playerIds.length === 0) return;

  const values = playerIds.map(playerId => ({
    scheduleId,
    tenantPlayerId: playerId,
  }));

  await db.insert(schedulePlayers).values(values).onConflictDoNothing();
}
