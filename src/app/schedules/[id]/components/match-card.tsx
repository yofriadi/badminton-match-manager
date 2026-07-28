"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CourtBlueprint } from "@/components/ui/court-blueprint";
import { cn } from "@/lib/utils";
import type { GeneratedMatch, Player } from "../../lib/match-generator";

type MatchCardProps = {
  match: GeneratedMatch;
  className?: string;
  players?: Player[];
};

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  className,
  players,
}) => {
  return (
    <Card
      className={cn("mx-auto w-full max-w-[360px] overflow-hidden", className)}
      size="sm"
    >
      <CardHeader className="pb-0">
        <div className="flex flex-col items-start w-full">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
            {match.type}
          </span>
          <span className="text-xs text-gray-500">{match.skillRange}</span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-0">
        <CourtBlueprint
          court={{
            ...match,
            number:
              typeof match.number === "number"
                ? match.number
                : parseInt(match.number, 10),
          }}
          players={players}
        />
      </CardContent>
    </Card>
  );
};
