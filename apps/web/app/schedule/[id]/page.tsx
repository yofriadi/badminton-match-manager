import { notFound } from "next/navigation";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { HallBlueprint } from "@/app/hall/[id]/components/hall-blueprint";
import { getHalls } from "@/app/hall/lib/api";
import { Badge } from "@workspace/ui/components/badge";
import { MatchSchedule } from "./components/match-schedule";
import { createDatabase } from "@packages/db";

type HallDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HallDetailPage({ params }: HallDetailPageProps) {
  const { id } = await params;
  const db = createDatabase();
  const schedules = await db.query.schedules.findMany();
  const currentSchedule = schedules.find((s) => s.id === id);

  if (!currentSchedule) {
    notFound();
  }

  const halls = await getHalls();
  const hall = halls.find((h) => h.id === currentSchedule.hallId);

  if (!hall) {
    notFound();
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  const formatTimeRange = (start: Date, end: Date) => {
    const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    return `${start.toLocaleTimeString("en-US", opts)} - ${end.toLocaleTimeString(
      "en-US",
      opts,
    )}`;
  };

  const formatPrice = (value: number) =>
    `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;

  const start = new Date(currentSchedule.startAt);
  const end = new Date(currentSchedule.endAt);

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
          <p className="text-sm font-medium text-gray-900">{formatDate(start)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
            Time
          </p>
          <p className="text-sm font-medium text-gray-900">
            {formatTimeRange(start, end)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
            Price
          </p>
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(currentSchedule.pricePerPerson)}{" "}
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
