import {
  boolean,
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
  id: uuid("id")
    .default(sql`uuidv7()`)
    .primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  contactInfo: jsonb("contact_info")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "set null" })
    .unique(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export const halls = pgTable("halls", {
  id: uuid("id")
    .default(sql`uuidv7()`)
    .primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  description: text("description"),
  priceRange: text("price_range").notNull().default("0-0"),
  amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
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
          label?: string;
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

export const courtHalls = pgTable(
  "court_halls",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),
    hallId: uuid("hall_id")
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    isEnabled: boolean("is_enabled").notNull().default(true),
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
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),
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

export type HallTenantRegisteredPlayer =
  typeof hallTenantRegisteredPlayers.$inferSelect;
export type NewHallTenantRegisteredPlayer =
  typeof hallTenantRegisteredPlayers.$inferInsert;

export const schedules = pgTable("schedules", {
  id: uuid("id")
    .default(sql`uuidv7()`)
    .primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  hallId: uuid("hall_id")
    .notNull()
    .references(() => halls.id, { onDelete: "cascade" }),
  pricePerPerson: integer("price_per_person").notNull(),
  scheduleDate: date("schedule_date")
    .notNull()
    .default(sql`CURRENT_DATE`),
  playerLevelMin: text("player_level_min").notNull(),
  playerLevelMax: text("player_level_max").notNull(),
  tags: text("tags").array().notNull().default([]),
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
      .references(() => courtHalls.id, { onDelete: "restrict" }),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey(table.scheduleId, table.courtId, table.startAt)],
);

export type ScheduleCourt = typeof scheduleCourts.$inferSelect;
export type NewScheduleCourt = typeof scheduleCourts.$inferInsert;

export const courtSessions = pgTable("court_sessions", {
  id: uuid("id")
    .default(sql`uuidv7()`)
    .primaryKey(),
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

// Auth tables (plural) for BetterAuth
export const users = pgTable("users", {
  id: uuid("id")
    .default(sql`uuidv7()`)
    .primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  role: text("role").notNull().default("user"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id")
    .default(sql`uuidv7()`)
    .primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id")
      .default(sql`uuidv7()`)
      .primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("verifications_identifier_value_unique").on(
      table.identifier,
      table.value,
    ),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
