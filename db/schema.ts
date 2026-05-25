import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
  real,
} from "drizzle-orm/sqlite-core";

const createId = () => crypto.randomUUID();
const now = () => new Date();
const createEmptyObject = () => ({}) as Record<string, unknown>;
const createEmptyStringArray = () => [] as string[];

type RowOrientation = "vertical" | "horizontal";
type ContactInfo = Record<string, unknown>;
type HallLayout = {
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
};

export const orderVerifications = sqliteTable(
  "order_verifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    storeCode: text("store_code").notNull(),
    orderType: text("order_type").notNull(),
    orderId: text("order_id").notNull().unique(),
    orderAt: integer("order_at", { mode: "timestamp_ms" }).notNull(),
    status: text("status").notNull(),
    minWeight: real("min_weight").notNull(),
    actualWeight: real("actual_weight").notNull(),
    maxWeight: real("max_weight").notNull(),
    totalExpectedWeight: integer("total_expected_weight").notNull(),
    metadata: text("metadata", { mode: "json" }).notNull(),
    mediaUrl: text("media_url"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
    timezone: text("timezone").notNull(),
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

export const tenants = sqliteTable("tenants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(createId),
  name: text("name").notNull(),
  description: text("description"),
  contactInfo: text("contact_info", { mode: "json" })
    .$type<ContactInfo>()
    .notNull()
    .$defaultFn(createEmptyObject),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "set null" })
    .unique(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export const halls = sqliteTable("halls", {
  id: text("id")
    .primaryKey()
    .$defaultFn(createId),
  name: text("name").notNull(),
  address: text("address"),
  description: text("description"),
  priceRange: text("price_range").notNull().default("0-0"),
  amenities: text("amenities", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(createEmptyStringArray),
  layout: text("layout", { mode: "json" }).$type<HallLayout>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now),
});

export type Hall = typeof halls.$inferSelect;
export type NewHall = typeof halls.$inferInsert;

export const hallTenants = sqliteTable(
  "hall_tenants",
  {
    hallId: text("hall_id")
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (table) => [primaryKey({ columns: [table.hallId, table.tenantId] })],
);

export type HallTenant = typeof hallTenants.$inferSelect;
export type NewHallTenant = typeof hallTenants.$inferInsert;

export const courtHalls = sqliteTable(
  "court_halls",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(createId),
    hallId: text("hall_id")
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    isEnabled: integer("is_enabled", { mode: "boolean" })
      .notNull()
      .default(true),
  },
  (table) => [
    uniqueIndex("court_halls_hall_number").on(table.hallId, table.number),
    uniqueIndex("court_halls_hall_id").on(table.hallId, table.id),
  ],
);

export type CourtHall = typeof courtHalls.$inferSelect;
export type NewCourtHall = typeof courtHalls.$inferInsert;

export const tenantPlayers = sqliteTable(
  "tenant_players",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(createId),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    gender: text("gender").notNull(),
    skillLevel: text("skill_level").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
  },
  (table) => [
    uniqueIndex("tenant_players_tenant_name").on(table.tenantId, table.name),
  ],
);

export type TenantPlayer = typeof tenantPlayers.$inferSelect;
export type NewTenantPlayer = typeof tenantPlayers.$inferInsert;

export const hallTenantRegisteredPlayers = sqliteTable(
  "hall_tenant_registered_players",
  {
    hallId: text("hall_id")
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    tenantPlayerId: text("tenant_player_id")
      .notNull()
      .references(() => tenantPlayers.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
  },
  (table) => [primaryKey({ columns: [table.hallId, table.tenantPlayerId] })],
);

export type HallTenantRegisteredPlayer =
  typeof hallTenantRegisteredPlayers.$inferSelect;
export type NewHallTenantRegisteredPlayer =
  typeof hallTenantRegisteredPlayers.$inferInsert;

export const schedules = sqliteTable("schedules", {
  id: text("id")
    .primaryKey()
    .$defaultFn(createId),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  hallId: text("hall_id")
    .notNull()
    .references(() => halls.id, { onDelete: "cascade" }),
  pricePerPerson: integer("price_per_person").notNull(),
  scheduleDate: integer("schedule_date", { mode: "timestamp_ms" }).notNull(),
  playerLevelMin: text("player_level_min").notNull(),
  playerLevelMax: text("player_level_max").notNull(),
  tags: text("tags", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(createEmptyStringArray),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;

export const scheduleCourts = sqliteTable(
  "schedule_courts",
  {
    scheduleId: text("schedule_id")
      .notNull()
      .references(() => schedules.id, { onDelete: "cascade" }),
    hallId: text("hall_id")
      .notNull()
      .references(() => halls.id, { onDelete: "cascade" }),
    courtId: text("court_id")
      .notNull()
      .references(() => courtHalls.id, { onDelete: "restrict" }),
    startAt: integer("start_at", { mode: "timestamp_ms" }).notNull(),
    endAt: integer("end_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.scheduleId, table.courtId, table.startAt] })],
);

export type ScheduleCourt = typeof scheduleCourts.$inferSelect;
export type NewScheduleCourt = typeof scheduleCourts.$inferInsert;

export const courtSessions = sqliteTable("court_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(createId),
  scheduleId: text("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  hallId: text("hall_id").notNull(),
  courtId: text("court_id").notNull(),
  startAt: integer("start_at", { mode: "timestamp_ms" }).notNull(),
  endAt: integer("end_at", { mode: "timestamp_ms" }).notNull(),
  playerLevelMin: text("player_level_min").notNull(),
  playerLevelMax: text("player_level_max").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export type CourtSession = typeof courtSessions.$inferSelect;
export type NewCourtSession = typeof courtSessions.$inferInsert;

export const schedulePlayers = sqliteTable(
  "schedule_players",
  {
    scheduleId: text("schedule_id")
      .notNull()
      .references(() => schedules.id, { onDelete: "cascade" }),
    tenantPlayerId: text("tenant_player_id")
      .notNull()
      .references(() => tenantPlayers.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (table) => [primaryKey({ columns: [table.scheduleId, table.tenantPlayerId] })],
);

export type SchedulePlayer = typeof schedulePlayers.$inferSelect;
export type NewSchedulePlayer = typeof schedulePlayers.$inferInsert;

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(createId),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  role: text("role").notNull().default("user"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now),
});

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(createId),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(createId),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
  },
  (table) => [
    uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(createId),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
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

export { sql };
