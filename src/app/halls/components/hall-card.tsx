"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import RouterLink from "@/components/router-link";

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
        <p className="text-sm text-gray-500">{formatPriceRange(hall.priceRange)}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
		    {blueprintHall.courtCount > 0 && <CourtLayout hall={blueprintHall as Hall} renderCard={false} />}
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
                  } catch {
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
              <RouterLink href={actionButton.href}>
                {actionButton.label}
              </RouterLink>
            </Button>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}
