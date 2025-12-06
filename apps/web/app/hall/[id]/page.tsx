import { notFound } from "next/navigation";
import {
  createDatabase,
  schedules as schedulesTable,
  scheduleCourts,
  courts,
  eq,
  inArray,
  and,
} from "@packages/db";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { PlayersSection } from "@/components/players-section";
import { HallBlueprint } from "./components/hall-blueprint";
import { getHalls } from "../lib/api";
import { getHallPlayers } from "../lib/players";
import { ScheduleData } from "@/app/schedule/lib/types";
import { ScheduleCard } from "@/components/schedule-card";

// Disable static generation since this page fetches data from database
export const dynamic = "force-dynamic";
import { Badge } from "@workspace/ui/components/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";

type HallDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

async function loadHallSchedules(
  hallId: string,
  hallName: string,
): Promise<ScheduleData[]> {
  const db = createDatabase();
  const tenant = await db.query.tenants.findFirst();
  if (!tenant) return [];

  const scheduleRows = await db
    .select({
      id: schedulesTable.id,
      hallId: schedulesTable.hallId,
      price: schedulesTable.pricePerPerson,
      scheduleDate: schedulesTable.scheduleDate,
      levelMin: schedulesTable.playerLevelMin,
      levelMax: schedulesTable.playerLevelMax,
    })
    .from(schedulesTable)
    .where(
      and(eq(schedulesTable.tenantId, tenant.id), eq(schedulesTable.hallId, hallId)),
    );

  if (scheduleRows.length === 0) return [];

  const scheduleIds = scheduleRows.map((row) => row.id);

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
    if (!courtsBySchedule[row.scheduleId]) {
      courtsBySchedule[row.scheduleId] = [];
    }
    courtsBySchedule[row.scheduleId]!.push(row);
  }

  return scheduleRows.map((row) => {
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

    const mergedSessions = Object.values(
      sessions.reduce<Record<string, (typeof sessions)[number]>>((acc, session) => {
        const key = `${session.timeStart}-${session.timeEnd}`;
        const existing = acc[key];

        if (existing) {
          existing.court.push(...session.court);
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
      hall: hallName,
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

export default async function HallDetailPage({ params }: HallDetailPageProps) {
  const { id } = await params;
  const halls = await getHalls();
  const hall = halls.find((h) => h.id === id);

  if (!hall) {
    notFound();
  }

  const hallPlayers = await getHallPlayers(hall.id);
  const hallSchedules = await loadHallSchedules(hall.id, hall.name);

  let courtCounter = 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{hall.name}</h1>
          <p className="text-sm text-gray-500">{hall.address}</p>
        </div>
      </div>

      <div className="mt-2 px-4">
        <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
          Layout
        </p>
        <HallBlueprint
          hall={{
            id: hall.id,
            name: hall.name,
            address: hall.address || "",
            description: hall.description || "",
            priceRange: hall.priceRange || "",
            amenities: hall.amenities,
            rows: hall.layout.rows.map((row) => ({
              number: row.number,
              orientation: row.orientation,
              courts: row.courts.map((court) => {
                courtCounter++;
                return {
                  label: court.name || String(courtCounter),
                  fill: court.fill,
                  isAvailable: court.isAvailable,
                };
              }),
            })),
            players: [],
          }}
          renderCard={false}
        />
      </div>

      <div className="px-4 pt-6 pb-8 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
            Price
          </p>
          <p className="text-sm font-medium text-gray-900">
            {hall.priceRange}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-2">
            Amenities
          </p>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {hall.amenities.map((amenity) => (
                <Badge
                  key={amenity}
                  variant="secondary"
                  className="text-xs font-normal whitespace-nowrap"
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <PlayersSection players={hallPlayers} />
        <p className="text-xs uppercase tracking-wide text-gray-400">
          Upcoming Schedules
        </p>
        {hallSchedules.length > 0 && (
          <Carousel
            opts={{ align: "start" }}
            slideClassName="basis-[92%] sm:basis-[70%] md:basis-[360px]"
          >
            <CarouselContent className="touch-pan-x">
              {hallSchedules.map((schedule, index) => (
                <CarouselItem key={`${schedule.hallId}-${schedule.date}-${index}`}>
                  <ScheduleCard
                    schedule={schedule}
                    detailHref={`/schedule/${schedule.id}`}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>

      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
