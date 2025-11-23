import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { getDatabaseUrl, schema } from "../index.js";
import { halls as hallsTable, type NewHall } from "../schema.js";
import { hallSeedData } from "../fixtures/halls.js";

export async function seedHalls() {
	const pool = new Pool({
		connectionString: getDatabaseUrl(),
		ssl:
			process.env.NODE_ENV === "production"
				? { rejectUnauthorized: false }
				: false,
	});

	const db = drizzle(pool, { schema });

	const hallRecords: NewHall[] = hallSeedData.map((hall) => {
		const layout = {
			padding: 32,
			courtSize: { width: 133, height: 200 },
			spacing: { row: 36, court: 18 },
			rows: hall.rows as any,
		};

		return {
			id: hall.id,
			name: hall.name,
			address: hall.address,
			description: hall.description,
			amenities: hall.amenities,
			layout,
		};
	});

	await db.insert(hallsTable).values(hallRecords).onConflictDoNothing();

	await pool.end();
}

const isDirectRun =
	process.argv[1] &&
	pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
	seedHalls()
		.then(() => {
			console.log("Hall seed completed");
		})
		.catch((error) => {
			console.error("Failed to seed halls", error);
			process.exitCode = 1;
		});
}
