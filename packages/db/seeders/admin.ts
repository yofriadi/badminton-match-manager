import { createDatabase, users, dbSchema } from "../index";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

async function main() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
    process.exit(1);
  }

  const db = createDatabase();

  // If admin exists, ensure role/emailVerified
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(users)
      .set({ role: "admin", emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, existing[0].id));
    console.log("Admin user already exists; role/emailVerified updated.");
    process.exit(0);
  }

  // Use BetterAuth to hash password
  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: dbSchema.users,
        session: dbSchema.sessions,
        account: dbSchema.accounts,
        verification: dbSchema.verifications,
      },
    }),
    user: {
      additionalFields: {
        role: { type: "string", required: true },
      },
    },
    advanced: {
      generateId: "uuid",
      database: {
        generateId: "uuid",
      },
    },
    emailAndPassword: { enabled: true },
  });

  console.log("Seeding admin user...");
  const res = await auth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: "Admin",
      role: "admin",
    },
  });

  const userId = res?.data?.user?.id;
  if (userId) {
    await db
      .update(users)
      .set({ role: "admin", emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
    console.log("Admin seeded:", res.data.user.email);
  } else {
    const fallback = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);
    if (fallback.length > 0) {
      await db
        .update(users)
        .set({ role: "admin", emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, fallback[0].id));
      console.log("Admin updated from DB row:", fallback[0].email);
    } else {
      throw new Error("Admin creation failed: no user id returned");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
