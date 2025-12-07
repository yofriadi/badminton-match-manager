import { createDatabase, schedules, halls, scheduleCourts, courts } from "@packages/db";
import { eq, inArray, asc } from "@packages/db";

export const dynamic = "force-dynamic";

import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { Plays } from "./components/plays";
import { CtaButton } from "./components/cta-button";
import { ScheduleData } from "./lib/types";
import { ScrollToBottom } from "@/components/ui/scroll-to-bottom";

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

async function loadSchedules(): Promise<ScheduleData[]> {
  const db = createDatabase();
  const tenant = await db.query.tenants.findFirst();
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
      courtNumber: courts.number,
      startAt: scheduleCourts.startAt,
      endAt: scheduleCourts.endAt,
    })
    .from(scheduleCourts)
    .innerJoin(courts, eq(scheduleCourts.courtId, courts.id))
    .where(inArray(scheduleCourts.scheduleId, scheduleIds));

  const courtsBySchedule: Record<string, typeof courtRows> = {};
  for (const row of courtRows) {
    if (!courtsBySchedule[row.scheduleId]) courtsBySchedule[row.scheduleId] = [];
    courtsBySchedule[row.scheduleId]!.push(row);
  }

  return schedulesRows.map((row) => {
    const sessions = (courtsBySchedule[row.id] ?? []).map((session) => {
      const start = new Date(session.startAt as unknown as string);
      const end = new Date(session.endAt as unknown as string);
      return {
        timeStart: start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        timeEnd: end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        court: [String(session.courtNumber)],
        playerLevel: `${row.levelMin} - ${row.levelMax}`,
      };
    });

    // Merge sessions that share the exact same start/end time into a single entry
    const mergedSessions = Object.values(
      sessions.reduce<Record<string, (typeof sessions)[number]>>((acc, session) => {
        const key = `${session.timeStart}-${session.timeEnd}`;
        const existing = acc[key];

        if (existing) {
          existing.court.push(...session.court);
          // keep courts ordered numerically for stable display
          existing.court.sort((a, b) => Number(a) - Number(b));
        } else {
          acc[key] = { ...session };
        }

        return acc;
      }, {})
    );

    const scheduleDate = new Date(row.scheduleDate as unknown as string);

    return {
      id: row.id,
      hallId: row.hallId,
      hall: row.hallName,
      price: formatIDR(row.price),
      date: scheduleDate.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
      }),
      tags: [],
      sessions: mergedSessions,
    };
  });
}

export default async function Hall() {
  const scheduleData = await loadSchedules();

  return (
    <div className="min-h-screen bg-white flex flex-col space-y-4 py-4">
      {scheduleData.map((schedule) => (
        <Plays key={schedule.id} schedule={schedule} />
      ))}
      <CtaButton />
      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto z-20">
        <MobileNavigation />
      </div>
      <ScrollToBottom />
    </div>
  );
}
