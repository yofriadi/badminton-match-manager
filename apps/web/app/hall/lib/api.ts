import { createDatabase } from "@packages/db";

export async function getHalls() {
  const db = createDatabase();
  const halls = await db.query.halls.findMany();
  return halls;
}
