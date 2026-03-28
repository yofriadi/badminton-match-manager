"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Player } from "@/app/halls/lib/types";
import { SkillLegend, getSkillColor, getSkillInitial } from "./skill-legend";

type PlayersSectionProps = {
  players?: Player[];
  hallId?: string;
  onAddPlayer?: () => void;
};

export function PlayersSection({
  players,
  hallId,
  onAddPlayer,
}: PlayersSectionProps) {
  const safePlayers = players ?? [];

  const playersByGender = (gender: Player["gender"]) =>
    safePlayers.filter((player) => player.gender === gender);

  return (
    <div className="mx-4">
      <div className="flex items-center justify-between pb-2">
        <p className="text-xs uppercase tracking-wide text-gray-400">Players</p>
        {hallId && (
          <button
            onClick={onAddPlayer}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Plus className="size-3" />
            Add Player
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-900">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-gray-400">Male</p>
          <div className="flex flex-col gap-1">
            {playersByGender("male").map((player) => (
              <div
                key={`male-${player.name}`}
                className="flex items-center justify-between gap-4"
              >
                <span>{player.name}</span>
                <span
                  className="text-xs font-semibold text-center w-6 shrink-0"
                  style={{ color: getSkillColor(player.skillLevel) }}
                >
                  {getSkillInitial(player.skillLevel)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Female
          </p>
          <div className="flex flex-col gap-1">
            {playersByGender("female").map((player) => (
              <div
                key={`female-${player.name}`}
                className="flex items-center justify-between gap-4"
              >
                <span>{player.name}</span>
                <span
                  className="text-xs font-semibold text-center w-6 shrink-0"
                  style={{ color: getSkillColor(player.skillLevel) }}
                >
                  {getSkillInitial(player.skillLevel)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SkillLegend />
    </div>
  );
}
