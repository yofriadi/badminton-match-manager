import { createDatabase } from "@/db";
import { env } from "cloudflare:workers";

/**
 * Construct a fresh Drizzle client per request using the current Worker binding.
 * Cloudflare warns against keeping binding-derived clients in global scope.
 */
export function getDb() {
  return createDatabase(env.DB);
}
