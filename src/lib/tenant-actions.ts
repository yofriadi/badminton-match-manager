import { getDb } from "@/lib/db";
import { dbSchema, eq } from "@/db";
import { requireTenant } from "./session-utils";

export async function updateTenantAction(
  requestHeaders: Headers,
  data: {
  name: string;
  description: string | null;
  contactInfo: Record<string, unknown>;
},
) {
  const db = getDb();
  const tenant = await requireTenant(requestHeaders);

  await db
    .update(dbSchema.tenants)
    .set({
      name: data.name,
      description: data.description,
      contactInfo: data.contactInfo,
      updatedAt: new Date(),
    })
    .where(eq(dbSchema.tenants.id, tenant.id));
}
