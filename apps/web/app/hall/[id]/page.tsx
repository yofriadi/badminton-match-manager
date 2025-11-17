import { notFound } from "next/navigation";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { HallBlueprint } from "./components/hall-blueprint";
import { getHalls } from "../lib/api";
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
  const halls = await getHalls();
  const hall = halls.find((h) => h.id === id);

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

  const hallSchedules = schedules.filter(
    (schedule) => schedule.hallId === hall.id,
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{hall.label}</h1>
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
            name: hall.label,
            address: hall.address || "",
            description: hall.description || "",
            priceRange: hall.priceRange || "",
            amenities: hall.amenities,
            rows: hall.layout.rows,
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
      </div>

      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
