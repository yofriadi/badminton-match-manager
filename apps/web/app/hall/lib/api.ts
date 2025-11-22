import { createDatabase } from "@repo/database";

export async function getHalls() {
  try {
    if (!process.env.DATABASE_URL) {
        console.warn("DATABASE_URL missing, returning empty halls.");
        return [];
    }
    const db = createDatabase();
    const halls = await db.query.halls.findMany();
    return halls;
  } catch (e) {
    console.error("Failed to get halls", e);
    return [];
  }
}
