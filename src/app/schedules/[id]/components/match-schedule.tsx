"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  generateMatches,
  type MatchmakingOptions,
} from "../../lib/match-generator";

// Import types from match-generator utility
import type { Player, GeneratedMatch } from "../../lib/match-generator";

// Import sub-components
import { EmptyMatchState } from "./empty-match-state";
import { RosterAdjustmentDialog } from "./roster-adjustment-dialog";
import { MatchmakingSettingsDialog } from "./matchmaking-settings-dialog";
import { MatchRound } from "./match-round";

type MatchScheduleProps = {
  players?: Player[];
  numberOfCourts?: number;
  courtNumbers?: (string | number)[];
  startTime?: string;
  durationHours?: number;
};

export const MatchSchedule: React.FC<MatchScheduleProps> = ({
  players = [],
  numberOfCourts: propNumberOfCourts,
  courtNumbers = [],
  startTime = "20:00",
  durationHours = 2,
}) => {
  // Use courtNumbers.length if available, otherwise fallback to propNumberOfCourts or 2
  const numberOfCourts =
    courtNumbers.length > 0 ? courtNumbers.length : (propNumberOfCourts ?? 2);

  // Calculate number of sessions (5 for 2-hour schedule)
  const numberOfSessions = Math.floor((durationHours * 60) / 24);
  const sessionDuration = 24; // minutes

  const [round1PlayerIds, setRound1PlayerIds] = useState<Set<string>>(
    new Set(players.map((p) => p.id)),
  );
  const [frozenMatches, setFrozenMatches] = useState<GeneratedMatch[]>([]);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(
    new Set(),
  );
  const [matchmakingOptions, setMatchmakingOptions] =
    useState<MatchmakingOptions>({
      strategy: "balanced",
      avoidRepeatPartners: true,
      avoidRepeatOpponents: true,
      prioritizeFairPlay: true,
    });

  // Calculate how many players needed to fill next multiple of 4 for Round 1
  const maxPlayers = numberOfCourts * 4;

  const handleOpenAddPlayer = (open: boolean) => {
    setIsAddPlayerOpen(open);
    if (open) {
      // When opening, sync selection with current Round 1 roster
      // If ALL players are currently selected (default), start with NONE selected for easier picking
      if (round1PlayerIds.size === players.length) {
        setSelectedPlayerIds(new Set());
      } else {
        setSelectedPlayerIds(new Set(round1PlayerIds));
      }
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    const newSelected = new Set(selectedPlayerIds);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      if (newSelected.size >= maxPlayers) {
        toast.error(
          `Maximum ${maxPlayers} players allowed for Round 1 (${numberOfCourts} courts)`,
        );
        return;
      }
      newSelected.add(playerId);
    }
    setSelectedPlayerIds(newSelected);
  };

  const handleUpdateRound1 = () => {
    const currentRound1Matches = courts.filter((m) => m.game === 1);
    const validCurrentMatches = currentRound1Matches.filter((match) =>
      match.players.every((playerName) => {
        const player = players.find((p) => p.name === playerName);
        return player && selectedPlayerIds.has(player.id);
      }),
    );

    setFrozenMatches(validCurrentMatches);
    setRound1PlayerIds(selectedPlayerIds);
    setIsAddPlayerOpen(false);
    toast.success(`Round 1 roster updated: ${selectedPlayerIds.size} players`);
  };

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const courts = useMemo(() => {
    if (!players || players.length < 4) {
      return [];
    }

    return generateMatches(
      players,
      round1PlayerIds,
      numberOfCourts,
      courtNumbers,
      numberOfSessions,
      startTime,
      sessionDuration,
      frozenMatches,
      matchmakingOptions,
    );
  }, [
    players,
    round1PlayerIds,
    numberOfCourts,
    courtNumbers,
    numberOfSessions,
    startTime,
    frozenMatches,
    matchmakingOptions,
  ]);

  const courtsByGame = useMemo(() => {
    return courts.reduce<Record<number, GeneratedMatch[]>>((grouped, court) => {
      const game = court.game;
      if (!grouped[game]) {
        grouped[game] = [];
      }
      grouped[game]!.push(court);
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

  if (!players || players.length < 4) {
    return (
      <EmptyMatchState
        message={`Not enough players to generate matches. Current: ${players?.length || 0} players, Minimum required: 4 players`}
        showAdjustButton
        onAdjustRound={() => handleOpenAddPlayer(true)}
      />
    );
  }

  if (courts.length === 0) {
    return (
      <EmptyMatchState message="Unable to generate matches with current player distribution." />
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-7xl space-y-4 py-2 px-1">
      {gameNumbers.map((gameNumber) => {
        const courtsForGame = courtsByGame[gameNumber] ?? [];
        const sessionTime = courtsForGame[0]?.time;

        const headerActions =
          gameNumber === 1 ? (
            <div className="flex items-center gap-2">
              <MatchmakingSettingsDialog
                options={matchmakingOptions}
                onUpdateOptions={setMatchmakingOptions}
              />
              <RosterAdjustmentDialog
                isOpen={isAddPlayerOpen}
                onOpenChange={handleOpenAddPlayer}
                players={players}
                selectedPlayerIds={selectedPlayerIds}
                maxPlayers={maxPlayers}
                onTogglePlayer={togglePlayerSelection}
                onUpdateRound={handleUpdateRound1}
              />
            </div>
          ) : null;

        return (
          <MatchRound
            key={gameNumber}
            gameNumber={gameNumber}
            sessionTime={sessionTime}
            matches={courtsForGame}
            headerAction={headerActions}
          />
        );
      })}
    </div>
  );
};

export default MatchSchedule;
