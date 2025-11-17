import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

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

	const pool = new Pool({
		connectionString,
		ssl:
			process.env.NODE_ENV === "production"
				? { rejectUnauthorized: false }
				: false,
	});

	return drizzle(pool, { schema, logger: true });
}

// Create a default database instance using the connection string
export function createDatabase() {
	return createDatabaseWithPool();
}

// Export schema and sql for use in other parts of the application
export { schema, sql };
export * from "./schema";
export * from "./types";
