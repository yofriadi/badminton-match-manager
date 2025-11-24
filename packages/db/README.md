# @workspace/db

Shared database package using Drizzle ORM with SQLite.

## Usage

```typescript
import { db, pageContent } from "@workspace/db"
import { desc, eq } from "drizzle-orm"

// Query data
const allContent = await db.select().from(pageContent)

// With filters and ordering
const [latest] = await db
  .select()
  .from(pageContent)
  .orderBy(desc(pageContent.createdAt))
  .limit(1)

// Insert data
const [newContent] = await db
  .insert(pageContent)
  .values({
    title: "New Page",
    buttonText: "Click Me",
    buttonSize: "lg",
  })
  .returning()

// Update data
await db
  .update(pageContent)
  .set({ title: "Updated Title" })
  .where(eq(pageContent.id, "some-id"))

// Delete data
await db
  .delete(pageContent)
  .where(eq(pageContent.id, "some-id"))
```

## Schema

The schema is defined in `src/schema.ts`. To add new tables:

1. Define the table in `src/schema.ts`
2. Export types for the table
3. Run `pnpm db:generate` to create migration files
4. Run `pnpm db:push` to apply changes

Example:

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const myTable = sqliteTable("my_table", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type MyTable = typeof myTable.$inferSelect
export type NewMyTable = typeof myTable.$inferInsert
```

## Commands

```bash
# Generate migration files from schema
pnpm db:generate

# Push schema to database without migrations
pnpm db:push

# Run migrations (if using migration files)
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## Configuration

The database path is configured in `drizzle.config.ts` and `src/client.ts`.

By default, the database file is stored at the project root as `db.sqlite`.

You can override the database path using the `DATABASE_URL` environment variable:

```bash
DATABASE_URL=/path/to/db.sqlite
```
