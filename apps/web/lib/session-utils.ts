import { auth } from "./auth";
import { headers } from "next/headers";
import { createDatabase, dbSchema, eq } from "@packages/db";

/**
 * Retrieves the tenant associated with the currently logged-in user.
 */
export async function getCurrentTenant() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const db = createDatabase();
  let tenant = await db.query.tenants.findFirst({
    where: eq(dbSchema.tenants.userId, session.user.id),
  });

  return tenant;
}

/**
 * Retrieves the tenant or throws an error if not found/unauthorized.
 */
export async function requireTenant() {
  const tenant = await getCurrentTenant();
  if (!tenant) {
    throw new Error("Unauthorized: No tenant found for the current user.");
  }
  return tenant;
}
