import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const pageContent = sqliteTable("page_content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  buttonText: text("button_text").notNull(),
  buttonSize: text("button_size").notNull().default("sm"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type PageContent = typeof pageContent.$inferSelect
export type NewPageContent = typeof pageContent.$inferInsert
