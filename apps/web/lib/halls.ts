import { createDatabase, eq, halls } from "@packages/db";
import { getHallPlayers } from "@/app/halls/lib/players";
import { createHallBlueprint } from "./hall-utils";

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

  const players = await getHallPlayers(id);

  // Use centralized utility to create hall blueprint
  const hallWithBlueprint = createHallBlueprint({
    ...hall,
    players,
  });

  return {
    ...hall,
    rows: hallWithBlueprint.rows,
    players,
  };
}

