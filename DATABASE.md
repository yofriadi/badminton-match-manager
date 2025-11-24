# Database Setup

This project uses Drizzle ORM with SQLite for data persistence.

## Overview

All hardcoded data has been moved to database fetches. The application now uses:
- **Drizzle ORM** as the ORM
- **better-sqlite3** as the SQLite driver
- Database file located at `db.sqlite` (project root)

## Architecture

The database is managed in a shared package:
- **packages/db**: Contains schema, client, and Drizzle configuration
- **apps/web**: Imports `@workspace/db` to access the database

## Schema

The database schema is defined in `packages/db/src/schema.ts`.

Current tables:
- **page_content**: Stores page content including title, button text, and button size

## Commands

Run these commands from the `apps/web` directory:

```bash
# Generate Drizzle migration files
pnpm db:generate

# Push schema changes to database (no migration files)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Seed the database with initial data
pnpm db:seed
```

Or run directly in `packages/db`:

```bash
cd packages/db

# Generate migrations
pnpm db:generate

# Push to database
pnpm db:push

# Open studio
pnpm db:studio
```

## Development Workflow

1. **First time setup**: 
   - Install dependencies: `pnpm install`
   - Push schema: `pnpm db:push` (from apps/web or packages/db)
   - Seed database: `pnpm db:seed` (from apps/web)

2. **Seeding**: Run `pnpm db:seed` from `apps/web` to populate the database with initial content

3. **Schema changes**:
   - Edit `packages/db/src/schema.ts`
   - Run `pnpm db:push` to apply changes immediately
   - Or run `pnpm db:generate` to create migration files, then apply them

4. **Using Drizzle in code**:
   ```typescript
   import { db, pageContent } from "@workspace/db"
   import { desc } from "drizzle-orm"
   
   const [content] = await db
     .select()
     .from(pageContent)
     .orderBy(desc(pageContent.createdAt))
     .limit(1)
   ```

## Database Location

- Development: `db.sqlite` at project root (gitignored)
- The database file is excluded from version control

## Structure

```
packages/db/
├── src/
│   ├── schema.ts       # Drizzle schema definitions
│   ├── client.ts       # Database client instance
│   └── index.ts        # Public exports
├── drizzle/            # Generated migration files
└── drizzle.config.ts   # Drizzle Kit configuration
```

## Notes

- The database client is a singleton that creates a connection when imported
- better-sqlite3 requires native compilation - it's automatically built during installation
- The database uses WAL mode for better concurrent access
