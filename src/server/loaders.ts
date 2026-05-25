import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  asc,
  courtHalls,
  eq,
  halls,
  inArray,
  scheduleCourts,
  schedules,
} from "@/db";
import {
  getAvailableHallsForCurrentTenant,
  getHallsForCurrentTenant,
} from "@/app/halls/lib/actions";
import { getHallWithDetails, getHallSchedules } from "@/app/halls/[id]/lib/hall-service";
import { getScheduleById, getSchedulePlayers } from "@/app/schedules/lib/api";
import { processScheduleRows } from "@/app/schedules/lib/schedule-processor";
import type { ScheduleData } from "@/app/schedules/lib/types";
import { getDb } from "@/lib/db";
import { getHallById } from "@/lib/halls";
import { getCurrentTenant, getSessionFromHeaders, requireTenant } from "@/lib/session-utils";

function requestHeaders() {
  return getRequest().headers;
}

export const getSessionServer = createServerFn({ method: "GET" }).handler(
  async () => getSessionFromHeaders(requestHeaders()),
);

export const getTenantServer = createServerFn({ method: "GET" }).handler(
  async () => {
    const tenant = await requireTenant(requestHeaders());

    return {
      ...tenant,
      contactInfo: (tenant.contactInfo ?? {}) as Record<string, {}>,
    };
  },
);

export const getTenantHallsServer = createServerFn({ method: "GET" }).handler(
  async () => getHallsForCurrentTenant(requestHeaders()),
);

export const getAvailableTenantHallsServer = createServerFn({
  method: "GET",
}).handler(async () => getAvailableHallsForCurrentTenant(requestHeaders()));

export const getHallDetailServer = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: hallId }) => {
    const hall = await getHallWithDetails(hallId);

    if (!hall) {
      return null;
    }

    const schedules = await getHallSchedules(
      requestHeaders(),
      hallId,
      hall.name,
    );

    return { hall, schedules };
  });

async function loadSchedules(): Promise<ScheduleData[]> {
  const db = getDb();
  const tenant = await getCurrentTenant(requestHeaders());

  if (!tenant) {
    return [];
  }

  const schedulesRows = await db
    .select({
      id: schedules.id,
      hallId: schedules.hallId,
      hallName: halls.name,
      price: schedules.pricePerPerson,
      scheduleDate: schedules.scheduleDate,
      levelMin: schedules.playerLevelMin,
      levelMax: schedules.playerLevelMax,
    })
    .from(schedules)
    .innerJoin(halls, eq(schedules.hallId, halls.id))
    .where(eq(schedules.tenantId, tenant.id))
    .orderBy(asc(schedules.scheduleDate));

  if (schedulesRows.length === 0) {
    return [];
  }

  const scheduleIds = schedulesRows.map((row) => row.id);

  const courtRows = await db
    .select({
      scheduleId: scheduleCourts.scheduleId,
      courtNumber: courtHalls.number,
      startAt: scheduleCourts.startAt,
      endAt: scheduleCourts.endAt,
    })
    .from(scheduleCourts)
    .innerJoin(courtHalls, eq(scheduleCourts.courtId, courtHalls.id))
    .where(inArray(scheduleCourts.scheduleId, scheduleIds));

  return processScheduleRows(schedulesRows, courtRows);
}

export const getSchedulesServer = createServerFn({ method: "GET" }).handler(
  async () => loadSchedules(),
);

export const getScheduleDetailServer = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: scheduleId }) => {
    const schedule = await getScheduleById(scheduleId);

    if (!schedule) {
      return null;
    }

    const hall = await getHallById(schedule.hallId);

    if (!hall) {
      return null;
    }

    const schedulePlayers = await getSchedulePlayers(scheduleId);

    return {
      hall,
      schedule,
      schedulePlayers,
    };
  });
