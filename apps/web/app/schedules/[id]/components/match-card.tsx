"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@workspace/ui/components/card";
import { CourtBlueprint } from "@workspace/ui/components/court-blueprint";
import { cn } from "@workspace/ui/lib/utils";
import type { GeneratedMatch } from "../../lib/match-generator";

type MatchCardProps = {
  match: GeneratedMatch;
  className?: string;
};

export const MatchCard: React.FC<MatchCardProps> = ({ match, className }) => {
  return (
    <Card className={cn("mx-auto w-full max-w-3xl overflow-hidden", className)}>
      <CardHeader>
        <div className="flex flex-row items-center justify-between w-full">
          <span className="text-sm font-semibold uppercase text-gray-601">
            {match.type}
          </span>
          <span className="text-sm text-gray-500">{match.skillRange}</span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-6">
        <CourtBlueprint
          court={{
            ...match,
            number:
              typeof match.number === "number"
                ? match.number
                : parseInt(match.number, 10),
          }}
        />
      </CardContent>
    </Card>
  );
};
