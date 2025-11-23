import {
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
					label: string;
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
	hallId: uuid("hall_id")
		.notNull()
		.references(() => halls.id, { onDelete: "cascade" }),
	hallName: text("hall_name").notNull(),
	pricePerPerson: integer("price_per_person").notNull(),
	date: text("date").notNull(), // Using text to store DATE values
	timeStart: text("time_start").notNull(), // Using text to store TIME values
	timeEnd: text("time_end").notNull(), // Using text to store TIME values
	playerLevelMin: text("player_level_min").notNull(),
	playerLevelMax: text("player_level_max").notNull(),
	courtNumbers: text("court_numbers")
		.array()
		.notNull()
		.default([]),
	tags: text("tags")
		.array()
		.notNull()
		.default([]),
	maxPlayers: integer("max_players").notNull().default(0),
	currentPlayers: integer("current_players").notNull().default(0),
	status: text("status").notNull().default("open"),
	description: text("description"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;

export const courtSessions = pgTable("court_sessions", {
	id: uuid("id").default(sql`uuidv7()`).primaryKey(),
	scheduleId: uuid("schedule_id")
		.notNull()
		.references(() => schedules.id, { onDelete: "cascade" }),
	timeStart: text("time_start").notNull(), // Using text to store TIME values
	timeEnd: text("time_end").notNull(), // Using text to store TIME values
	playerLevelMin: text("player_level_min").notNull(),
	playerLevelMax: text("player_level_max").notNull(),
	courtNumber: text("court_number").notNull(),
	maxPlayers: integer("max_players").notNull().default(0),
	currentPlayers: integer("current_players").notNull().default(0),
	status: text("status").notNull().default("open"),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type CourtSession = typeof courtSessions.$inferSelect;
export type NewCourtSession = typeof courtSessions.$inferInsert;
