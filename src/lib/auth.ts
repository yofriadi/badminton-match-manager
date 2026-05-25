import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dbSchema } from "@/db";
import { env } from "cloudflare:workers";
import { getDb } from "./db";

function getAuthBaseUrl() {
  return (
    env.BETTER_AUTH_URL ||
    env.BETTER_AUTH_BASE_URL ||
    env.VITE_BETTER_AUTH_URL ||
    env.NEXT_PUBLIC_BETTER_AUTH_URL
  );
}

export function getAuth() {
  const db = getDb();

  return betterAuth({
    baseURL: getAuthBaseUrl(),
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
