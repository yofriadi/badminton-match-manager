import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dbSchema } from "@/db";
import { env } from "cloudflare:workers";
import { getDb } from "./db";

function getAuthBaseUrl() {
  return env.BETTER_AUTH_URL || "http://localhost:3000";
}

export function getAuth() {
  const db = getDb();
  const baseURL = getAuthBaseUrl();

  return betterAuth({
    baseURL,
    trustedOrigins: [baseURL],
    database: drizzleAdapter(db, {
      provider: "sqlite",
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
        generateId: "uuid",
      },
    },
    emailAndPassword: {
      enabled: true,
    },
  });
}
