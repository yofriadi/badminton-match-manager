
"use server";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { courtSessions, schema } from "@repo/database";
import { eq, asc } from "drizzle-orm";

// Mock fetch if DB is not available
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

export async function getCourtSessions() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.warn("DATABASE_URL not found, returning empty list or mock data.");
        // For testing purposes in restricted environment, we might want to return HARDCODED_DATA
        // if we can't connect, but the request is to fetch from DB.
        // I will leave it as empty for now, or maybe I should fallback?
        // If I fallback, I'm not "changing to fetches", I'm "trying to fetch but failing".
        // Let's try to fetch.
        return [];
    }

    const pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    const db = drizzle(pool, { schema });

    try {
        const sessions = await db.query.courtSessions.findMany({
            orderBy: [asc(courtSessions.timeStart)]
        });

        if (sessions.length === 0) {
             // If DB is empty, maybe return empty or handle it.
             return [];
        }

        // Map to the format expected by the UI
        return sessions.map(s => ({
            game: s.gameNumber ?? 0,
            type: (s.type ?? "Mix Doubles") as "Men Doubles" | "Women Doubles" | "Mix Doubles",
            number: parseInt(s.courtNumber),
            players: s.players as string[],
            isOccupied: s.status === "occupied" || (s.players as string[]).length > 0, // Logic might vary
            time: s.timeStart
        }));
    } catch (error) {
        console.error("Failed to fetch court sessions:", error);
        // If fetch fails (e.g. connection refused), we might want to throw or return empty.
        // Returning empty array will show no courts.
        return [];
    } finally {
        await pool.end();
    }
}
