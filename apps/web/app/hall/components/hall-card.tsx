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

import { HallBlueprint } from "./hall-blueprint";
import type { getHalls } from "../lib/api";
import { formatRupiahRange } from "../../../lib/utils";

export type HallFromApi = Awaited<ReturnType<typeof getHalls>>[number];

interface HallCardProps {
  hall: HallFromApi;
  actionButton?: {
    href: string;
    label: string;
  };
}

export function HallCard({ hall, actionButton }: HallCardProps) {
  let courtCounter = 0;
  const blueprintHall = {
    id: hall.id,
    name: hall.name,
    address: hall.address || "",
    description: hall.description || "",
    priceRange: hall.priceRange || "",
    amenities: hall.amenities,
    rows: hall.layout.rows.map((row) => ({
      number: row.number,
      orientation: row.orientation,
      courts: row.courts.map((court) => {
        courtCounter++;
        return {
          // Prefer explicit label; fall back to name for backward compatibility
          label: court.name || String(courtCounter),
          fill: court.fill,
          isAvailable: court.isAvailable,
        };
      }),
    })),
    players: [],
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="px-4 py-4">
        <CardTitle className="text-2xl font-semibold">{hall.name}</CardTitle>
        <p className="text-sm text-gray-500">{hall.address}</p>
      </CardHeader>
      <CardContent className="flex flex-col p-0">
        <div className="mt-2 px-4">
          <p className="pb-1 text-xs uppercase tracking-wide text-gray-400">
            Layout
          </p>
          <HallBlueprint hall={blueprintHall} renderCard={false} />
        </div>

        <div className="space-y-6 px-4 pt-6">
          <div>
            <p className="pb-1 text-xs uppercase tracking-wide text-gray-400">
              Price
            </p>
            <p className="text-sm font-medium text-gray-900">
              {formatRupiahRange(hall.priceRange)}
            </p>
          </div>
          <div>
            <p className="pb-2 text-xs uppercase tracking-wide text-gray-400">
              Amenities
            </p>
            <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide">
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
        <CardFooter className="my-4 flex w-full justify-center gap-8">
          <Button asChild className="w-[60%] my-2 rounded-full hover:bg-gray-800">
            <Link href={actionButton.href}>{actionButton.label}</Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
