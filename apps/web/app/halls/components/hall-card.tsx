import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

import { CourtLayout } from "../../../components/court-layout";
import type { getHalls } from "@/lib/halls";
import { createHallBlueprint, formatPriceRange } from "../../../lib/hall-utils";

export type HallFromApi = Awaited<ReturnType<typeof getHalls>>[number];

interface HallCardProps {
  hall: HallFromApi;
  actionButton?: {
    href: string;
    label: string;
  };
}

export function HallCard({ hall, actionButton }: HallCardProps) {
  // Use centralized utility to create hall blueprint with proper court labels
  const blueprintHall = createHallBlueprint({
    id: hall.id,
    name: hall.name,
    address: hall.address || "",
    description: hall.description || "",
    priceRange: hall.priceRange || "",
    amenities: hall.amenities,
    rows: hall.layout.rows.map((row: any) => ({
      number: row.number,
      orientation: row.orientation,
      courts: row.courts.map((court: any) => ({
        name: court.name, // Keep original name for transformation
        fill: court.fill,
        isAvailable: court.isAvailable,
      })),
    })),
    players: [],
  });

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{hall.name}</CardTitle>
        <p className="text-sm text-gray-500">{hall.address}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="pb-1 text-xs uppercase tracking-wide text-gray-400">
            Layout
          </p>
          <CourtLayout
            hall={{
              id: blueprintHall.id || "",
              name: blueprintHall.name || "",
              address: blueprintHall.address || "",
              description: blueprintHall.description || "",
              priceRange: blueprintHall.priceRange || "",
              amenities: blueprintHall.amenities || [],
              rows: blueprintHall.rows || [],
              players: blueprintHall.players || [],
            }}
            renderCard={false}
          />
        </div>

        <div className="space-y-6">
          <div>
            <p className="pb-1 text-xs uppercase tracking-wide text-gray-400">
              Price
            </p>
            <p className="text-sm font-medium text-gray-900">
              {formatPriceRange(hall.priceRange)}
            </p>
          </div>
          <div>
            <p className="pb-2 text-xs uppercase tracking-wide text-gray-400">
              Amenities
            </p>
            <div className="-mx-6 overflow-x-auto px-6 scrollbar-hide">
              <div className="flex min-w-max gap-2">
                {hall.amenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant="secondary"
                    className="whitespace-nowrap text-xs font-normal"
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      {actionButton ? (
        <CardFooter className="flex w-full justify-center">
          <Button asChild className="hover:bg-gray-800 rounded-full w-[60%]">
            <Link href={actionButton.href}>{actionButton.label}</Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
