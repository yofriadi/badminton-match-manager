"use client";

import React, { useMemo, useState } from "react";
import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";
import { CourtBlueprint, type Court } from "./court-blueprint";

interface CourtPlayingProps {
  courts: Court[];
}

export const CourtPlaying: React.FC<CourtPlayingProps> = ({ courts }) => {
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);

  const courtsByGame = useMemo(() => {
    return courts.reduce<Record<number, Court[]>>((grouped, court) => {
      if (!grouped[court.game]) {
        grouped[court.game] = [];
      }
      grouped[court.game]?.push(court);
      return grouped;
    }, {});
  }, [courts]);

  const gameNumbers = useMemo(
    () =>
      Object.keys(courtsByGame)
        .map(Number)
        .sort((a, b) => a - b),
    [courtsByGame],
  );

  if (courts.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">No court sessions available.</p>
      </div>
    );
  }

  return (
    <>
      {/* TODO: fix padding x cut the width of the carousel */}
      <div className="min-h-screen bg-white max-w-7xl space-y-8 py-8 px-1">
        {gameNumbers.map((gameNumber) => {
          const courtsForGame = courtsByGame[gameNumber] ?? [];

          return (
            <Carousel
              key={gameNumber}
              opts={{ align: "start" }}
              slideClassName="basis-[85%] sm:basis-[60%] md:basis-[320px]"
            >
              <CarouselContent className="touch-pan-x">
                {courtsForGame.map((court) => {
                  const courtKey = `${court.game}-${court.number}`;
                  const isSelected = selectedCourt === courtKey;

                  return (
                    <CarouselItem key={courtKey}>
                      <Card
                        className={`w-full overflow-hidden border-1 transition-all cursor-pointer ${
                          isSelected
                            ? "border-black"
                            : "border-gray-300 hover:border-gray-500"
                        }`}
                        onClick={() => setSelectedCourt(courtKey)}
                      >
                        <CardHeader className="flex flex-row items-center justify-between p-4">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Game {court.game}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                            {court.time}
                          </span>
                        </CardHeader>
                        <CardContent className="px-4">
                          <CourtBlueprint court={court} />
                        </CardContent>
                        <CardFooter className="justify-between p-4">
                          <span className="text-sm font-medium">
                            {court.isOccupied ? "Occupied" : "Available"}
                          </span>
                          {court.isOccupied && court.players.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Users className="h-3 w-3" />
                              <span>{court.players.length}</span>
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          );
        })}
      </div>
    </>
  );
};
