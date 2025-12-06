"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";
import { CourtBlueprint, type Court } from "@/components/ui/court-blueprint";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { toast } from "sonner";
import { Plus, Check } from "lucide-react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Badge } from "@workspace/ui/components/badge";

// Skill level mapping (0-5 scale)
const SKILL_LEVELS: Record<string, number> = {
  unrated: 0,
  beginner: 1,
  novice: 2,
  intermediate: 3,
  advanced: 4,
  pro: 5,
};

type Player = {
  id: string;
  name: string;
  gender: string;
  skillLevel: string;
};

type MatchType = "Mix Doubles" | "Men Doubles" | "Women Doubles";

type GeneratedMatch = {
  game: number;
  type: MatchType;
  number: number;
  players: string[];
  isOccupied: boolean;
  time: string;
  skillRange: string;
};

type MatchScheduleProps = {
  scheduleId?: string;
  players?: Player[];
  numberOfCourts?: number;
  startTime?: string;
  durationHours?: number;
};

export const MatchSchedule: React.FC<MatchScheduleProps> = ({
  scheduleId,
  players = [],
  numberOfCourts = 2,
  startTime = "20:00",
  durationHours = 2,
}) => {
  // Calculate number of sessions (5 for 2-hour schedule)
  const numberOfSessions = Math.floor((durationHours * 60) / 24);
  const sessionDuration = 24; // minutes

  const [round1PlayerIds, setRound1PlayerIds] = useState<Set<string>>(
    new Set(players.map((p) => p.id))
  );
  const [frozenMatches, setFrozenMatches] = useState<GeneratedMatch[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());

  // Calculate how many players needed to fill next multiple of 4 for Round 1
  const currentCount = round1PlayerIds.size;
  const nextMultipleOf4 = Math.ceil((currentCount + 1) / 4) * 4;
  const neededPlayers = nextMultipleOf4 - currentCount;
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
        toast.error(`Maximum ${maxPlayers} players allowed for Round 1 (${numberOfCourts} courts)`);
        return;
      }
      newSelected.add(playerId);
    }
    setSelectedPlayerIds(newSelected);
  };

  const handleUpdateRound1 = () => {
    // 1. Update frozen matches: remove matches if any participant is no longer selected
    const newFrozenMatches = frozenMatches.filter(match => 
      match.players.every(playerName => {
        const player = players.find(p => p.name === playerName);
        return player && selectedPlayerIds.has(player.id);
      })
    );
    
    // 2. If we are adding players to a session that already has frozen matches, 
    // we should freeze the CURRENT Round 1 matches (that are valid) to preserve them.
    // But if we are removing players, we might have broken some matches (handled above).
    // The requirement is: "keep the previously matched players".
    // So we take the current courts (Round 1), filter for validity, and use THAT as frozen.
    
    const currentRound1Matches = courts.filter(m => m.game === 1);
    const validCurrentMatches = currentRound1Matches.filter(match => 
      match.players.every(playerName => {
        const player = players.find(p => p.name === playerName);
        return player && selectedPlayerIds.has(player.id);
      })
    );

    // Merge valid current matches with existing frozen matches (deduplicating by court/game)
    // Actually, currentRound1Matches INCLUDES frozenMatches that were used.
    // So validCurrentMatches is the new state of frozen matches.
    setFrozenMatches(validCurrentMatches);

    // 3. Update Round 1 roster
    setRound1PlayerIds(selectedPlayerIds);
    setIsAddPlayerOpen(false);
    toast.success(`Round 1 roster updated: ${selectedPlayerIds.size} players`);
  };

  const courts = useMemo(() => {
    if (!players || players.length < 4) {
      return [];
    }

    return generateMatches(
      players,
      round1PlayerIds,
      numberOfCourts,
      numberOfSessions,
      startTime,
      sessionDuration,
      frozenMatches
    );
  }, [players, round1PlayerIds, numberOfCourts, numberOfSessions, startTime, sessionDuration, frozenMatches]);

  const courtsByGame = useMemo(() => {
    return courts.reduce<Record<number, Court[]>>((grouped, court) => {
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
    [courtsByGame]
  );

  if (!players || players.length < 4) {
    return (
      <div className="min-h-screen bg-white max-w-7xl space-y-4 py-2 px-1">
        <p className="text-center text-gray-500 py-8">
          Not enough players to generate matches. 
          <br />
          Current: {players?.length || 0} players, Minimum required: 4 players
        </p>
        <div className="flex justify-center">
          <Dialog open={isAddPlayerOpen} onOpenChange={handleOpenAddPlayer}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Manage Round 1 Players
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Manage Round 1 Players</DialogTitle>
                <DialogDescription>
                  Select players for the first round. Selected {selectedPlayerIds.size} / {maxPlayers} players.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[300px] pr-4">
                {players.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No players found.</p>
                ) : (
                  <div className="space-y-2">
                    {players.map((player) => {
                      const isSelected = selectedPlayerIds.has(player.id);
                      const isDisabled = !isSelected && selectedPlayerIds.size >= maxPlayers;
                      return (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? "border-black bg-gray-50" : 
                              isDisabled ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed" : "border-gray-200 hover:border-gray-300"
                            }`}
                          onClick={() => !isDisabled && togglePlayerSelection(player.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{player.name}</span>
                            <div className="flex gap-2 text-xs text-gray-500">
                              <span className="capitalize">{player.gender}</span>
                              <span>•</span>
                              <span className="capitalize">{player.skillLevel}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              <DialogFooter>
                <Button onClick={handleUpdateRound1} disabled={selectedPlayerIds.size === 0}>
                  Update Roster ({selectedPlayerIds.size})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="min-h-screen bg-white max-w-7xl space-y-4 py-2 px-1">
        <p className="text-center text-gray-500 py-8">
          Unable to generate matches with current player distribution.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* TODO: fix padding x cut the width of the carousel */}
      <div className="min-h-screen bg-white max-w-7xl space-y-4 py-2 px-1">

        {gameNumbers.map((gameNumber) => {
          const courtsForGame = courtsByGame[gameNumber] ?? [];
          const sessionTime = courtsForGame[0]?.time;

          return (
            <div key={gameNumber} className="space-y-4 mt-8 first:mt-0">
              <div className="flex items-center gap-4 px-1">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-md font-medium text-gray-600 uppercase tracking-widest">
                    Round {gameNumber}
                  </span>
                  <span className="text-xl font-black text-gray-900 tracking-tight">
                    {sessionTime}
                  </span>
                </div>
                <div className="h-px flex-1 bg-gray-100" />
                {gameNumber === 1 && (
                  <Dialog open={isAddPlayerOpen} onOpenChange={handleOpenAddPlayer}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Manage Players</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Manage Round 1 Players</DialogTitle>
                        <DialogDescription>
                          Select players for the first round. Selected {selectedPlayerIds.size} / {maxPlayers} players.
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[300px] pr-4">
                        {players.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No players found.</p>
                        ) : (
                          <div className="space-y-2">
                            {players.map((player) => {
                              const isSelected = selectedPlayerIds.has(player.id);
                              const isDisabled = !isSelected && selectedPlayerIds.size >= maxPlayers;
                              return (
                                <div
                                  key={player.id}
                                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? "border-black bg-gray-50" : 
                                      isDisabled ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed" : "border-gray-200 hover:border-gray-300"
                                    }`}
                                  onClick={() => !isDisabled && togglePlayerSelection(player.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{player.name}</span>
                                    <div className="flex gap-2 text-xs text-gray-500">
                                      <span className="capitalize">{player.gender}</span>
                                      <span>•</span>
                                      <span className="capitalize">{player.skillLevel}</span>
                                    </div>
                                  </div>
                                  {isSelected && <Check className="h-4 w-4" />}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                      <DialogFooter>
                        <Button onClick={handleUpdateRound1} disabled={selectedPlayerIds.size === 0}>
                          Update Roster ({selectedPlayerIds.size})
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <Carousel
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
                          className={`w-full overflow-hidden border-1 transition-all cursor-pointer pb-4 ${isSelected
                            ? "border-black"
                            : "border-gray-300 hover:border-gray-500"
                            }`}
                          onClick={() => setSelectedCourt(courtKey)}
                        >
                          <CardHeader className="p-4">
                            <div className="flex flex-row items-center justify-between w-full">
                              <span className="text-sm font-semibold uppercase text-gray-601">
                                {court.type}
                              </span>
                              <span className="text-sm">
                                {(court as GeneratedMatch).skillRange}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4">
                            <CourtBlueprint court={court} />
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
              </Carousel>
            </div>
          );
        })}
      </div>
    </>
  );
};

/**
 * Generate balanced matches based on player skills
 */
function generateMatches(
  players: Player[],
  round1PlayerIds: Set<string>,
  numberOfCourts: number,
  numberOfSessions: number,
  startTime: string,
  sessionDuration: number,
  frozenMatches: GeneratedMatch[] = []
): GeneratedMatch[] {
  const matches: GeneratedMatch[] = [];

  // Filter players for Round 1 (Session 0)
  const round1Players = players.filter(p => round1PlayerIds.has(p.id));

  // Separate players by gender and assign skill scores (for Round 1)
  const malePlayersR1 = round1Players
    .filter((p) => p.gender.toLowerCase() === "male")
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  const femalePlayersR1 = round1Players
    .filter((p) => p.gender.toLowerCase() === "female")
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  // Separate players by gender for subsequent rounds (ALL players)
  const malePlayersAll = players
    .filter((p) => p.gender.toLowerCase() === "male")
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  const femalePlayersAll = players
    .filter((p) => p.gender.toLowerCase() === "female")
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  // Track player availability (session number when they last played) and total games played
  const playerLastPlayed = new Map<string, number>();
  const gamesPlayed = new Map<string, number>();
  const partnerHistory = new Map<string, Set<string>>();

  const seedPlayer = (p: Player) => {
    playerLastPlayed.set(p.name, -2); // Start at -2 so they can play in session 0
    gamesPlayed.set(p.name, 0);
    partnerHistory.set(p.name, new Set<string>());
  };
  players.forEach(seedPlayer);

  // Apply frozen matches (pre-existing matches for Session 0)
  frozenMatches.forEach(match => {
    if (match.game === 1) {
      matches.push(match);
      match.players.forEach(playerName => {
        playerLastPlayed.set(playerName, 0);
        gamesPlayed.set(playerName, (gamesPlayed.get(playerName) ?? 0) + 1);
        
        // Update partner history
        // Assuming players array is [p1, p2, p3, p4] where (p1,p2) and (p3,p4) are teams
        if (match.players.length === 4) {
          const [p1, p2, p3, p4] = match.players;
          if (p1 && p2) {
            partnerHistory.get(p1)?.add(p2);
            partnerHistory.get(p2)?.add(p1);
          }
          if (p3 && p4) {
            partnerHistory.get(p3)?.add(p4);
            partnerHistory.get(p4)?.add(p3);
          }
        }
      });
    }
  });

  const allPlayersByName = new Map<string, any>();
  [...malePlayersAll, ...femalePlayersAll].forEach((p) => allPlayersByName.set(p.name, p));

  // Generate matches for each session
  for (let session = 0; session < numberOfSessions; session++) {
    const sessionTime = calculateSessionTime(startTime, session, sessionDuration);

    // Use Round 1 pool for Session 0, otherwise use full pool
    const currentMales = session === 0 ? malePlayersR1 : malePlayersAll;
    const currentFemales = session === 0 ? femalePlayersR1 : femalePlayersAll;

    const matchTypes = determineMatchTypes(
      currentMales,
      currentFemales,
      numberOfCourts,
      playerLastPlayed,
      session
    );

    for (let court = 0; court < numberOfCourts && court < matchTypes.length; court++) {
      // Skip if court is already occupied by a frozen match
      // Note: match.game is 1-based, session is 0-based
      const isCourtOccupied = matches.some(m => m.game === session + 1 && m.number === (court + 1));
      if (isCourtOccupied) continue;

      const matchType = matchTypes[court]!;
      const match = createBalancedMatch(
        session + 1,
        court + 1,
        matchType,
        currentMales,
        currentFemales,
        playerLastPlayed,
        gamesPlayed,
        partnerHistory,
        session,
        sessionTime
      );

      if (match) {
        matches.push(match);
      }
    }
  }

  return matches;
}

/**
 * Determine match types for a session based on player availability
 */
function determineMatchTypes(
  malePlayers: any[],
  femalePlayers: any[],
  numberOfCourts: number,
  playerLastPlayed: Map<string, number>,
  currentSession: number
): MatchType[] {
  const types: MatchType[] = [];

  const availableMales = malePlayers.filter(
    (p) => currentSession - playerLastPlayed.get(p.name)! >= 1
  ).length;
  const availableFemales = femalePlayers.filter(
    (p) => currentSession - playerLastPlayed.get(p.name)! >= 1
  ).length;

  for (let i = 0; i < numberOfCourts; i++) {
    // Fill courts if possible; prefer mix, then heavier gender pools.
    if (availableMales >= 2 && availableFemales >= 2) {
      types.push("Mix Doubles");
    } else if (availableMales >= 4) {
      types.push("Men Doubles");
    } else if (availableFemales >= 4) {
      types.push("Women Doubles");
    } else if (availableMales >= 2 && availableFemales >= 2) {
      types.push("Mix Doubles");
    }
  }

  return types;
}

/**
 * Create a single match with skill-balanced teams
 */
function createBalancedMatch(
  session: number,
  courtNumber: number,
  matchType: MatchType,
  malePlayers: any[],
  femalePlayers: any[],
  playerLastPlayed: Map<string, number>,
  gamesPlayed: Map<string, number>,
  partnerHistory: Map<string, Set<string>>,
  currentSession: number,
  time: string
): GeneratedMatch | null {
  const availableMales = malePlayers.filter(
    (p) => currentSession - playerLastPlayed.get(p.name)! >= 1
  );
  const availableFemales = femalePlayers.filter(
    (p) => currentSession - playerLastPlayed.get(p.name)! >= 1
  );

  const getSorted = (list: any[]) =>
    [...list].sort((a, b) => {
      const playedDiff = (gamesPlayed.get(a.name) ?? 0) - (gamesPlayed.get(b.name) ?? 0);
      if (playedDiff !== 0) return playedDiff;
      return (b.skillScore ?? 0) - (a.skillScore ?? 0);
    });

  let candidateQuartets: any[][] = [];

  if (matchType === "Mix Doubles") {
    if (availableMales.length < 2 || availableFemales.length < 2) return null;
    const males = getSorted(availableMales).slice(0, 6);
    const females = getSorted(availableFemales).slice(0, 6);

    for (let i = 0; i < males.length; i++) {
      for (let j = i + 1; j < males.length; j++) {
        for (let f1 = 0; f1 < females.length; f1++) {
          for (let f2 = f1 + 1; f2 < females.length; f2++) {
            candidateQuartets.push([males[i], females[f1], males[j], females[f2]]);
          }
        }
      }
    }
  } else if (matchType === "Men Doubles") {
    if (availableMales.length < 4) return null;
    const males = getSorted(availableMales).slice(0, 8);
    candidateQuartets = combinationsOfFour(males);
  } else if (matchType === "Women Doubles") {
    if (availableFemales.length < 4) return null;
    const females = getSorted(availableFemales).slice(0, 8);
    candidateQuartets = combinationsOfFour(females);
  }

  if (candidateQuartets.length === 0) return null;

  let best: {
    quartet: any[];
    teamA: any[];
    teamB: any[];
    score: number;
    skillRange: string;
  } | null = null;

  for (const quartet of candidateQuartets) {
    const teamSplit = findBalancedTeams(quartet, partnerHistory);
    if (!teamSplit) continue;
    const { teamA, teamB, partnerPenalty, repeatPenalty } = teamSplit;

    const skills = quartet.map((p) => p.skillScore ?? 0);
    const minSkill = Math.min(...skills);
    const maxSkill = Math.max(...skills);
    const skillRange = `${getSkillLevelName(minSkill)} - ${getSkillLevelName(maxSkill)}`;

    const gp = quartet.map((p) => gamesPlayed.get(p.name) ?? 0);
    const gpSpread = Math.max(...gp) - Math.min(...gp);
    const teamSkillDiff = Math.abs(
      teamA.reduce((s, p) => s + (p.skillScore ?? 0), 0) -
      teamB.reduce((s, p) => s + (p.skillScore ?? 0), 0)
    );

    // Lower score is better. Weighted to favor fairness, then balance, then novelty.
    const score = gpSpread * 4 + teamSkillDiff * 2 + partnerPenalty * 3 + repeatPenalty;

    if (!best || score < best.score) {
      best = { quartet, teamA, teamB, score, skillRange };
    }
  }

  if (!best) return null;

  best.quartet.forEach((p) => {
    playerLastPlayed.set(p.name, currentSession);
    gamesPlayed.set(p.name, (gamesPlayed.get(p.name) ?? 0) + 1);
  });

  // Record partnerships for rotation tracking
  addPartnerships(best.teamA, partnerHistory);
  addPartnerships(best.teamB, partnerHistory);

  return {
    game: session,
    type: matchType,
    number: courtNumber,
    players: best.quartet.map((p) => p.name),
    isOccupied: true,
    time,
    skillRange: best.skillRange,
  };
}

/**
 * Calculate the time for a session
 */
function calculateSessionTime(
  startTime: string,
  sessionIndex: number,
  sessionDuration: number
): string {
  const [hours = 0, minutes = 0] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + sessionIndex * sessionDuration;
  const sessionHours = Math.floor(totalMinutes / 60) % 24;
  const sessionMinutes = totalMinutes % 60;

  return `${String(sessionHours).padStart(2, "0")}:${String(sessionMinutes).padStart(2, "0")}`;
}

/**
 * Get skill level name from numeric score
 */
function getSkillLevelName(score: number): string {
  if (score >= 5) return "Pro";
  if (score >= 4) return "Advanced";
  if (score >= 3) return "Intermediate";
  if (score >= 2) return "Novice";
  if (score >= 1) return "Beginner";
  return "Unrated";
}

/**
 * Helpers for balanced teams and rotation
 */
function combinationsOfFour(list: any[]): any[][] {
  const result: any[][] = [];
  for (let a = 0; a < list.length; a++) {
    for (let b = a + 1; b < list.length; b++) {
      for (let c = b + 1; c < list.length; c++) {
        for (let d = c + 1; d < list.length; d++) {
          result.push([list[a], list[b], list[c], list[d]]);
        }
      }
    }
  }
  return result;
}

function findBalancedTeams(
  quartet: any[],
  partnerHistory: Map<string, Set<string>>
): {
  teamA: any[];
  teamB: any[];
  partnerPenalty: number;
  repeatPenalty: number;
} | null {
  const indices: [number, number, number, number][] = [
    [0, 1, 2, 3],
    [0, 2, 1, 3],
    [0, 3, 1, 2],
  ];

  let best: {
    teamA: any[];
    teamB: any[];
    partnerPenalty: number;
    repeatPenalty: number;
    diff: number;
  } | null = null;

  for (const [a1, a2, b1, b2] of indices) {
    const p1 = quartet[a1];
    const p2 = quartet[a2];
    const p3 = quartet[b1];
    const p4 = quartet[b2];

    if (!p1 || !p2 || !p3 || !p4) continue;

    const teamA = [p1, p2];
    const teamB = [p3, p4];
    const teamASkill = teamA.reduce((s, p) => s + (p.skillScore ?? 0), 0);
    const teamBSkill = teamB.reduce((s, p) => s + (p.skillScore ?? 0), 0);
    const diff = Math.abs(teamASkill - teamBSkill);

    const partnerPenalty =
      (hasPartnered(teamA[0], teamA[1], partnerHistory) ? 1 : 0) +
      (hasPartnered(teamB[0], teamB[1], partnerHistory) ? 1 : 0);

    const repeatPenalty =
      (hasPartnered(teamA[0], teamB[0], partnerHistory) ? 0.5 : 0) +
      (hasPartnered(teamA[1], teamB[1], partnerHistory) ? 0.5 : 0);

    if (!best || diff + partnerPenalty + repeatPenalty < best.diff + best.partnerPenalty + best.repeatPenalty) {
      best = { teamA, teamB, partnerPenalty, repeatPenalty, diff };
    }
  }

  return best
    ? {
      teamA: best.teamA,
      teamB: best.teamB,
      partnerPenalty: best.partnerPenalty,
      repeatPenalty: best.repeatPenalty,
    }
    : null;
}

function hasPartnered(a: any, b: any, partnerHistory: Map<string, Set<string>>): boolean {
  return partnerHistory.get(a.name)?.has(b.name) ?? false;
}

function addPartnerships(team: any[], partnerHistory: Map<string, Set<string>>) {
  if (team.length !== 2) return;
  const [a, b] = team;
  partnerHistory.get(a.name)?.add(b.name);
  partnerHistory.get(b.name)?.add(a.name);
}
