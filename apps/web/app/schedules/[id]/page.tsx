import { notFound } from "next/navigation";

import { MobileNavigation } from "@/components/mobile-navigation";
import { getHallById } from "@/lib/halls";

import { getScheduleById, getSchedulePlayers } from "../lib/api";
import { MatchSchedule } from "./components/match-schedule";
import { PlayersSection } from "@/components/players-section";
import { ScheduleDetailHeader } from "./components/schedule-detail-header";
import { ScheduleDetails } from "./components/schedule-details";
import { ScheduleHallBlueprint } from "./components/schedule-hall-blueprint";

type HallDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ScheduleDetailPage({
  params,
}: HallDetailPageProps) {
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

  const bookedCourts = currentSchedule.sessions.flatMap((session) =>
    Array.isArray(session.court) ? session.court : [session.court],
  );

  const courtNumbers = Array.from(new Set(bookedCourts));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScheduleDetailHeader
        hallName={hall.name}
        hallAddress={hall.address ?? ""}
      />

      <ScheduleHallBlueprint
        hall={{
          ...hall,
          address: hall.address ?? "",
          description: hall.description ?? "",
        }}
        bookedCourts={bookedCourts}
      />

      <ScheduleDetails
        date={currentSchedule.date}
        time="20:00 - 22:00"
        price={currentSchedule.price}
        amenities={hall.amenities}
      />

      <PlayersSection players={schedulePlayers} />

      <p className="text-xs uppercase tracking-wide text-gray-400 pb-2 ml-4 mt-6">
        Match Schedules
      </p>
      <MatchSchedule
        players={schedulePlayers}
        courtNumbers={courtNumbers}
        startTime="20:00"
        durationHours={2}
      />

      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
