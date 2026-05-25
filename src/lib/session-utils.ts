import { dbSchema, eq } from "@/db";
import { getAuth } from "./auth";
import { getDb } from "./db";

/**
 * Retrieves the tenant associated with the currently logged-in user.
 */
export async function getSessionFromHeaders(requestHeaders: Headers) {
  return getAuth().api.getSession({
    headers: requestHeaders,
  });
}

/**
 * Retrieves the tenant associated with the currently logged-in user.
 */
export async function getCurrentTenant(requestHeaders: Headers) {
  const session = await getSessionFromHeaders(requestHeaders);

  if (!session?.user) {
    return null;
  }

  const db = getDb();
  const tenant = await db.query.tenants.findFirst({
    where: eq(dbSchema.tenants.userId, session.user.id),
  });

  return tenant;
}

/**
 * Retrieves the tenant or throws an error if not found/unauthorized.
 */
export async function requireTenant(requestHeaders: Headers) {
  const tenant = await getCurrentTenant(requestHeaders);
  if (!tenant) {
    throw new Error("Unauthorized: No tenant found for the current user.");
  }
  return tenant;
}
