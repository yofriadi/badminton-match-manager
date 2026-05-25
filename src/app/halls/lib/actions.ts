import {
  and,
  asc,
  courtHalls,
  eq,
  hallTenantRegisteredPlayers,
  halls,
  hallTenants,
  inArray,
  isNull,
  notInArray,
  tenantPlayers,
} from "@/db";
import { getDb } from "@/lib/db";
import { requireTenant } from "@/lib/session-utils";

async function getCourtNumbersByHallIds(
  db: ReturnType<typeof getDb>,
  hallIds: string[],
) {
  if (hallIds.length === 0) {
    return new Map<string, number[]>();
  }

  const courtRows = await db
    .select({
      hallId: courtHalls.hallId,
      number: courtHalls.number,
    })
    .from(courtHalls)
    .where(inArray(courtHalls.hallId, hallIds))
    .orderBy(asc(courtHalls.hallId), asc(courtHalls.number));

  const courtNumbersByHallId = new Map<string, number[]>();

  for (const row of courtRows) {
    const courtNumbers = courtNumbersByHallId.get(row.hallId) ?? [];
    courtNumbers.push(row.number);
    courtNumbersByHallId.set(row.hallId, courtNumbers);
  }

  return courtNumbersByHallId;
}

export async function getHallsForCurrentTenant(requestHeaders: Headers) {
  const db = getDb();
  const currentTenant = await requireTenant(requestHeaders);

  const hallRows = await db
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
    })
    .from(halls)
    .innerJoin(hallTenants, eq(halls.id, hallTenants.hallId))
    .where(eq(hallTenants.tenantId, currentTenant.id));

  const courtNumbersByHallId = await getCourtNumbersByHallIds(
    db,
    hallRows.map((hall) => hall.id),
  );

  return hallRows.map((hall) => {
    const courtNumbers = courtNumbersByHallId.get(hall.id) ?? [];

    return {
      ...hall,
      courtCount: courtNumbers.length,
      courtNumbers,
    };
  });
}

export async function getAvailableHallsForCurrentTenant(requestHeaders: Headers) {
  const db = getDb();
  const currentTenant = await requireTenant(requestHeaders);

  const hallRows = await db
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

  const courtNumbersByHallId = await getCourtNumbersByHallIds(
    db,
    hallRows.map((hall) => hall.id),
  );

  return hallRows.map((hall) => {
    const courtNumbers = courtNumbersByHallId.get(hall.id) ?? [];

    return {
      ...hall,
      courtCount: courtNumbers.length,
      courtNumbers,
    };
  });
}

export async function addHallToTenantAction(
  requestHeaders: Headers,
  hallId: string,
) {
  const db = getDb();
  const currentTenant = await requireTenant(requestHeaders);

  await db.insert(hallTenants).values({
    hallId,
    tenantId: currentTenant.id,
  });

  return { success: true };
}

export async function getRegisteredPlayersForCurrentTenant(
  requestHeaders: Headers,
  hallId?: string,
) {
  const db = getDb();
  const currentTenant = await requireTenant(requestHeaders);

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
  const db = getDb();

  if (!hallId) {
    return [];
  }

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

export async function getTenantPlayersAction(
  requestHeaders: Headers,
  excludeHallId?: string,
) {
  const db = getDb();
  const currentTenant = await requireTenant(requestHeaders);

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
  requestHeaders: Headers,
  hallId: string,
  data: {
    playerId?: string;
    name?: string;
    gender?: string;
    skillLevel?: string;
  },
) {
  const db = getDb();
  const currentTenant = await requireTenant(requestHeaders);

  let playerId = data.playerId;

  if (!playerId) {
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

  await db.insert(hallTenantRegisteredPlayers).values({
    hallId,
    tenantId: currentTenant.id,
    tenantPlayerId: playerId,
  });

  return { success: true };
}
