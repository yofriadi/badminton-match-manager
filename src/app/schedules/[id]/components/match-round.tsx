"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { MatchCard } from "./match-card";
import type { GeneratedMatch } from "../../lib/match-generator";

type MatchRoundProps = {
  gameNumber: number;
  sessionTime?: string;
  matches: GeneratedMatch[];
  headerAction?: React.ReactNode;
};

export const MatchRound: React.FC<MatchRoundProps> = ({
  gameNumber,
  sessionTime,
  matches,
  headerAction,
}) => {
  return (
    <div className="space-y-2 mt-8 first:mt-0">
      <div className="flex items-center gap-4 px-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-md font-medium text-gray-600 uppercase tracking-widest">
            Round {gameNumber}
          </span>
          <span className="text-xl font-black text-gray-900 tracking-tight">
            {sessionTime}
          </span>
        </div>
        <div className="h-px flex-1 bg-gray-100" />
        {headerAction}
      </div>
      <Carousel>
        <CarouselContent>
          {matches.map((match) => {
            const courtKey = `${match.game}-${match.number}`;
            return (
              <CarouselItem key={courtKey}>
                <MatchCard match={match} className="ml-4" />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
