import { NextResponse } from "next/server";
import { createDatabase, users, asc, eq } from "@packages/db";

export async function GET() {
  const db = createDatabase();
  const pending = await db
    .select()
    .from(users)
    .where(eq(users.emailVerified, false))
    .orderBy(asc(users.createdAt));

  return NextResponse.json(pending);
}
