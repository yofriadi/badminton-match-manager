import {
  courtSessions,
  eq,
  scheduleCourts,
  schedulePlayers,
  schedules,
  tenantPlayers,
  hallTenants,
  hallTenantRegisteredPlayers,
  and,
  inArray,
} from "@/db";
import { getDb } from "@/lib/db";
import { requireTenant } from "@/lib/session-utils";
import type {
  ScheduleManualSubstitution,
  ScheduleRoundOverride,
} from "./types";
import type { MatchmakingOptions } from "./match-generator";

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
  generatedMatches?: ScheduleRoundOverride[];
};

// Server action to persist a schedule and its court sessions.
export async function createSchedule(
  requestHeaders: Headers,
  input: CreateScheduleInput,
) {
  const db = getDb();
  const tenant = await requireTenant(requestHeaders);

  // Verify the hall is registered to this tenant
  const [hallRelation] = await db
    .select()
    .from(hallTenants)
    .where(
      and(
        eq(hallTenants.hallId, input.hallId),
        eq(hallTenants.tenantId, tenant.id),
      ),
    )
    .limit(1);

  if (!hallRelation) {
    throw new Error("Hall is not registered to this tenant");
  }

  // Verify all players are registered to this hall
  if (input.registeredPlayers.length > 0) {
    const registeredPlayerRows = await db
      .select({ tenantPlayerId: hallTenantRegisteredPlayers.tenantPlayerId })
      .from(hallTenantRegisteredPlayers)
      .where(
        and(
          eq(hallTenantRegisteredPlayers.hallId, input.hallId),
          eq(hallTenantRegisteredPlayers.tenantId, tenant.id),
          inArray(
            hallTenantRegisteredPlayers.tenantPlayerId,
            input.registeredPlayers,
          ),
        ),
      );

    const registeredPlayerIds = new Set(
      registeredPlayerRows.map((r) => r.tenantPlayerId),
    );

    for (const playerId of input.registeredPlayers) {
      if (!registeredPlayerIds.has(playerId)) {
        throw new Error(`Player is not registered to this hall`);
      }
    }
  }

  const [schedule] = await db
    .insert(schedules)
    .values({
      tenantId: tenant.id,
      hallId: input.hallId,
      pricePerPerson: input.price,
      scheduleDate: new Date(input.scheduleDate),
      playerLevelMin: "unrated",
      playerLevelMax: "pro",
      tags: [],
      generatedMatches: input.generatedMatches ?? null,
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

export async function getAvailablePlayers(
  requestHeaders: Headers,
  scheduleId: string,
) {
  const db = getDb();
  const tenant = await requireTenant(requestHeaders);

  // Get all tenant players
  const allPlayers = await db.query.tenantPlayers.findMany({
    where: eq(tenantPlayers.tenantId, tenant.id),
  });
  console.log(
    `[getAvailablePlayers] Tenant ID: ${tenant.id}, Found ${allPlayers.length} players`,
  );

  // Get players already in schedule
  const existingSchedulePlayers = await db.query.schedulePlayers.findMany({
    where: eq(schedulePlayers.scheduleId, scheduleId),
  });
  console.log(
    `[getAvailablePlayers] Schedule ID: ${scheduleId}, Found ${existingSchedulePlayers.length} existing players`,
  );

  const existingPlayerIds = new Set(
    existingSchedulePlayers.map((p) => p.tenantPlayerId),
  );

  // Filter out existing players
  const available = allPlayers.filter((p) => !existingPlayerIds.has(p.id));
  console.log(`[getAvailablePlayers] Available players: ${available.length}`);
  return available;
}

export async function invalidateGeneratedSchedule(
  scheduleId: string,
  db = getDb(),
) {
  await db
    .update(schedules)
    .set({ generatedMatches: null, updatedAt: new Date() })
    .where(eq(schedules.id, scheduleId));
}

export async function addPlayersToSchedule(
  _requestHeaders: Headers,
  scheduleId: string,
  playerIds: string[],
) {
  const db = getDb();

  if (playerIds.length === 0) return;

  const values = playerIds.map((playerId) => ({
    scheduleId,
    tenantPlayerId: playerId,
  }));

  await db.insert(schedulePlayers).values(values).onConflictDoNothing();
  await invalidateGeneratedSchedule(scheduleId, db);
}

export async function registerAndAddPlayerToScheduleAction(
  requestHeaders: Headers,
  scheduleId: string,
  data: {
    playerId?: string;
    playerIds?: string[];
    name?: string;
    gender?: string;
    skillLevel?: string;
  },
) {
  const db = getDb();
  const currentTenant = await requireTenant(requestHeaders);

  // Get schedule to find hallId
  const [schedule] = await db
    .select({ hallId: schedules.hallId })
    .from(schedules)
    .where(eq(schedules.id, scheduleId))
    .limit(1);

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  const hallId = schedule.hallId;
  let idsToAdd: string[] = [];

  if (data.playerId) {
    idsToAdd = [data.playerId];
  } else if (data.playerIds && data.playerIds.length > 0) {
    idsToAdd = data.playerIds;
  } else {
    // Create new player
    if (!data.name || !data.gender || !data.skillLevel) {
      throw new Error("Missing player details");
    }

    const [newPlayer] = await db
      .insert(tenantPlayers)
      .values({
        tenantId: currentTenant.id,
        name: data.name,
        gender: data.gender,
        skillLevel: data.skillLevel,
      })
      .returning({ id: tenantPlayers.id });

    if (!newPlayer) {
      throw new Error("Failed to create player");
    }

    idsToAdd = [newPlayer.id];
  }

  // 1. Register players to the hall (onConflictDoNothing)
  const hallRegistrations = idsToAdd.map((id) => ({
    hallId,
    tenantId: currentTenant.id,
    tenantPlayerId: id,
  }));

  if (hallRegistrations.length > 0) {
    await db
      .insert(hallTenantRegisteredPlayers)
      .values(hallRegistrations)
      .onConflictDoNothing();
  }

  // 2. Add players to the schedule (onConflictDoNothing)
  const scheduleRegistrations = idsToAdd.map((id) => ({
    scheduleId,
    tenantPlayerId: id,
  }));

  if (scheduleRegistrations.length > 0) {
    await db
      .insert(schedulePlayers)
      .values(scheduleRegistrations)
      .onConflictDoNothing();
  }

  await invalidateGeneratedSchedule(scheduleId, db);

  return { success: true };
}
export async function updateScheduleConfigAction(
  requestHeaders: Headers,
  scheduleId: string,
  data: {
    numberOfSessions?: number;
    generatedMatches?: ScheduleRoundOverride[];
    manualSubstitutions?: ScheduleManualSubstitution[];
    matchmakingOptions?: MatchmakingOptions;
  },
) {
  const db = getDb();
  const tenant = await requireTenant(requestHeaders);

  const [schedule] = await db
    .select()
    .from(schedules)
    .where(and(eq(schedules.id, scheduleId), eq(schedules.tenantId, tenant.id)))
    .limit(1);

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  const updates: Record<string, unknown> = {};
  if (data.numberOfSessions !== undefined) {
    if (
      typeof data.numberOfSessions !== "number" ||
      !Number.isFinite(data.numberOfSessions) ||
      data.numberOfSessions < 1
    ) {
      throw new Error("numberOfSessions must be a positive integer");
    }
    updates.numberOfSessions = data.numberOfSessions;
  }
  if (data.generatedMatches !== undefined) {
    if (!Array.isArray(data.generatedMatches)) {
      throw new Error("generatedMatches must be an array");
    }
    updates.generatedMatches = data.generatedMatches;
  }
  if (data.manualSubstitutions !== undefined) {
    if (!Array.isArray(data.manualSubstitutions)) {
      throw new Error("manualSubstitutions must be an array");
    }
    updates.manualSubstitutions = data.manualSubstitutions;
  }
  if (data.matchmakingOptions !== undefined) {
    if (data.matchmakingOptions === null) {
      throw new Error("matchmakingOptions cannot be null");
    }
    updates.matchmakingOptions = data.matchmakingOptions;
  }

  if (Object.keys(updates).length === 0) {
    return { success: true };
  }

  await db
    .update(schedules)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(schedules.id, scheduleId));

  return { success: true };
}
