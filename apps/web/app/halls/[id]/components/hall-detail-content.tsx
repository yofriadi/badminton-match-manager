"use client";

import { useState } from "react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { PlayersSection } from "@/components/players-section";
import { CourtLayout } from "@/components/court-layout";
import { HallHeader } from "./hall-header";
import { HallAmenities } from "./hall-amenities";
import { ScheduleCarousel } from "@/components/schedule/schedule-carousel";
import { createHallBlueprint } from "@/lib/hall-utils";
import { ScheduleData } from "@/app/schedules/lib/types";
import type { Hall } from "@/app/halls/lib/types";
import { AddPlayerDialog } from "./add-player-dialog";

interface HallDetailContentProps {
  hall: Partial<Hall> & {
    id: string;
    name: string;
    address?: string | null;
    description?: string | null;
    priceRange?: string | null;
    amenities: string[];
    rows: any[];
    players: any[];
    courtCount: number;
  };
  schedules: ScheduleData[];
}

export function HallDetailContent({ hall, schedules }: HallDetailContentProps) {
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const hallBlueprint = createHallBlueprint(hall);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <HallHeader
        name={hall.name}
        address={hall.address || ""}
        priceRange={hall.priceRange || ""}
      />

      {hall.courtCount > 0 && (
        <div className="mt-2 px-4">
          <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
            Layout
          </p>
          <CourtLayout hall={hallBlueprint as Hall} renderCard={false} />
        </div>
      )}

      <HallAmenities amenities={hall.amenities} />

      <div className="mb-8">
        <PlayersSection
          players={hall.players}
          hallId={hall.id}
          onAddPlayer={() => setIsAddPlayerOpen(true)}
        />
      </div>

      <AddPlayerDialog
        hallId={hall.id}
        isOpen={isAddPlayerOpen}
        onOpenChange={setIsAddPlayerOpen}
      />

      <ScheduleCarousel schedules={schedules} />

      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
