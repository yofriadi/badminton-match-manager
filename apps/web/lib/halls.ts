import { createDatabase, eq, halls, sql, schema, asc } from "@packages/db";
import { getHallPlayers } from "@/app/halls/lib/players";
import { createHallBlueprint } from "./hall-utils";

export async function getHalls() {
  const db = createDatabase();
  const result = await db
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
      courtCount: sql<number>`(SELECT count(*) FROM court_halls WHERE hall_id = ${halls.id})`.mapWith(Number),
      courtNumbers: sql<number[]>`(SELECT ARRAY_AGG(number ORDER BY number) FROM court_halls WHERE hall_id = ${halls.id})`,
    })
    .from(halls)
    .orderBy(asc(halls.createdAt));

  return result;
}

export async function getHallById(id: string) {
  const db = createDatabase();
  const hall = await db.query.halls.findFirst({
    where: eq(halls.id, id),
  });

  if (!hall) return undefined;

  const players = await getHallPlayers(id);

  // Fetch count and numbers of courts in court_halls for this hall
  const courtData = await db
    .select({ 
      count: sql<number>`count(*)`.mapWith(Number),
      numbers: sql<number[]>`ARRAY_AGG(number ORDER BY number)`
    })
    .from(schema.courtHalls)
    .where(eq(schema.courtHalls.hallId, id));
  
  const courtCount = courtData[0]?.count || 0;
  const courtNumbers = courtData[0]?.numbers || [];

  // Use centralized utility to create hall blueprint
  const hallWithBlueprint = createHallBlueprint({
    ...hall,
    players,
    courtNumbers,
  });

  return {
    ...hall,
    rows: hallWithBlueprint.rows,
    players,
    courtCount,
    courtNumbers,
  };
}

