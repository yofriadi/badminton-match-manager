import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import * as schema from "./schema"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Database file is stored at project root
const dbPath = process.env.DATABASE_URL || join(__dirname, "../../../db.sqlite")

const sqlite = new Database(dbPath)
sqlite.pragma("journal_mode = WAL")

export const db = drizzle(sqlite, { schema })
