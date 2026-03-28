"use server";

import {
  createDatabase,
  halls,
  hallTenants,
  eq,
  tenantPlayers,
  hallTenantRegisteredPlayers,
  courtHalls,
  isNull,
  and,
  sql,
  schema,
  notInArray,
} from "@packages/db";
import { requireTenant } from "@/lib/session-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getHallsForCurrentTenant() {
  const db = createDatabase();
  const currentTenant = await requireTenant();

  const hallsForTenant = await db
    .select({
      id: halls.id,
      name: halls.name,
      address: halls.address,
      description: halls.description,
      priceRange: halls.priceRange,
      amenities: halls.amenities,
      layout: halls.layout,
      createdAt: halls.createdAt,
      updatedAt: halls.updatedAt,
      courtCount:
        sql<number>`(SELECT count(*) FROM court_halls WHERE hall_id = ${halls.id})`.mapWith(
          Number,
        ),
      courtNumbers: sql<
        number[]
      >`(SELECT ARRAY_AGG(number ORDER BY number) FROM court_halls WHERE hall_id = ${halls.id})`,
    })
    .from(halls)
    .innerJoin(hallTenants, eq(halls.id, hallTenants.hallId))
    .where(eq(hallTenants.tenantId, currentTenant.id));

  return hallsForTenant;
}

export async function getAvailableHallsForCurrentTenant() {
  const db = createDatabase();
  const currentTenant = await requireTenant();

  const availableHalls = await db
    .select({
      id: halls.id,
      name: halls.name,
      address: halls.address,
      description: halls.description,
      priceRange: halls.priceRange,
      amenities: halls.amenities,
      layout: halls.layout,
      createdAt: halls.createdAt,
      updatedAt: halls.updatedAt,
      courtCount:
        sql<number>`(SELECT count(*) FROM court_halls WHERE hall_id = ${halls.id})`.mapWith(
          Number,
        ),
      courtNumbers: sql<
        number[]
      >`(SELECT ARRAY_AGG(number ORDER BY number) FROM court_halls WHERE hall_id = ${halls.id})`,
    })
    .from(halls)
    .leftJoin(
      hallTenants,
      and(
        eq(halls.id, hallTenants.hallId),
        eq(hallTenants.tenantId, currentTenant.id),
      ),
    )
    .where(isNull(hallTenants.hallId));

  return availableHalls;
}

export async function addHallToTenantAction(hallId: string) {
  const db = createDatabase();
  const currentTenant = await requireTenant();

  await db.insert(hallTenants).values({
    hallId,
    tenantId: currentTenant.id,
  });

  revalidatePath("/halls");
  revalidatePath("/halls/create");
  redirect("/halls");
}

export async function getRegisteredPlayersForCurrentTenant(hallId?: string) {
  const db = createDatabase();
  const currentTenant = await requireTenant();

  const query = db
    .selectDistinct({
      id: tenantPlayers.id,
      name: tenantPlayers.name,
      gender: tenantPlayers.gender,
      skillLevel: tenantPlayers.skillLevel,
    })
    .from(tenantPlayers)
    .innerJoin(
      hallTenantRegisteredPlayers,
      eq(tenantPlayers.id, hallTenantRegisteredPlayers.tenantPlayerId),
    )
    .where(
      and(
        eq(hallTenantRegisteredPlayers.tenantId, currentTenant.id),
        hallId ? eq(hallTenantRegisteredPlayers.hallId, hallId) : undefined,
      ),
    );

  const registeredPlayers = await query;

  return registeredPlayers;
}

export async function getCourtsForHall(hallId: string) {
  const db = createDatabase();

  if (!hallId) {
    return [];
  }

  // Use the courtHalls table
  const courtData = await db
    .select({
      id: courtHalls.id,
      number: courtHalls.number,
      isEnabled: courtHalls.isEnabled,
    })
    .from(courtHalls)
    .where(eq(courtHalls.hallId, hallId))
    .orderBy(courtHalls.number);

  return courtData;
}

export async function getTenantPlayersAction(excludeHallId?: string) {
  const db = createDatabase();
  const currentTenant = await requireTenant();

  let whereClause = eq(tenantPlayers.tenantId, currentTenant.id);

  if (excludeHallId) {
    const registeredPlayersSubquery = db
      .select({ id: hallTenantRegisteredPlayers.tenantPlayerId })
      .from(hallTenantRegisteredPlayers)
      .where(eq(hallTenantRegisteredPlayers.hallId, excludeHallId));

    whereClause = and(
      whereClause,
      notInArray(tenantPlayers.id, registeredPlayersSubquery),
    )!;
  }

  const players = await db
    .select({
      id: tenantPlayers.id,
      name: tenantPlayers.name,
      gender: tenantPlayers.gender,
      skillLevel: tenantPlayers.skillLevel,
    })
    .from(tenantPlayers)
    .where(whereClause)
    .orderBy(tenantPlayers.name);

  return players;
}

export async function registerPlayerToHallAction(
  hallId: string,
  data: {
    playerId?: string;
    name?: string;
    gender?: string;
    skillLevel?: string;
  },
) {
  const db = createDatabase();
  const currentTenant = await requireTenant();

  let playerId = data.playerId;

  if (!playerId) {
    // Create new player in tenant_players
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

    if (!newPlayer) throw new Error("Failed to create player");
    playerId = newPlayer.id;
  }

  // Register player to hall
  await db.insert(hallTenantRegisteredPlayers).values({
    hallId,
    tenantId: currentTenant.id,
    tenantPlayerId: playerId,
  });

  revalidatePath(`/halls/${hallId}`);
  return { success: true };
}
