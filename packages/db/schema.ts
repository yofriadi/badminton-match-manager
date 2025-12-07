import {
	date,
	decimal,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uuid,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

type RowOrientation = "vertical" | "horizontal";

export const orderVerifications = pgTable(
  "order_verifications",
  {
    id: serial("id").primaryKey(),
    storeCode: varchar("store_code", { length: 20 }).notNull(),
    orderType: varchar("order_type", { length: 20 }).notNull(),
    orderId: varchar("order_id", { length: 100 }).notNull().unique(),
    orderAt: timestamp("order_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    minWeight: decimal("min_weight", {
      precision: 10,
      scale: 2,
    }).notNull(),
    actualWeight: decimal("actual_weight", {
      precision: 10,
      scale: 2,
    }).notNull(),
    maxWeight: decimal("max_weight", {
      precision: 10,
      scale: 2,
    }).notNull(),
    totalExpectedWeight: integer("total_expected_weight").notNull(),
    metadata: jsonb("metadata").notNull(),
    mediaUrl: text("media_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    timezone: varchar("timezone", { length: 50 }).notNull(),
  },
  (table) => [
    index("idx_order_verification_store_code").on(table.storeCode),
    index("idx_order_verification_order_id").on(table.orderId),
    index("idx_order_verification_status").on(table.status),
    index("idx_order_verification_order_at").on(table.orderAt),
    index("idx_order_verification_order_type").on(table.orderType),
    index("idx_order_verification_metadata").on(table.metadata),
  ],
);

export type OrderVerification = typeof orderVerifications.$inferSelect;
export type NewOrderVerification = typeof orderVerifications.$inferInsert;

export const tenants = pgTable("tenants", {
  id: uuid("id").default(sql`uuidv7()`).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  contactInfo: jsonb("contact_info")
    .$type<Record<string, any>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export const halls = pgTable("halls", {
  id: uuid("id").default(sql`uuidv7()`).primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  description: text("description"),
  priceRange: text("price_range")
    .notNull()
    .default("0-0"),
  amenities: jsonb("amenities")
    .$type<string[]>()
    .notNull()
    .default([]),
  layout: jsonb("layout")
    .$type<{
      padding: number;
      courtSize: { width: number; height: number };
      spacing: { row: number; court: number };
      rows: Array<{
        number: number;
        orientation: RowOrientation;
        courts: Array<{
          name: string;
          fill?: string;
          isAvailable?: boolean;
        }>;
      }>;
    }>()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Hall = typeof halls.$inferSelect;
export type NewHall = typeof halls.$inferInsert;

export const hallTenants = pgTable(
  "hall_tenants",
  {
    hallId: uuid("hall_id")
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [primaryKey(table.hallId, table.tenantId)],
);

export type HallTenant = typeof hallTenants.$inferSelect;
export type NewHallTenant = typeof hallTenants.$inferInsert;

// Temporary: Use existing courts table until migration is run
export const courts = pgTable(
  "courts",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    hallId: uuid("hall_id")
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    isEnabled: integer("is_enabled").notNull().default(1), // 1 = true, 0 = false
  },
  (table) => [
    uniqueIndex("courts_hall_number").on(table.hallId, table.number),
    uniqueIndex("courts_hall_id").on(table.hallId, table.id),
  ],
);

export type Court = typeof courts.$inferSelect;
export type NewCourt = typeof courts.$inferInsert;

// Future: This will replace the courts table after migration
export const courtHalls = pgTable(
  "court_halls",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    hallId: uuid("hall_id")
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    isEnabled: integer("is_enabled").notNull().default(1),
  },
  (table) => [
    uniqueIndex("court_halls_hall_number").on(table.hallId, table.number),
    uniqueIndex("court_halls_hall_id").on(table.hallId, table.id),
  ],
);

export type CourtHall = typeof courtHalls.$inferSelect;
export type NewCourtHall = typeof courtHalls.$inferInsert;

export const tenantPlayers = pgTable(
  "tenant_players",
  {
    id: uuid("id").default(sql`uuidv7()`).primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    gender: text("gender").notNull(),
    skillLevel: text("skill_level").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("tenant_players_tenant_name").on(table.tenantId, table.name),
  ],
);

export type TenantPlayer = typeof tenantPlayers.$inferSelect;
export type NewTenantPlayer = typeof tenantPlayers.$inferInsert;

export const hallTenantRegisteredPlayers = pgTable(
  "hall_tenant_registered_players",
  {
    hallId: uuid("hall_id")
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tenantPlayerId: uuid("tenant_player_id")
      .notNull()
      .references(() => tenantPlayers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey(table.hallId, table.tenantPlayerId)],
);

export type HallTenantRegisteredPlayer = typeof hallTenantRegisteredPlayers.$inferSelect;
export type NewHallTenantRegisteredPlayer = typeof hallTenantRegisteredPlayers.$inferInsert;

export const schedules = pgTable("schedules", {
	id: uuid("id").default(sql`uuidv7()`).primaryKey(),
	tenantId: uuid("tenant_id")
		.notNull()
		.references(() => tenants.id, { onDelete: "cascade" }),
	hallId: uuid("hall_id")
		.notNull()
		.references(() => halls.id, { onDelete: "cascade" }),
	pricePerPerson: integer("price_per_person").notNull(),
	scheduleDate: date("schedule_date").notNull(),
	playerLevelMin: text("player_level_min").notNull(),
	playerLevelMax: text("player_level_max").notNull(),
	tags: text("tags")
		.array()
		.notNull()
		.default([]),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;

export const scheduleCourts = pgTable(
	"schedule_courts",
	{
		scheduleId: uuid("schedule_id")
			.notNull()
			.references(() => schedules.id, { onDelete: "cascade" }),
		hallId: uuid("hall_id")
			.notNull()
			.references(() => halls.id, { onDelete: "cascade" }),
		courtId: uuid("court_id")
			.notNull()
			.references(() => courts.id, { onDelete: "restrict" }),
		startAt: timestamp("start_at", { withTimezone: true }).notNull(),
		endAt: timestamp("end_at", { withTimezone: true }).notNull(),
	},
	(table) => [primaryKey(table.scheduleId, table.courtId, table.startAt)],
);

export type ScheduleCourt = typeof scheduleCourts.$inferSelect;
export type NewScheduleCourt = typeof scheduleCourts.$inferInsert;

export const courtSessions = pgTable("court_sessions", {
	id: uuid("id").default(sql`uuidv7()`).primaryKey(),
	scheduleId: uuid("schedule_id")
		.notNull()
		.references(() => schedules.id, { onDelete: "cascade" }),
	hallId: uuid("hall_id").notNull(),
	courtId: uuid("court_id").notNull(),
	startAt: timestamp("start_at", { withTimezone: true }).notNull(),
	endAt: timestamp("end_at", { withTimezone: true }).notNull(),
	playerLevelMin: text("player_level_min").notNull(),
	playerLevelMax: text("player_level_max").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export type CourtSession = typeof courtSessions.$inferSelect;
export type NewCourtSession = typeof courtSessions.$inferInsert;

export const schedulePlayers = pgTable(
	"schedule_players",
	{
		scheduleId: uuid("schedule_id")
			.notNull()
			.references(() => schedules.id, { onDelete: "cascade" }),
		tenantPlayerId: uuid("tenant_player_id")
			.notNull()
			.references(() => tenantPlayers.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }),
	},
	(table) => [primaryKey(table.scheduleId, table.tenantPlayerId)],
);

export type SchedulePlayer = typeof schedulePlayers.$inferSelect;
export type NewSchedulePlayer = typeof schedulePlayers.$inferInsert;
