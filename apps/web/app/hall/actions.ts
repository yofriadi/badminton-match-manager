// @ts-nocheck
"use server";

import { halls } from "@repo/database";
import { db } from "../../lib/db";
import type { Hall } from "./lib/types";

export async function getHalls(): Promise<Hall[]> {
  const dbHalls = await db.select().from(halls);

  return dbHalls.map((hall) => ({
    id: hall.id,
    name: hall.name,
    address: hall.address || "",
    description: hall.description || "",
    priceRange: "", // Not in DB
    amenities: hall.amenities || [],
    rows: hall.layout.rows as any,
    players: [], // Not in DB
    // Extra properties from layout that might be needed by HallBlueprint if we passed them
    layout: hall.layout as any, 
  })) as unknown as Hall[];
}
