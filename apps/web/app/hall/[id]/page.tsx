import { notFound } from "next/navigation";

import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { HallBlueprint } from "./components/hall-blueprint";
import { getHallById } from "../lib/data";
import type { Player, SkillLevel } from "../lib/types";

import { Badge } from "@workspace/ui/components/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";
import { Schedule } from "./components/schedule";
import { schedules } from "../../schedule/lib/data";

type HallDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HallDetailPage({ params }: HallDetailPageProps) {
  const { id } = await params;
  const hall = getHallById(id);

  if (!hall) {
    notFound();
  }

  const getSkillInitial = (level: SkillLevel) => {
    const mapping: Record<SkillLevel, string> = {
      beginner: "B",
      novice: "N",
      intermediate: "I",
      advanced: "A",
      pro: "P",
    };
    return mapping[level];
  };

  const skillLegend: { initial: string; label: string }[] = [
    { initial: "B", label: "Beginner" },
    { initial: "N", label: "Novice" },
    { initial: "I", label: "Intermediate" },
    { initial: "A", label: "Advanced" },
    { initial: "P", label: "Professional" },
  ];

  const playersByGender = (gender: Player["gender"]) =>
    hall.players.filter((player) => player.gender === gender);

  const hallSchedules = schedules.filter(
    (schedule) => schedule.hallId === hall.id,
  );

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
            Price
          </p>
          <p className="text-sm font-medium text-gray-900">{hall.priceRange}</p>
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
                <CarouselItem
                  key={`${schedule.hallId}-${schedule.date}-${index}`}
                >
                  <Schedule schedule={schedule} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-2">
            Players
          </p>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-3">
            <div className="flex gap-4 min-w-max text-xs text-gray-600">
              {skillLegend.map((item) => (
                <span
                  key={item.initial}
                  className="whitespace-nowrap text-gray-400"
                >
                  <span className="font-semibold text-gray-400">
                    {item.initial}
                  </span>{" "}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
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
                    <span className="text-xs font-semibold text-gray-500 text-center w-6 shrink-0">
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
                    <span className="text-xs font-semibold text-gray-500 text-center w-6 shrink-0">
                      {getSkillInitial(player.skillLevel)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
