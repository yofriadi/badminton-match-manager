import { asc, courtHalls, eq, halls, inArray } from "@/db";
import { getDb } from "@/lib/db";
import { getHallPlayers } from "@/app/halls/lib/players";
import { createHallBlueprint } from "./hall-utils";

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

export async function getHalls() {
  const db = getDb();
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
    .orderBy(asc(halls.createdAt));

  const courtNumbersByHallId = await getCourtNumbersByHallIds(
    db,
    hallRows.map((hall) => hall.id),
  );

	return hallRows.map((hall) => {
		const courtNumbers = courtNumbersByHallId.get(hall.id) ?? [];
		const layoutCourtCount =
			hall.layout.rows.reduce((count, row) => count + row.courts.length, 0);

		return {
			...hall,
			courtCount: courtNumbers.length || layoutCourtCount,
			courtNumbers,
		};
	});
}

export async function getHallById(id: string) {
  const db = getDb();
  const hall = await db.query.halls.findFirst({
    where: eq(halls.id, id),
  });

  if (!hall) return undefined;

  const players = await getHallPlayers(id);
  const courtRows = await db
    .select({
      number: courtHalls.number,
    })
    .from(courtHalls)
    .where(eq(courtHalls.hallId, id))
    .orderBy(asc(courtHalls.number));

  const courtNumbers = courtRows.map((court) => court.number);

  const hallWithBlueprint = createHallBlueprint({
    ...hall,
    players,
    courtNumbers,
  });
	const courtCount = courtNumbers.length || hallWithBlueprint.courtCount;

  return {
    ...hall,
    rows: hallWithBlueprint.rows,
    players,
    courtCount,
    courtNumbers,
  };
}
