import {
	createDatabase,
	eq,
	hallTenantRegisteredPlayers,
	tenantPlayers,
} from "@packages/db";

import type { Player } from "./types";

/**
 * Fetch players registered to a hall from Postgres.
 * Falls back to an empty array if none are found.
 */
export async function getHallPlayers(hallId: string): Promise<Player[]> {
  const db = createDatabase();

  const rows = await db
    .select({
      name: tenantPlayers.name,
      gender: tenantPlayers.gender,
      skillLevel: tenantPlayers.skillLevel,
    })
    .from(hallTenantRegisteredPlayers)
    .innerJoin(
      tenantPlayers,
      eq(hallTenantRegisteredPlayers.tenantPlayerId, tenantPlayers.id),
    )
    .where(eq(hallTenantRegisteredPlayers.hallId, hallId));

  return rows.map((row) => ({
    name: row.name,
    gender: row.gender as Player["gender"],
    skillLevel: row.skillLevel as Player["skillLevel"],
  }));
}
