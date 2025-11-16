import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { getDatabaseUrl, schema } from "../index.js";
import { halls as hallsTable, type NewHall } from "../schema.js";
import { generateHallSvg } from "../../../apps/web/lib/svg.js";
import { DEFAULT_BLUEPRINT_DIMENSIONS } from "../../../apps/web/lib/layout.js";
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
		const { padding, courtSize, spacing } = DEFAULT_BLUEPRINT_DIMENSIONS;
		const layout = {
			padding,
			courtSize: { ...courtSize },
			spacing: { ...spacing },
			rows: hall.rows,
		};

		const blueprintSvg = generateHallSvg({
			hallId: hall.id,
			padding: layout.padding,
			courtSize: layout.courtSize,
			spacing: layout.spacing,
			rows: layout.rows,
		});

		return {
			id: hall.id,
			label: hall.name,
			address: hall.address,
			description: hall.description,
			priceRange: hall.priceRange,
			amenities: hall.amenities,
			layout,
			blueprintSvg,
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
