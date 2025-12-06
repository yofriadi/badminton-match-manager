"use server";

import { createDatabase, halls, hallTenants, tenants, eq, tenantPlayers, hallTenantRegisteredPlayers, courts, courtHalls } from "@packages/db";

export async function getHallsForCurrentTenant() {
  const db = createDatabase();

  // For now, we'll get the first tenant we find
  // In a real app, this would be based on the authenticated user
  const currentTenant = await db.query.tenants.findFirst();

  if (!currentTenant) {
    return [];
  }

  const hallsForTenant = await db
    .select({
      id: halls.id,
      name: halls.name,
      address: halls.address,
      description: halls.description,
      priceRange: halls.priceRange,
      amenities: halls.amenities,
      layout: halls.layout,
      createdAt: halls.createdAt,
      updatedAt: halls.updatedAt,
    })
    .from(halls)
    .innerJoin(hallTenants, eq(halls.id, hallTenants.hallId))
    .where(eq(hallTenants.tenantId, currentTenant.id));

  return hallsForTenant;
}

export async function getRegisteredPlayersForCurrentTenant() {
  const db = createDatabase();

  // For now, we'll get the first tenant we find
  // In a real app, this would be based on the authenticated user
  const currentTenant = await db.query.tenants.findFirst();

  if (!currentTenant) {
    return [];
  }

  const registeredPlayers = await db
    .select({
      id: tenantPlayers.id,
      name: tenantPlayers.name,
      gender: tenantPlayers.gender,
      skillLevel: tenantPlayers.skillLevel,
    })
    .from(tenantPlayers)
    .innerJoin(hallTenantRegisteredPlayers, eq(tenantPlayers.id, hallTenantRegisteredPlayers.tenantPlayerId))
    .where(eq(hallTenantRegisteredPlayers.tenantId, currentTenant.id));

  return registeredPlayers;
}

export async function getCourtsForHall(hallId: string) {
  const db = createDatabase();

  if (!hallId) {
    return [];
  }

  // For now, use the existing courts table
  // TODO: After migration, switch to courtHalls table
  const courtData = await db
    .select({
      id: courts.id,
      number: courts.number,
      isEnabled: courts.isEnabled,
    })
    .from(courts)
    .where(eq(courts.hallId, hallId))
    .orderBy(courts.number);

  return courtData;
}