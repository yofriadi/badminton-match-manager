import {
  sql,
  eq,
  inArray,
  and,
  asc,
  desc,
  notInArray,
  isNull,
} from "drizzle-orm";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool } from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

// Fix for Neon serverless in certain environments
if (typeof window === "undefined") {
  neonConfig.fetchConnectionCache = true;
}

export function getDatabaseUrl(): string {
  const { DATABASE_URL } = process.env;

  if (DATABASE_URL) {
    return DATABASE_URL;
  }

  throw new Error(
    "Missing required database environment variables. Please provide either DATABASE_URL or all of: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD",
  );
}

export function createDatabaseWithPool(databaseUrl?: string) {
  const connectionString = databaseUrl || getDatabaseUrl();
  const isNeon = connectionString.includes("neon.tech");

  if (isNeon) {
    const pool = new NeonPool({ connectionString });
    return drizzleNeon(pool, { schema, logger: true });
  }

  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  return drizzlePg(pool, { schema, logger: true });
}

// Create a default database instance using the connection string
export function createDatabase() {
  return createDatabaseWithPool();
}

// Export schema and sql for use in other parts of the application
export { schema, sql };
export { eq, inArray, and, asc, desc, notInArray, isNull };
export { schema as dbSchema };
export * from "./schema";
export * from "./types";
