import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDatabase, dbSchema } from "@packages/db";

const db = createDatabase();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: dbSchema.users,
      session: dbSchema.sessions,
      account: dbSchema.accounts,
      verification: dbSchema.verifications,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(dbSchema.tenants).values({
            name: user.name,
            userId: user.id,
          });
        },
      },
    },
  },
  user: {
    additionalFields: {
      // optional on input; DB defaults to "user"
      role: { type: "string", required: false },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  // default DB-backed sessions
});
