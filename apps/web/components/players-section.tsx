import type { Player } from "@/app/hall/lib/types";

import {
  SkillLegend,
  getSkillColor,
  getSkillInitial,
} from "./ui/skill-legend";

type PlayersSectionProps = {
  players?: Player[];
};

export function PlayersSection({ players }: PlayersSectionProps) {
  const safePlayers = players ?? [];

  const playersByGender = (gender: Player["gender"]) =>
    safePlayers.filter((player) => player.gender === gender);

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400 pb-2">
        Players
      </p>
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
