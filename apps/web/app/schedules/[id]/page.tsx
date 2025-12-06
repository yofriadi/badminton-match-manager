import { notFound } from "next/navigation";

import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { HallBlueprint } from "@/app/hall/[id]/components/hall-blueprint";
import { getHallById } from "@/app/hall/lib/api";

import { Badge } from "@workspace/ui/components/badge";
import { getScheduleById, getSchedulePlayers } from "../lib/api";
import { MatchSchedule } from "./components/match-schedule";
import { PlayersSection } from "@/components/players-section";

type HallDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HallDetailPage({ params }: HallDetailPageProps) {
  const { id } = await params;
  const currentSchedule = await getScheduleById(id);
  if (!currentSchedule) {
    notFound();
  }

  const hall = await getHallById(currentSchedule.hallId);

  if (!hall) {
    notFound();
  }

  // Fetch schedule players
  const schedulePlayers = await getSchedulePlayers(id);

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
          Court
        </p>
        <HallBlueprint
          hall={{
            ...hall,
            address: hall.address ?? "",
            description: hall.description ?? "",
            priceRange: hall.priceRange ?? "",
          }}
          renderCard={false}
          bookedCourts={currentSchedule.sessions.flatMap((session) =>
            Array.isArray(session.court) ? session.court : [session.court],
          )}
        />
      </div>

      <div className="px-4 pt-6 pb-8 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
            Date
          </p>
          <p className="text-sm font-medium text-gray-900">
            {currentSchedule.date}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
            Time
          </p>
          <p className="text-sm font-medium text-gray-900">20:00 - 22:00</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
            Price
          </p>
          <p className="text-sm font-medium text-gray-900">
            {currentSchedule.price}{" "}
            <span className="text-xs text-gray-400">/ person</span>
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
        <PlayersSection players={schedulePlayers as any[]} />
      </div>
      <p className="text-xs uppercase tracking-wide text-gray-400 pb-2 ml-4">
        Match Schedules
      </p>
      <MatchSchedule
        scheduleId={id}
        players={schedulePlayers as any[]}
        numberOfCourts={
          hall.layout.rows.reduce((total, row) => total + row.courts.length, 0)
        }
        startTime="20:00"
        durationHours={2}
      />

      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
