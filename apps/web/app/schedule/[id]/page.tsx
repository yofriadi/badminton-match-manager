import { notFound } from "next/navigation";

import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { HallBlueprint } from "@/app/hall/[id]/components/hall-blueprint";
import { getHallById } from "@/app/hall/lib/data";
import type { Player } from "@/app/hall/lib/types";

import { Badge } from "@workspace/ui/components/badge";
import { getScheduleById, schedules } from "../../schedule/lib/data";
import { MatchSchedule } from "./components/match-schedule";
import {
  SkillLegend,
  getSkillInitial,
  getSkillColor,
} from "@/components/ui/skill-legend";

type HallDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HallDetailPage({ params }: HallDetailPageProps) {
  const { id } = await params;
  const currentSchedule = getScheduleById(id);
  if (!currentSchedule) {
    notFound();
  }

  const hall = getHallById(currentSchedule.hallId);

  if (!hall) {
    notFound();
  }

  const playersByGender = (gender: Player["gender"]) =>
    hall.players.filter((player) => player.gender === gender);

  const hallSchedules = [
    currentSchedule,
    ...schedules.filter(
      (schedule) =>
        schedule.hallId === currentSchedule.hallId &&
        schedule.id !== currentSchedule.id,
    ),
  ];

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
        <HallBlueprint hall={hall} renderCard={false} />
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
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-2">
            Players
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-900">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Man
              </p>
              <div className="flex flex-col gap-1">
                {playersByGender("man").map((player) => (
                  <div
                    key={`man-${player.name}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <span>{player.name}</span>
                    <span
                      className="text-xs font-semibold text-center w-6 shrink-0"
                      style={{ color: getSkillColor(player.skillLevel) }}
                    >
                      {getSkillInitial(player.skillLevel)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Woman
              </p>
              <div className="flex flex-col gap-1">
                {playersByGender("woman").map((player) => (
                  <div
                    key={`woman-${player.name}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <span>{player.name}</span>
                    <span
                      className="text-xs font-semibold text-center w-6 shrink-0"
                      style={{ color: getSkillColor(player.skillLevel) }}
                    >
                      {getSkillInitial(player.skillLevel)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <SkillLegend />
        </div>
      </div>
      <p className="text-xs uppercase tracking-wide text-gray-400 pb-2 ml-4">
        Match Schedules
      </p>
      <MatchSchedule />

      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
