"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { MatchCard } from "./match-card";
import type { GeneratedMatch, Player } from "../../lib/match-generator";

type MatchRoundProps = {
  gameNumber: number;
  matches: GeneratedMatch[];
  headerAction?: React.ReactNode;
  players?: Player[];
};

export const MatchRound: React.FC<MatchRoundProps> = ({
  gameNumber,
  matches,
  headerAction,
  players,
}) => {
  return (
    <div className="space-y-2 mt-8 first:mt-0">
      <div className="flex items-center gap-4 px-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 text-md font-medium uppercase tracking-widest">
            Round {gameNumber}
          </span>
        </div>
        <div className="h-px flex-1 bg-gray-100" />
        {headerAction}
      </div>
      <Carousel>
        <CarouselContent className="py-1 px-4">
          {matches.map((match) => {
            const courtKey = `${match.game}-${match.number}`;
            return (
              <CarouselItem
                key={courtKey}
                className={
                  matches.length > 1
                    ? "basis-[82%] sm:basis-[75%] md:basis-[480px]"
                    : "basis-full"
                }
              >
                <MatchCard match={match} players={players} />
              </CarouselItem>
            );
          })}
          {matches.length > 1 && (
            <div className="w-4 shrink-0 sm:w-8" aria-hidden="true" />
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
