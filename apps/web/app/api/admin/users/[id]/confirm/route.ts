import { NextResponse } from "next/server";
import { createDatabase, users, eq } from "@packages/db";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const db = createDatabase();
  const { id } = await context.params;

  const updated = await db
    .update(users)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(updated[0]);
}
