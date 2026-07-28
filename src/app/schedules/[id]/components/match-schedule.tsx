"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  calculateSkillRange,
  generateMatches,
  getOptimalMatchType,
  type MatchmakingOptions,
} from "../../lib/match-generator";

// Import types from match-generator utility
import type { Player, GeneratedMatch } from "../../lib/match-generator";
import type {
  ScheduleManualSubstitution,
  ScheduleRoundOverride,
} from "../../lib/types";

// Import sub-components
import AnimatedCtaButton from "@/components/ui/animated-cta-button";
import { EmptyMatchState } from "./empty-match-state";
import { RosterAdjustmentDialog } from "./roster-adjustment-dialog";
import { MatchRound } from "./match-round";

const EMPTY_MANUAL_SUBSTITUTIONS: ScheduleManualSubstitution[] = [];

type MatchScheduleProps = {
  scheduleId: string;
  players?: Player[];
  numberOfCourts?: number;
  courtNumbers?: (string | number)[];
  startTime?: string;
  durationHours?: number;
  matchmakingOptions?: MatchmakingOptions;
  initialNumberOfSessions?: number;
  initialGeneratedMatches?: ScheduleRoundOverride[];
  initialManualSubstitutions?: ScheduleManualSubstitution[];
};

function toGeneratedMatches(
  overrides: ScheduleRoundOverride[],
  allPlayers: Player[],
): GeneratedMatch[] {
  const playerById = new Map(allPlayers.map((player) => [player.id, player]));
  return overrides.map((override) => {
    const names =
      override.playerIds && override.playerIds.length > 0
        ? override.playerIds
            .map((id) => playerById.get(id)?.name)
            .filter((name): name is string => !!name)
        : (override.players ?? []);
    return {
      ...override,
      players: names,
      isOccupied: true,
    };
  });
}

function toScheduleRounds(
  matches: GeneratedMatch[],
  allPlayers: Player[],
): ScheduleRoundOverride[] {
  const playerByName = new Map(
    allPlayers.map((player) => [player.name, player.id]),
  );
  return matches.map(({ isOccupied: _, ...rest }) => ({
    ...rest,
    playerIds: rest.players
      .map((name) => playerByName.get(name))
      .filter((id): id is string => !!id),
  }));
}

type SubstitutionSlot = ScheduleManualSubstitution["slot"];

function createSubstitutionKey(
  substitution: Pick<ScheduleManualSubstitution, "game" | "court" | "slot">,
) {
  return `${substitution.game}:${substitution.court}:${substitution.slot}`;
}

function mergeManualSubstitutions(
  existing: ScheduleManualSubstitution[],
  next: ScheduleManualSubstitution[],
): ScheduleManualSubstitution[] {
  const substitutionsBySlot = new Map<string, ScheduleManualSubstitution>();
  for (const substitution of existing) {
    substitutionsBySlot.set(createSubstitutionKey(substitution), substitution);
  }
  for (const substitution of next) {
    substitutionsBySlot.set(createSubstitutionKey(substitution), substitution);
  }
  return Array.from(substitutionsBySlot.values());
}

function extractManualSubstitutions(
  roundNumber: number,
  previousMatches: GeneratedMatch[],
  updatedMatches: GeneratedMatch[],
  allPlayers: Player[],
): ScheduleManualSubstitution[] {
  const playerIdByName = new Map(
    allPlayers.map((player) => [player.name, player.id]),
  );
  const previousByCourt = new Map(
    previousMatches.map((match) => [String(match.number), match]),
  );
  const substitutions: ScheduleManualSubstitution[] = [];

  for (const updatedMatch of updatedMatches) {
    const previousMatch = previousByCourt.get(String(updatedMatch.number));
    if (!previousMatch) continue;

    for (let slot = 0; slot < 4; slot += 1) {
      const updatedPlayerName = updatedMatch.players[slot];
      if (
        updatedPlayerName === undefined ||
        updatedPlayerName === previousMatch.players[slot]
      ) {
        continue;
      }

      const playerId = playerIdByName.get(updatedPlayerName);
      if (!playerId) continue;

      substitutions.push({
        game: roundNumber,
        court: updatedMatch.number,
        slot: slot as SubstitutionSlot,
        playerId,
      });
    }
  }

  return substitutions;
}

function applyManualSubstitutions(
  matches: GeneratedMatch[],
  substitutions: ScheduleManualSubstitution[],
  allPlayers: Player[],
): GeneratedMatch[] {
  if (substitutions.length === 0) return matches;

  const playerById = new Map(allPlayers.map((player) => [player.id, player]));
  const playerByName = new Map(
    allPlayers.map((player) => [player.name, player]),
  );
  const substitutionsByMatch = new Map<string, ScheduleManualSubstitution[]>();
  for (const substitution of substitutions) {
    const matchKey = `${substitution.game}:${substitution.court}`;
    const matchSubstitutions = substitutionsByMatch.get(matchKey);
    if (matchSubstitutions) {
      matchSubstitutions.push(substitution);
    } else {
      substitutionsByMatch.set(matchKey, [substitution]);
    }
  }

  return matches.map((match) => {
    const matchSubstitutions = substitutionsByMatch.get(
      `${match.game}:${match.number}`,
    );
    if (!matchSubstitutions) return match;

    const playerNames = [...match.players];
    let changed = false;
    for (const substitution of matchSubstitutions) {
      const player = playerById.get(substitution.playerId);
      if (!player) continue;
      const displacedPlayerName = playerNames[substitution.slot];
      const existingSlot = playerNames.findIndex((name, slot) => {
        return slot !== substitution.slot && name === player.name;
      });
      if (existingSlot >= 0 && displacedPlayerName !== undefined) {
        playerNames[existingSlot] = displacedPlayerName;
      }
      playerNames[substitution.slot] = player.name;
      changed = true;
    }

    if (!changed) return match;

    const substitutedPlayers = playerNames
      .map((name) => playerByName.get(name))
      .filter((player): player is Player => !!player);

    return {
      ...match,
      players: playerNames,
      type:
        substitutedPlayers.length === 4
          ? getOptimalMatchType(substitutedPlayers)
          : match.type,
      skillRange:
        substitutedPlayers.length === 4
          ? calculateSkillRange(substitutedPlayers)
          : match.skillRange,
    };
  });
}

function toInitialGeneratedMatches(
  overrides: ScheduleRoundOverride[] | undefined,
  substitutions: ScheduleManualSubstitution[],
  allPlayers: Player[],
): GeneratedMatch[] | null {
  if (!overrides) return null;
  return applyManualSubstitutions(
    toGeneratedMatches(overrides, allPlayers),
    substitutions,
    allPlayers,
  );
}

export const MatchSchedule: React.FC<MatchScheduleProps> = ({
  scheduleId,
  players = [],
  numberOfCourts: propNumberOfCourts,
  courtNumbers = [],
  startTime = "20:00",
  durationHours = 2,
  matchmakingOptions: propMatchmakingOptions,
  initialNumberOfSessions,
  initialGeneratedMatches,
  initialManualSubstitutions = EMPTY_MANUAL_SUBSTITUTIONS,
}) => {
  // Use courtNumbers.length if available, otherwise fallback to propNumberOfCourts or 2
  const numberOfCourts =
    courtNumbers.length > 0 ? courtNumbers.length : (propNumberOfCourts ?? 2);

  const sessionDuration = 20; // 20 minutes per match (3 rounds per hour)

  // Track the number of sessions in local state, initialized based on durationHours
  const defaultSessions = Math.floor((durationHours * 60) / sessionDuration);
  const [numberOfSessions, setNumberOfSessions] = useState(
    initialNumberOfSessions ?? defaultSessions,
  );
  const [manualSubstitutions, setManualSubstitutions] = useState<
    ScheduleManualSubstitution[]
  >(initialManualSubstitutions);
  const [generatedMatches, setGeneratedMatches] = useState<
    GeneratedMatch[] | null
  >(
    toInitialGeneratedMatches(
      initialGeneratedMatches,
      initialManualSubstitutions,
      players,
    ),
  );
  const [adjustingRound, setAdjustingRound] = useState<number | null>(null);

  const round1PlayerIds = useMemo(() => {
    return new Set(players.map((player) => player.id));
  }, [players]);

  const defaultMatchmakingOptions = useMemo<MatchmakingOptions>(
    () => ({
      strategy: "balanced",
      avoidRepeatPartners: true,
      avoidRepeatOpponents: true,
      prioritizeFairPlay: true,
    }),
    [],
  );

  const matchmakingOptions =
    propMatchmakingOptions ?? defaultMatchmakingOptions;

  const initialPersistenceAttemptedRef = useRef(false);
  const optionsKey = JSON.stringify(matchmakingOptions);
  const previousOptionsKeyRef = useRef(optionsKey);

  const fetchPatch = useCallback(
    async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/schedules/${scheduleId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to persist schedule config");
    },
    [scheduleId],
  );

  const buildMatches = useCallback(
    (
      sessions: number,
      substitutions: ScheduleManualSubstitution[] = manualSubstitutions,
      options: MatchmakingOptions = matchmakingOptions,
      locked: GeneratedMatch[] = [],
    ) => {
      if (players.length < 4) {
        return [];
      }

      const matches = generateMatches(
        players,
        round1PlayerIds,
        numberOfCourts,
        courtNumbers,
        sessions,
        startTime,
        sessionDuration,
        locked,
        options,
      );

      return applyManualSubstitutions(matches, substitutions, players);
    },
    [
      courtNumbers,
      manualSubstitutions,
      matchmakingOptions,
      numberOfCourts,
      players,
      round1PlayerIds,
      startTime,
    ],
  );

  const persistGeneratedMatches = useCallback(
    async (
      matches: GeneratedMatch[],
      sessions: number,
      substitutions: ScheduleManualSubstitution[] = manualSubstitutions,
    ) => {
      await fetchPatch({
        numberOfSessions: sessions,
        generatedMatches: toScheduleRounds(matches, players),
        manualSubstitutions: substitutions,
      });
    },
    [fetchPatch, manualSubstitutions, players],
  );

  const computedCourts = useMemo(() => {
    return buildMatches(numberOfSessions);
  }, [buildMatches, numberOfSessions]);

  const courts = generatedMatches ?? computedCourts;

  const handleUpdateRoundMatches = useCallback(
    async (roundNumber: number, updatedMatches: GeneratedMatch[]) => {
      const currentRoundMatches = courts.filter(
        (match) => match.game === roundNumber,
      );
      const roundSubstitutions = extractManualSubstitutions(
        roundNumber,
        currentRoundMatches,
        updatedMatches,
        players,
      );
      const nextManualSubstitutions = mergeManualSubstitutions(
        manualSubstitutions,
        roundSubstitutions,
      );
      const updatedMatchesByCourt = new Map(
        updatedMatches.map((match) => [String(match.number), match]),
      );
      const lockedMatches = courts.map((match) =>
        match.game === roundNumber
          ? (updatedMatchesByCourt.get(String(match.number)) ?? match)
          : match,
      );
      const nextGeneratedMatches = buildMatches(
        numberOfSessions,
        [],
        matchmakingOptions,
        lockedMatches,
      );

      const previousManualSubstitutions = manualSubstitutions;
      const previousGeneratedMatches = generatedMatches;
      setManualSubstitutions(nextManualSubstitutions);
      setGeneratedMatches(nextGeneratedMatches);
      setAdjustingRound(null);

      try {
        await fetchPatch({
          manualSubstitutions: nextManualSubstitutions,
          generatedMatches: toScheduleRounds(nextGeneratedMatches, players),
        });
        toast.success(`Round ${roundNumber} roster and pairings updated`);
      } catch {
        setManualSubstitutions(previousManualSubstitutions);
        setGeneratedMatches(previousGeneratedMatches);
        toast.error("Failed to persist roster changes");
      }
    },
    [
      buildMatches,
      courts,
      fetchPatch,
      generatedMatches,
      matchmakingOptions,
      manualSubstitutions,
      numberOfSessions,
      players,
    ],
  );

  const handleGenerateMoreRound = useCallback(async () => {
    const previousSessions = numberOfSessions;
    const nextSessions = previousSessions + 1;
    const previousGeneratedMatches = generatedMatches;
    const nextGeneratedMatches = buildMatches(
      nextSessions,
      manualSubstitutions,
      matchmakingOptions,
      courts,
    );

    setNumberOfSessions(nextSessions);
    setGeneratedMatches(nextGeneratedMatches);

    try {
      await persistGeneratedMatches(nextGeneratedMatches, nextSessions);
      toast.success(`Round ${nextSessions} generated successfully!`);
    } catch {
      setNumberOfSessions(previousSessions);
      setGeneratedMatches(previousGeneratedMatches);
      toast.error("Failed to persist new round");
    }
  }, [
    buildMatches,
    courts,
    generatedMatches,
    manualSubstitutions,
    matchmakingOptions,
    numberOfSessions,
    persistGeneratedMatches,
  ]);

  useEffect(() => {
    setNumberOfSessions(initialNumberOfSessions ?? defaultSessions);
    setManualSubstitutions(initialManualSubstitutions);
    setGeneratedMatches(
      toInitialGeneratedMatches(
        initialGeneratedMatches,
        initialManualSubstitutions,
        players,
      ),
    );
    initialPersistenceAttemptedRef.current = false;
    previousOptionsKeyRef.current = optionsKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionsKey is intentionally excluded; it syncs the ref to prevent the options-change effect from firing on initial load. Adding it would reset state on every settings change.
  }, [
    defaultSessions,
    initialGeneratedMatches,
    initialManualSubstitutions,
    initialNumberOfSessions,
    players,
    scheduleId,
  ]);

  useEffect(() => {
    if (generatedMatches !== null) {
      return;
    }
    if (players.length < 4 || computedCourts.length === 0) {
      return;
    }
    if (initialPersistenceAttemptedRef.current) {
      return;
    }

    initialPersistenceAttemptedRef.current = true;
    void persistGeneratedMatches(computedCourts, numberOfSessions).then(
      () => {
        setGeneratedMatches(computedCourts);
      },
      () => {
        toast.error("Failed to persist generated schedule");
      },
    );
  }, [
    computedCourts,
    generatedMatches,
    numberOfSessions,
    persistGeneratedMatches,
    players.length,
  ]);

  useEffect(() => {
    if (previousOptionsKeyRef.current === optionsKey) {
      return;
    }

    previousOptionsKeyRef.current = optionsKey;
    const refreshedMatches = buildMatches(numberOfSessions, []);
    setManualSubstitutions([]);
    setGeneratedMatches(refreshedMatches);
    void persistGeneratedMatches(refreshedMatches, numberOfSessions, []).catch(
      () => {
        toast.error("Failed to persist regenerated schedule");
      },
    );
  }, [buildMatches, numberOfSessions, optionsKey, persistGeneratedMatches]);

  const playerGames = useMemo(() => {
    const counts: Record<string, number> = {};
    players.forEach((player) => {
      counts[player.name] = 0;
    });
    courts.forEach((match) => {
      match.players.forEach((playerName) => {
        if (playerName in counts) {
          counts[playerName] = (counts[playerName] || 0) + 1;
        }
      });
    });
    return counts;
  }, [players, courts]);

  const underplayedPlayers = useMemo(() => {
    if (players.length === 0) return [];
    const totalSlots = courts.length * 4;
    const avg = totalSlots / players.length;
    const threshold = Math.max(1, Math.floor(avg));
    return players.filter(
      (player) => (playerGames[player.name] ?? 0) < threshold,
    );
  }, [players, courts, playerGames]);

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

  if (players.length < 4) {
    return (
      <EmptyMatchState
        message={`Not enough players to generate matches. Current: ${players.length} players, Minimum required: 4 players`}
      />
    );
  }

  if (courts.length === 0) {
    return (
      <EmptyMatchState message="Unable to generate matches with current player distribution." />
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-7xl space-y-4 py-2 px-1 pb-24">
      {gameNumbers.map((gameNumber) => {
        const courtsForGame = courtsByGame[gameNumber] ?? [];

        const headerActions = (
          <div className="flex items-center gap-2">
            <RosterAdjustmentDialog
              isOpen={adjustingRound === gameNumber}
              onOpenChange={(open) =>
                setAdjustingRound(open ? gameNumber : null)
              }
              roundNumber={gameNumber}
              players={players}
              matches={courtsForGame}
              onUpdateRoundMatches={(updatedMatches) =>
                handleUpdateRoundMatches(gameNumber, updatedMatches)
              }
            />
          </div>
        );

        return (
          <MatchRound
            key={gameNumber}
            gameNumber={gameNumber}
            matches={courtsForGame}
            headerAction={headerActions}
            players={players}
          />
        );
      })}

      {underplayedPlayers.length > 0 ? (
        <div className="flex flex-col items-center gap-1.5 text-center max-w-md mx-auto px-4">
          <div className="flex items-center gap-1 text-gray-500 font-medium text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-info"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Priority Target for Next Round
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            These players have played fewer games than the average, and will be
            prioritized:
          </p>
          <div className="flex flex-wrap gap-1 justify-center mt-0.5">
            {underplayedPlayers.map((player) => {
              const isMale =
                player.gender?.toLowerCase() === "male" ||
                player.gender?.toLowerCase() === "men";
              const isFemale =
                player.gender?.toLowerCase() === "female" ||
                player.gender?.toLowerCase() === "women";

              const chipStyles = isMale
                ? "bg-blue-50 text-[#1E3A8A] border-blue-100"
                : isFemale
                  ? "bg-pink-50 text-[#9D174D] border-pink-100"
                  : "bg-gray-50 text-gray-600 border-gray-200";

              return (
                <span
                  key={player.id}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${chipStyles}`}
                >
                  {player.name}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium">
          All available players have even playing times!
        </div>
      )}

      <div className="flex flex-col items-center justify-center pt-8 px-4 mt-8">
        <AnimatedCtaButton onClick={handleGenerateMoreRound}>
          Generate More Round
        </AnimatedCtaButton>
      </div>
    </div>
  );
};

export default MatchSchedule;
