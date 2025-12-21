"use server";

import { createDatabase, dbSchema, eq } from "@packages/db";
import { requireTenant } from "./session-utils";
import { revalidatePath } from "next/cache";

export async function updateTenantAction(data: {
  name: string;
  description: string | null;
  contactInfo: Record<string, unknown>;
}) {
  const db = createDatabase();
  const tenant = await requireTenant();

  await db
    .update(dbSchema.tenants)
    .set({
      name: data.name,
      description: data.description,
      contactInfo: data.contactInfo,
      updatedAt: new Date(),
    })
    .where(eq(dbSchema.tenants.id, tenant.id));

  revalidatePath("/settings/profile");
  revalidatePath("/schedules");
}
