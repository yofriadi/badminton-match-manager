import { createFileRoute, notFound } from "@tanstack/react-router";
import { MobileNavigation } from "@/components/mobile-navigation";
import { PlayersSection } from "@/components/players-section";
import { MatchSchedule } from "@/app/schedules/[id]/components/match-schedule";
import { ScheduleDetailHeader } from "@/app/schedules/[id]/components/schedule-detail-header";
import { ScheduleDetails } from "@/app/schedules/[id]/components/schedule-details";
import { ScheduleHallBlueprint } from "@/app/schedules/[id]/components/schedule-hall-blueprint";
import { requireVerifiedRoute } from "../lib/guards";
import { getScheduleDetailServer } from "../server/loaders";

export const Route = createFileRoute("/schedules/$id")({
  beforeLoad: requireVerifiedRoute,
  loader: async ({ params }) => getScheduleDetailServer({ data: params.id }),
  component: ScheduleDetailRoute,
});

function ScheduleDetailRoute() {
  const data = Route.useLoaderData();

  if (!data) {
    throw notFound();
  }

  const bookedCourts = data.schedule.sessions.flatMap((session) =>
    Array.isArray(session.court) ? session.court : [session.court],
  );
  const courtNumbers = Array.from(new Set(bookedCourts));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScheduleDetailHeader
        hallName={data.hall.name}
        hallAddress={data.hall.address ?? ""}
      />

      <ScheduleHallBlueprint
        hall={{
          ...data.hall,
          address: data.hall.address ?? "",
          description: data.hall.description ?? "",
        }}
        bookedCourts={bookedCourts}
      />

      <ScheduleDetails
        date={data.schedule.date}
        time="20:00 - 22:00"
        price={data.schedule.price}
        amenities={data.hall.amenities}
      />

      <PlayersSection players={data.schedulePlayers} />

      <p className="ml-4 mt-6 pb-2 text-xs uppercase tracking-wide text-gray-400">
        Match Schedules
      </p>
      <MatchSchedule
        players={data.schedulePlayers}
        courtNumbers={courtNumbers}
        startTime="20:00"
        durationHours={2}
      />

      <div className="sticky bottom-0 left-0 right-0 mt-auto mx-auto w-full max-w-md px-4 pb-4">
        <MobileNavigation />
      </div>
    </div>
  );
}
