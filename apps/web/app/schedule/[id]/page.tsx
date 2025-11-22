import { notFound } from "next/navigation";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { HallBlueprint } from "@/app/hall/[id]/components/hall-blueprint";
import { getHalls } from "@/app/hall/lib/api";
import type { Player } from "@/app/hall/lib/types";
import { Badge } from "@workspace/ui/components/badge";
import { MatchSchedule } from "./components/match-schedule";
import {
  SkillLegend,
  getSkillInitial,
  getSkillColor,
} from "@/components/ui/skill-legend";
import { createDatabase } from "@repo/database";

type HallDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HallDetailPage({ params }: HallDetailPageProps) {
  const { id } = await params;

  let schedules: any[] = [];
  try {
     if (!process.env.DATABASE_URL) {
        console.warn("DATABASE_URL missing, returning empty schedules.");
     } else {
        const db = createDatabase();
        schedules = await db.query.schedules.findMany();
     }
  } catch (e) {
     console.error("Failed to fetch schedules", e);
  }

  const currentSchedule = schedules.find((s) => s.id === id);

  if (!currentSchedule) {
    // For build process, we might not want to throw 404 if data is missing due to no DB
    // But `notFound()` is the correct Next.js way.
    // If we want to pass build, we should ideally seed data or have env vars.
    // Since we can't, catching the error above helps, but currentSchedule will be undefined.
    // If we just return 404, nextjs might be fine with it for dynamic pages.
    // But if `generateStaticParams` is not used (it is not here), it is dynamic.
    notFound();
  }

  const halls = await getHalls();
  const hall = halls.find((h) => h.id === currentSchedule.hallId);

  if (!hall) {
    notFound();
  }

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
            rows: hall.layout.rows,
            players: [],
          }}
          renderCard={false}
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
            {currentSchedule.pricePerPerson}{" "}
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
