import { useCallback, useEffect, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { MobileNavigation } from "@/components/mobile-navigation";
import { PlayersSection } from "@/components/players-section";
import { MatchSchedule } from "@/app/schedules/[id]/components/match-schedule";
import { ScheduleDetailHeader } from "@/app/schedules/[id]/components/schedule-detail-header";
import { ScheduleDetails } from "@/app/schedules/[id]/components/schedule-details";
import { ScheduleHallBlueprint } from "@/app/schedules/[id]/components/schedule-hall-blueprint";
import { AddSchedulePlayerDialog } from "@/app/schedules/[id]/components/add-schedule-player-dialog";
import { MatchmakingSettingsDialog } from "@/app/schedules/[id]/components/matchmaking-settings-dialog";
import type { MatchmakingOptions } from "@/app/schedules/lib/match-generator";
import { DEFAULT_MATCHMAKING_OPTIONS } from "@/app/schedules/lib/match-generator";
import { requireVerifiedRoute } from "../lib/guards";
import { getScheduleDetailServer } from "../server/loaders";

export const Route = createFileRoute("/schedules/$id")({
  beforeLoad: requireVerifiedRoute,
  loader: async ({ params }) => getScheduleDetailServer({ data: params.id }),
  component: ScheduleDetailRoute,
});

function ScheduleDetailRoute() {
  const data = Route.useLoaderData();
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [matchmakingOptions, setMatchmakingOptions] =
    useState<MatchmakingOptions>(
      data?.schedule.matchmakingOptions ?? DEFAULT_MATCHMAKING_OPTIONS,
    );

  // Reset state when the schedule ID changes via client-side navigation
  const scheduleMatchmakingOptions = data?.schedule.matchmakingOptions;
  useEffect(() => {
    setMatchmakingOptions(
      scheduleMatchmakingOptions ?? DEFAULT_MATCHMAKING_OPTIONS,
    );
  }, [data?.schedule.id, scheduleMatchmakingOptions]);

  const handleSaveMatchmakingOptions = useCallback(
    async (options: MatchmakingOptions) => {
      if (!data) throw new Error("No schedule data");
      if (isSaving) throw new Error("Save already in progress");
      setIsSaving(true);

      const previousOptions = matchmakingOptions;
      setMatchmakingOptions(options);

      try {
        const res = await fetch(`/api/schedules/${data.schedule.id}/config`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchmakingOptions: options }),
        });
        if (!res.ok) throw new Error("Failed to persist matchmaking options");
        toast.success("Matchmaking options saved");
      } catch {
        setMatchmakingOptions(previousOptions);
        toast.error("Failed to save matchmaking options");
        throw new Error("Failed to save matchmaking options");
      } finally {
        setIsSaving(false);
      }
    },
    [data, isSaving, matchmakingOptions],
  );

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

      <PlayersSection
        players={data.schedulePlayers}
        hallId={data.hall.id}
        onAddPlayer={() => setIsAddPlayerOpen(true)}
      />

      <AddSchedulePlayerDialog
        scheduleId={data.schedule.id}
        isOpen={isAddPlayerOpen}
        onOpenChange={setIsAddPlayerOpen}
        excludePlayerIds={data.schedulePlayers.map((p) => p.id)}
      />

      <div className="flex items-center justify-between mx-4 mt-6 pb-4">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          Match Schedules
        </p>
        <MatchmakingSettingsDialog
          options={matchmakingOptions}
          onSaveOptions={handleSaveMatchmakingOptions}
        />
      </div>

      <MatchSchedule
        key={data.schedule.id}
        scheduleId={data.schedule.id}
        players={data.schedulePlayers}
        courtNumbers={courtNumbers}
        startTime="20:00"
        durationHours={2}
        matchmakingOptions={matchmakingOptions}
        initialNumberOfSessions={data.schedule.numberOfSessions ?? undefined}
        initialGeneratedMatches={data.schedule.generatedMatches ?? undefined}
        initialManualSubstitutions={
          data.schedule.manualSubstitutions ?? undefined
        }
      />

      <div className="sticky bottom-0 left-0 right-0 mt-auto mx-auto w-full max-w-md px-4 pb-4 z-20">
        <MobileNavigation />
      </div>
    </div>
  );
}
