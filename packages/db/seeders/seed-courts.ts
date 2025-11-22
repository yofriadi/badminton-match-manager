
import { pathToFileURL } from "node:url";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { getDatabaseUrl, schema } from "../index.js";
import { halls, schedules, courtSessions, type NewHall, type NewSchedule, type NewCourtSession } from "../schema.js";

const HARDCODED_DATA = [
    {
      game: 1,
      type: "Mix Doubles",
      number: 1,
      players: ["Yofriadi Yahya", "Suhailah Oktaviana", "Dinda", "Andri"],
      isOccupied: true,
      time: "20:02",
    },
    {
      game: 1,
      type: "Men Doubles",
      number: 2,
      players: ["Jordan", "Casey"],
      isOccupied: true,
      time: "20:22",
    },
    {
      game: 2,
      type: "Women Doubles",
      number: 1,
      players: [],
      isOccupied: false,
      time: "20:44",
    },
    {
      game: 2,
      type: "Men Doubles",
      number: 2,
      players: ["Taylor", "Morgan"],
      isOccupied: true,
      time: "21:04",
    },
    {
      game: 3,
      type: "Mix Doubles",
      number: 1,
      players: [],
      isOccupied: false,
      time: "21:24",
    },
    {
      game: 3,
      type: "Men Doubles",
      number: 2,
      players: ["Riley", "Drew"],
      isOccupied: true,
      time: "21:44",
    },
];

export async function seedCourtSessions() {
	const pool = new Pool({
		connectionString: getDatabaseUrl(),
		ssl:
			process.env.NODE_ENV === "production"
				? { rejectUnauthorized: false }
				: false,
	});

	const db = drizzle(pool, { schema });

    // 1. Create a Dummy Hall
    const hallId = crypto.randomUUID();
    const hall: NewHall = {
        id: hallId,
        name: "Badminton Hall 1",
        address: "123 Badminton St",
        description: "A great hall",
        amenities: [],
        layout: { // Dummy layout
            padding: 10,
            courtSize: { width: 200, height: 100 },
            spacing: { row: 10, court: 10 },
            rows: []
        }
    };
    await db.insert(halls).values(hall).onConflictDoNothing();

    // 2. Create a Dummy Schedule
    const scheduleId = crypto.randomUUID();
    const schedule: NewSchedule = {
        id: scheduleId,
        hallId: hallId,
        hallName: hall.name,
        pricePerPerson: 50,
        date: new Date().toISOString().split('T')[0],
        timeStart: "18:00",
        timeEnd: "22:00",
        playerLevelMin: "beginner",
        playerLevelMax: "pro",
        courtNumbers: ["1", "2"],
    };
    await db.insert(schedules).values(schedule).onConflictDoNothing();

    // 3. Create Court Sessions from hardcoded data
    const sessions: NewCourtSession[] = HARDCODED_DATA.map(data => ({
        scheduleId: scheduleId,
        timeStart: data.time,
        timeEnd: data.time, // assuming instant or duration not specified
        playerLevelMin: "beginner",
        playerLevelMax: "pro",
        courtNumber: data.number.toString(),
        gameNumber: data.game,
        type: data.type,
        players: data.players,
        status: data.isOccupied ? "occupied" : "open",
        currentPlayers: data.players.length,
        maxPlayers: 4
    }));

    await db.insert(courtSessions).values(sessions).onConflictDoNothing();

	await pool.end();
}

const isDirectRun =
	process.argv[1] &&
	pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
	seedCourtSessions()
		.then(() => {
			console.log("Court sessions seed completed");
		})
		.catch((error) => {
			console.error("Failed to seed court sessions", error);
			process.exitCode = 1;
		});
}
