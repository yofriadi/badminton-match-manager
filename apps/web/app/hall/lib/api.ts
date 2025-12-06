import { createDatabase, eq, halls, tenantPlayers, hallTenantRegisteredPlayers } from "@packages/db";

export async function getHalls() {
  const db = createDatabase();
  const result = await db.query.halls.findMany({
    orderBy: (halls, { asc }) => [asc(halls.createdAt)],
  });
  return result;
}

export async function getHallById(id: string) {
  const db = createDatabase();
  const hall = await db.query.halls.findFirst({
    where: eq(halls.id, id),
  });

  if (!hall) return undefined;

  const players = await db
    .select({
      name: tenantPlayers.name,
      gender: tenantPlayers.gender,
      skillLevel: tenantPlayers.skillLevel,
    })
    .from(tenantPlayers)
    .innerJoin(
      hallTenantRegisteredPlayers,
      eq(tenantPlayers.id, hallTenantRegisteredPlayers.tenantPlayerId)
    )
    .where(eq(hallTenantRegisteredPlayers.hallId, id));

  const rows = hall.layout.rows.map((row) => ({
    ...row,
    courts: row.courts.map((court) => ({
      ...court,
      label: court.name || (court as any).label,
    })),
  }));

  return {
    ...hall,
    rows,
    players: players as any[],
  };
}
