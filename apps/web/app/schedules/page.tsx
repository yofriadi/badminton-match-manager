import {
  createDatabase,
  schedules,
  halls,
  scheduleCourts,
  courtHalls,
} from "@packages/db";
import { eq, inArray, asc } from "@packages/db";
import { getCurrentTenant } from "@/lib/session-utils";

export const dynamic = "force-dynamic";

import { ScheduleData } from "./lib/types";
import { processScheduleRows } from "./lib/schedule-processor";
import { ScheduleList } from "./components/schedule-list";
import { AppPageLayout } from "@/components/app-page-layout";

async function loadSchedules(): Promise<ScheduleData[]> {
  const db = createDatabase();
  const tenant = await getCurrentTenant();
  if (!tenant) return [];

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

  if (schedulesRows.length === 0) return [];

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

export default async function SchedulesPage() {
  const scheduleData = await loadSchedules();

  return (
    <AppPageLayout buttonLink="/schedules/create" buttonText="Create Schedule">
      <ScheduleList schedules={scheduleData} />
    </AppPageLayout>
  );
}
