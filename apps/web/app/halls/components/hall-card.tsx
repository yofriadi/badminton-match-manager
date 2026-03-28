"use client";

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
import { useTransition } from "react";
import { toast } from "sonner";
import { unstable_rethrow } from "next/navigation";

import { CourtLayout } from "../../../components/court-layout";
import type { Hall } from "../../../app/halls/lib/types";
import type { getHalls } from "@/lib/halls";
import { createHallBlueprint, formatPriceRange } from "../../../lib/hall-utils";

export type HallFromApi = Awaited<ReturnType<typeof getHalls>>[number] & {
  courtCount?: number;
};

interface HallCardProps {
  hall: HallFromApi;
  actionButton?: {
    href?: string;
    action?: (formData: FormData) => void | Promise<void>;
    label: string;
  };
}

export function HallCard({ hall, actionButton }: HallCardProps) {
  const [isPending, startTransition] = useTransition();

  // Use centralized utility to create hall blueprint with proper court labels
  const blueprintHall = createHallBlueprint({
    id: hall.id,
    name: hall.name,
    address: hall.address || "",
    description: hall.description || "",
    priceRange: hall.priceRange || "",
    amenities:
      typeof hall.amenities === "string"
        ? JSON.parse(hall.amenities as any)
        : hall.amenities,
    courtNumbers: hall.courtNumbers || [],
    rows:
      (typeof hall.layout === "string"
        ? JSON.parse(hall.layout as any)
        : hall.layout
      )?.rows.map((row: any) => ({
        number: row.number,
        orientation: row.orientation,
        courts: row.courts.map((court: any) => ({
          name: court.name,
          label: court.label,
          fill: court.fill,
          isAvailable: court.isAvailable,
        })),
      })) || [],
    players: [],
  });

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{hall.name}</CardTitle>
        <p className="text-sm text-gray-500">{hall.address}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {hall.courtCount && hall.courtCount > 0 && (
          <div>
            <p className="pb-1 text-xs uppercase tracking-wide text-gray-400">
              Layout
            </p>
            <CourtLayout hall={blueprintHall as Hall} renderCard={false} />
          </div>
        )}

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
          {actionButton.action ? (
            <form
              action={async (formData) => {
                startTransition(async () => {
                  try {
                    await actionButton.action!(formData);
                    toast.success("Hall added successfully");
                  } catch (error: any) {
                    // Detection for Next.js redirect errors (which are thrown)
                    const isRedirect =
                      error?.digest?.startsWith("NEXT_REDIRECT") ||
                      error?.cause?.digest?.startsWith("NEXT_REDIRECT") ||
                      error?.message === "NEXT_REDIRECT";

                    if (isRedirect) {
                      toast.success("Hall added successfully");
                      // Rethrow to let Next.js handle the actual redirect
                      throw error;
                    }

                    toast.error("Failed to add hall", {
                      description:
                        "Please check your connection and try again.",
                    });
                  }
                });
              }}
              className="w-[60%]"
            >
              <input type="hidden" name="hallId" value={hall.id} />
              <Button
                type="submit"
                className="hover:bg-gray-800 rounded-full w-full"
                disabled={isPending}
              >
                {isPending ? "Adding..." : actionButton.label}
              </Button>
            </form>
          ) : actionButton.href ? (
            <Button asChild className="hover:bg-gray-800 rounded-full w-[60%]">
              <Link href={actionButton.href}>{actionButton.label}</Link>
            </Button>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}
