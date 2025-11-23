import { createDatabase } from "@repo/database";

// Prevent multiple connections in development
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDatabase> | undefined;
};

export const db = globalForDb.db ?? createDatabase();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
