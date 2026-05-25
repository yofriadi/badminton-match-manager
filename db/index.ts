import { sql, eq, inArray, and, asc, desc, notInArray, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type DatabaseBinding = Parameters<typeof drizzle>[0];

export function createDatabase(binding: DatabaseBinding) {
  return drizzle(binding, { schema, logger: true });
}

export type Database = ReturnType<typeof createDatabase>;
export type { DatabaseBinding };

export { schema, sql };
export { eq, inArray, and, asc, desc, notInArray, isNull };
export { schema as dbSchema };
export * from "./schema";
export * from "./types";
