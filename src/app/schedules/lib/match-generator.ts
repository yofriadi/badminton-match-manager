// Skill level mapping (0-5 scale)
export const SKILL_LEVELS: Record<string, number> = {
  unrated: 0,
  beginner: 1,
  novice: 2,
  intermediate: 3,
  advanced: 4,
  pro: 5,
};

export type Player = {
  id: string;
  name: string;
  gender: string;
  skillLevel: string;
};

export type MatchType = "Mix Doubles" | "Men Doubles" | "Women Doubles";

export type GeneratedMatch = {
  game: number;
  type: MatchType;
  number: string | number;
  players: string[];
  isOccupied: boolean;
  time: string;
  skillRange: string;
};

/**
 * Calculate skill level range for a group of players
 */
export function calculateSkillRange(players: Player[]): string {
  if (players.length === 0) return "";

  const levels = players.map(
    (p) => SKILL_LEVELS[p.skillLevel.toLowerCase()] || 0,
  );
  const min = Math.min(...levels);
  const max = Math.max(...levels);

  const getName = (score: number) =>
    Object.entries(SKILL_LEVELS).find(([, value]) => value === score)?.[0] ||
    "";

  const minName = getName(min);
  const maxName = getName(max);

  if (min === max) return minName;
  return `${minName} - ${maxName}`;
}

/**
 * Get player by ID from array
 */
export function getPlayerById(
  players: Player[],
  playerId: string,
): Player | undefined {
  return players.find((p) => p.id === playerId);
}

/**
 * Check if match type is possible with given players
 */
export function canCreateMatchType(
  players: Player[],
  matchType: MatchType,
): boolean {
  const men = players.filter(
    (p) =>
      p.gender.toLowerCase() === "men" || p.gender.toLowerCase() === "male",
  );
  const women = players.filter(
    (p) =>
      p.gender.toLowerCase() === "women" || p.gender.toLowerCase() === "female",
  );

  switch (matchType) {
    case "Men Doubles":
      return men.length >= 4;
    case "Women Doubles":
      return women.length >= 4;
    case "Mix Doubles":
      return men.length >= 2 && women.length >= 2;
    default:
      return false;
  }
}

/**
 * Generate the optimal match type based on available players
 */
export function getOptimalMatchType(players: Player[]): MatchType {
  const men = players.filter(
    (p) =>
      p.gender.toLowerCase() === "men" || p.gender.toLowerCase() === "male",
  );
  const women = players.filter(
    (p) =>
      p.gender.toLowerCase() === "women" || p.gender.toLowerCase() === "female",
  );

  // Prefer Mix Doubles if we have balanced players
  if (men.length >= 2 && women.length >= 2) {
    return "Mix Doubles";
  }

  // Fall back to gender-specific
  if (men.length >= 4) {
    return "Men Doubles";
  }

  if (women.length >= 4) {
    return "Women Doubles";
  }

  // Default to Mix Doubles if possible
  return "Mix Doubles";
}

/**
 * Generate time string for a specific session
 */
export function generateSessionTime(
  sessionIndex: number,
  startTime: string,
): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startMinutes = (hours || 0) * 60 + (minutes || 0);
  const sessionMinutes = startMinutes + (sessionIndex - 1) * 24;

  const sessionHours = Math.floor(sessionMinutes / 60);
  const sessionMins = sessionMinutes % 60;

  return `${sessionHours.toString().padStart(2, "0")}:${sessionMins.toString().padStart(2, "0")}`;
}

/**
 * Extended player interface with skill score for algorithm
 */
export interface PlayerWithSkill extends Player {
  skillScore: number;
}

export type MatchmakingStrategy =
  | "balanced"
  | "variety"
  | "competitive"
  | "social";

export interface MatchmakingOptions {
  strategy?: MatchmakingStrategy;
  maxSkillGap?: number;
  avoidRepeatPartners?: boolean;
  avoidRepeatOpponents?: boolean;
  prioritizeFairPlay?: boolean;
}

export const DEFAULT_MATCHMAKING_OPTIONS: Required<MatchmakingOptions> = {
  strategy: "balanced",
  maxSkillGap: 1.5,
  avoidRepeatPartners: true,
  avoidRepeatOpponents: true,
  prioritizeFairPlay: true,
};

/**
 * Generate balanced matches across multiple sessions
 */
export function generateMatches(
  players: Player[],
  round1PlayerIds: Set<string>,
  numberOfCourts: number,
  courtNumbers: (string | number)[],
  numberOfSessions: number,
  startTime: string,
  sessionDuration: number,
  lockedMatches: GeneratedMatch[] = [],
  options: MatchmakingOptions = {},
): GeneratedMatch[] {
  const settings = { ...DEFAULT_MATCHMAKING_OPTIONS, ...options };
  const matches: GeneratedMatch[] = [];

  // Filter players for Round 1 (Session 0)
  const round1Players = players.filter((p) => round1PlayerIds.has(p.id));

  // Separate players by gender and assign skill scores (for Round 1)
  const malePlayersR1: PlayerWithSkill[] = round1Players
    .filter(
      (p) =>
        p.gender.toLowerCase() === "men" || p.gender.toLowerCase() === "male",
    )
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  const femalePlayersR1: PlayerWithSkill[] = round1Players
    .filter(
      (p) =>
        p.gender.toLowerCase() === "women" ||
        p.gender.toLowerCase() === "female",
    )
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  // Separate players by gender for subsequent rounds (ALL players)
  const malePlayersAll: PlayerWithSkill[] = players
    .filter(
      (p) =>
        p.gender.toLowerCase() === "men" || p.gender.toLowerCase() === "male",
    )
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  const femalePlayersAll: PlayerWithSkill[] = players
    .filter(
      (p) =>
        p.gender.toLowerCase() === "women" ||
        p.gender.toLowerCase() === "female",
    )
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  // Track player availability and game statistics
  const playerLastPlayed = new Map<string, number>();
  const gamesPlayed = new Map<string, number>();
  const partnerHistory = new Map<string, Set<string>>();
  const opponentHistory = new Map<string, Set<string>>();

  const seedPlayer = (p: Player) => {
    playerLastPlayed.set(p.name, -2); // Start at -2 so they can play in session 0
    gamesPlayed.set(p.name, 0);
    partnerHistory.set(p.name, new Set<string>());
    opponentHistory.set(p.name, new Set<string>());
  };
  players.forEach(seedPlayer);

  // Generate matches for each session
  for (let session = 0; session < numberOfSessions; session++) {
    const sessionTime = calculateSessionTime(
      startTime,
      session,
      sessionDuration,
    );

    // Apply locked matches for this specific session first
    const sessionLockedMatches = lockedMatches.filter(
      (m) => m.game === session + 1,
    );
    sessionLockedMatches.forEach((match) => {
      // Add if not already in matches
      if (
        !matches.some((m) => m.game === match.game && m.number === match.number)
      ) {
        matches.push(match);
      }
      match.players.forEach((playerName) => {
        playerLastPlayed.set(playerName, session);
        gamesPlayed.set(playerName, (gamesPlayed.get(playerName) ?? 0) + 1);

        if (match.players.length === 4) {
          const [p1, p2, p3, p4] = match.players;
          if (p1 && p2 && p3 && p4) {
            partnerHistory.get(p1)?.add(p2);
            partnerHistory.get(p2)?.add(p1);
            partnerHistory.get(p3)?.add(p4);
            partnerHistory.get(p4)?.add(p3);

            opponentHistory.get(p1)?.add(p3);
            opponentHistory.get(p1)?.add(p4);
            opponentHistory.get(p2)?.add(p3);
            opponentHistory.get(p2)?.add(p4);
            opponentHistory.get(p3)?.add(p1);
            opponentHistory.get(p3)?.add(p2);
            opponentHistory.get(p4)?.add(p1);
            opponentHistory.get(p4)?.add(p2);
          }
        }
      });
    });

    // Use Round 1 pool for Session 0, otherwise use full pool
    const currentMales = session === 0 ? malePlayersR1 : malePlayersAll;
    const currentFemales = session === 0 ? femalePlayersR1 : femalePlayersAll;

    for (let courtIndex = 0; courtIndex < numberOfCourts; courtIndex++) {
      const courtNumber = courtNumbers[courtIndex] ?? courtIndex + 1;

      // Skip if court is already occupied by a locked match
      const isCourtOccupied = matches.some(
        (m) => m.game === session + 1 && m.number === courtNumber,
      );
      if (isCourtOccupied) continue;

      // Dynamically filter available players in this session (excluding players already selected in this session)
      const availableMales = currentMales.filter(
        (p) => session - (playerLastPlayed.get(p.name) ?? -2) >= 1,
      );
      const availableFemales = currentFemales.filter(
        (p) => session - (playerLastPlayed.get(p.name) ?? -2) >= 1,
      );

      // Determine possible match types and their suitability scores based on sum of gamesPlayed
      const possibleTypes: { type: MatchType; sumGames: number }[] = [];

      // 1. Mix Doubles
      if (availableMales.length >= 2 && availableFemales.length >= 2) {
        const topMales = [...availableMales]
          .sort(
            (a, b) =>
              (gamesPlayed.get(a.name) ?? 0) - (gamesPlayed.get(b.name) ?? 0),
          )
          .slice(0, 2);
        const topFemales = [...availableFemales]
          .sort(
            (a, b) =>
              (gamesPlayed.get(a.name) ?? 0) - (gamesPlayed.get(b.name) ?? 0),
          )
          .slice(0, 2);
        const sumGames =
          topMales.reduce((sum, p) => sum + (gamesPlayed.get(p.name) ?? 0), 0) +
          topFemales.reduce(
            (sum, p) => sum + (gamesPlayed.get(p.name) ?? 0),
            0,
          );
        possibleTypes.push({ type: "Mix Doubles", sumGames });
      }

      // 2. Men Doubles
      if (availableMales.length >= 4) {
        const topMales = [...availableMales]
          .sort(
            (a, b) =>
              (gamesPlayed.get(a.name) ?? 0) - (gamesPlayed.get(b.name) ?? 0),
          )
          .slice(0, 4);
        const sumGames = topMales.reduce(
          (sum, p) => sum + (gamesPlayed.get(p.name) ?? 0),
          0,
        );
        possibleTypes.push({ type: "Men Doubles", sumGames });
      }

      // 3. Women Doubles
      if (availableFemales.length >= 4) {
        const topFemales = [...availableFemales]
          .sort(
            (a, b) =>
              (gamesPlayed.get(a.name) ?? 0) - (gamesPlayed.get(b.name) ?? 0),
          )
          .slice(0, 4);
        const sumGames = topFemales.reduce(
          (sum, p) => sum + (gamesPlayed.get(p.name) ?? 0),
          0,
        );
        possibleTypes.push({ type: "Women Doubles", sumGames });
      }

      if (possibleTypes.length === 0) {
        continue;
      }

      // Sort possible types by sumGames ascending (preferring fewer games played total)
      // Break ties: Mix Doubles first, then Men Doubles, then Women Doubles
      possibleTypes.sort((a, b) => {
        if (a.sumGames !== b.sumGames) return a.sumGames - b.sumGames;
        const preference = {
          "Mix Doubles": 0,
          "Men Doubles": 1,
          "Women Doubles": 2,
        };
        return preference[a.type] - preference[b.type];
      });

      const bestType = possibleTypes[0]!.type;

      const match = createBalancedMatch(
        session + 1,
        courtNumber,
        bestType,
        currentMales,
        currentFemales,
        playerLastPlayed,
        gamesPlayed,
        partnerHistory,
        opponentHistory,
        session,
        sessionTime,
        settings,
      );

      if (match) {
        matches.push(match);
      }
    }
  }

  return matches;
}

/**
 * Calculate session time based on start time and session index
 */
function calculateSessionTime(
  startTime: string,
  session: number,
  duration: number,
): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startMinutes = (hours || 0) * 60 + (minutes || 0);
  const sessionMinutes = startMinutes + session * duration;

  const sessionHours = Math.floor(sessionMinutes / 60);
  const sessionMins = sessionMinutes % 60;

  return `${sessionHours.toString().padStart(2, "0")}:${sessionMins.toString().padStart(2, "0")}`;
}

/**
 * Calculate team rating using weighted formula
 * Stronger player counts for 2/3, weaker for 1/3
 */
function calculateTeamRating(p1: PlayerWithSkill, p2: PlayerWithSkill): number {
  return (
    0.67 * Math.max(p1.skillScore, p2.skillScore) +
    0.33 * Math.min(p1.skillScore, p2.skillScore)
  );
}

function calculateMatchCost(
  teamA: [PlayerWithSkill, PlayerWithSkill],
  teamB: [PlayerWithSkill, PlayerWithSkill],
  partnerHistory: Map<string, Set<string>>,
  opponentHistory: Map<string, Set<string>>,
  settings: Required<MatchmakingOptions>,
): number {
  const p1 = teamA[0];
  const p2 = teamA[1];
  const p3 = teamB[0];
  const p4 = teamB[1];

  const allPlayers = [p1, p2, p3, p4];
  const skills = allPlayers.map((p) => p.skillScore);
  const skillGap = Math.max(...skills) - Math.min(...skills);

  const teamARating = calculateTeamRating(p1, p2);
  const teamBRating = calculateTeamRating(p3, p4);
  const teamBalance = Math.abs(teamARating - teamBRating);

  let partnerPenalty = 0;
  if (settings.avoidRepeatPartners) {
    if (partnerHistory.get(p1.name)?.has(p2.name)) partnerPenalty += 64;
    if (partnerHistory.get(p3.name)?.has(p4.name)) partnerPenalty += 64;
  }

  let opponentPenalty = 0;
  if (settings.avoidRepeatOpponents) {
    const p1Opponents = opponentHistory.get(p1.name);
    const p2Opponents = opponentHistory.get(p2.name);
    if (p1Opponents?.has(p3.name)) opponentPenalty += 16;
    if (p1Opponents?.has(p4.name)) opponentPenalty += 16;
    if (p2Opponents?.has(p3.name)) opponentPenalty += 16;
    if (p2Opponents?.has(p4.name)) opponentPenalty += 16;
  }

  let totalCost = 0;
  totalCost += skillGap * skillGap * 1.0;
  totalCost += teamBalance * teamBalance * 2.0;
  totalCost += partnerPenalty;
  totalCost += opponentPenalty;

  return totalCost;
}

function createBalancedMatch(
  session: number,
  courtNumber: string | number,
  matchType: MatchType,
  malePlayers: PlayerWithSkill[],
  femalePlayers: PlayerWithSkill[],
  playerLastPlayed: Map<string, number>,
  gamesPlayed: Map<string, number>,
  partnerHistory: Map<string, Set<string>>,
  opponentHistory: Map<string, Set<string>>,
  currentSession: number,
  time: string,
  settings: Required<MatchmakingOptions>,
): GeneratedMatch | null {
  const availableMales = malePlayers.filter(
    (p) => currentSession - (playerLastPlayed.get(p.name) ?? -2) >= 1,
  );
  const availableFemales = femalePlayers.filter(
    (p) => currentSession - (playerLastPlayed.get(p.name) ?? -2) >= 1,
  );

  const getEligible = (list: PlayerWithSkill[], count: number) => {
    return [...list]
      .sort((a, b) => {
        const aGames = gamesPlayed.get(a.name) ?? 0;
        const bGames = gamesPlayed.get(b.name) ?? 0;
        if (aGames !== bGames) return aGames - bGames;

        const aLast = playerLastPlayed.get(a.name) ?? -2;
        const bLast = playerLastPlayed.get(b.name) ?? -2;
        if (aLast !== bLast) return aLast - bLast;

        return a.id.localeCompare(b.id);
      })
      .slice(0, count * 2);
  };

  interface BestMatch {
    players: PlayerWithSkill[];
    teamA: [PlayerWithSkill, PlayerWithSkill];
    teamB: [PlayerWithSkill, PlayerWithSkill];
    cost: number;
  }

  let bestMatch: BestMatch | null = null;

  const evaluate = (
    p1: PlayerWithSkill,
    p2: PlayerWithSkill,
    p3: PlayerWithSkill,
    p4: PlayerWithSkill,
    isMixed?: boolean,
  ) => {
    let pairings: [
      [PlayerWithSkill, PlayerWithSkill],
      [PlayerWithSkill, PlayerWithSkill],
    ][] = [];

    if (isMixed) {
      // In Mix Doubles, we are passing:
      // p1 = m1, p2 = m2 (males)
      // p3 = f1, p4 = f2 (females)
      // To ensure each team has one male and one female, the only valid pairings are:
      // 1. [m1, f1] vs [m2, f2] -> [[p1, p3], [p2, p4]]
      // 2. [m1, f2] vs [m2, f1] -> [[p1, p4], [p2, p3]]
      pairings = [
        [
          [p1, p3],
          [p2, p4],
        ],
        [
          [p1, p4],
          [p2, p3],
        ],
      ];
    } else {
      pairings = [
        [
          [p1, p2],
          [p3, p4],
        ],
        [
          [p1, p3],
          [p2, p4],
        ],
        [
          [p1, p4],
          [p2, p3],
        ],
      ];
    }

    const gamesSum = [p1, p2, p3, p4].reduce(
      (sum, p) => sum + (gamesPlayed.get(p.name) ?? 0),
      0,
    );
    for (const [teamA, teamB] of pairings) {
      const baseCost = calculateMatchCost(
        teamA,
        teamB,
        partnerHistory,
        opponentHistory,
        settings,
      );
      // Large penalty for each game played by players to guarantee playing time fairness is prioritized above all else
      const cost = baseCost + gamesSum * 10000;
      if (!bestMatch || cost < bestMatch.cost) {
        bestMatch = { players: [p1, p2, p3, p4], teamA, teamB, cost };
      }
    }
  };

  if (matchType === "Mix Doubles") {
    const eligibleMales = getEligible(availableMales, 2);
    const eligibleFemales = getEligible(availableFemales, 2);

    if (eligibleMales.length >= 2 && eligibleFemales.length >= 2) {
      // Evaluate all combinations of eligible males and females
      for (let i = 0; i < eligibleMales.length; i++) {
        for (let j = i + 1; j < eligibleMales.length; j++) {
          for (let x = 0; x < eligibleFemales.length; x++) {
            for (let y = x + 1; y < eligibleFemales.length; y++) {
              const m1 = eligibleMales[i];
              const m2 = eligibleMales[j];
              const f1 = eligibleFemales[x];
              const f2 = eligibleFemales[y];
              if (m1 && m2 && f1 && f2) {
                evaluate(m1, m2, f1, f2, true);
              }
            }
          }
        }
      }
    }
  } else if (matchType === "Men Doubles") {
    const eligible = getEligible(availableMales, 4);
    if (eligible.length >= 4) {
      // Evaluate all combinations of 4 players out of eligible list
      for (let i = 0; i < eligible.length; i++) {
        for (let j = i + 1; j < eligible.length; j++) {
          for (let x = j + 1; x < eligible.length; x++) {
            for (let y = x + 1; y < eligible.length; y++) {
              const p1 = eligible[i];
              const p2 = eligible[j];
              const p3 = eligible[x];
              const p4 = eligible[y];
              if (p1 && p2 && p3 && p4) {
                evaluate(p1, p2, p3, p4);
              }
            }
          }
        }
      }
    }
  } else if (matchType === "Women Doubles") {
    const eligible = getEligible(availableFemales, 4);
    if (eligible.length >= 4) {
      // Evaluate all combinations of 4 players out of eligible list
      for (let i = 0; i < eligible.length; i++) {
        for (let j = i + 1; j < eligible.length; j++) {
          for (let x = j + 1; x < eligible.length; x++) {
            for (let y = x + 1; y < eligible.length; y++) {
              const p1 = eligible[i];
              const p2 = eligible[j];
              const p3 = eligible[x];
              const p4 = eligible[y];
              if (p1 && p2 && p3 && p4) {
                evaluate(p1, p2, p3, p4);
              }
            }
          }
        }
      }
    }
  }

  if (!bestMatch) {
    return null;
  }

  const selectedPlayers = [
    (bestMatch as BestMatch).teamA[0].name,
    (bestMatch as BestMatch).teamA[1].name,
    (bestMatch as BestMatch).teamB[0].name,
    (bestMatch as BestMatch).teamB[1].name,
  ];

  selectedPlayers.forEach((playerName) => {
    playerLastPlayed.set(playerName, currentSession);
    gamesPlayed.set(playerName, (gamesPlayed.get(playerName) ?? 0) + 1);
  });

  const [pa1, pa2, pb1, pb2] = selectedPlayers;
  if (pa1 && pa2 && pb1 && pb2) {
    partnerHistory.get(pa1)?.add(pa2);
    partnerHistory.get(pa2)?.add(pa1);
    partnerHistory.get(pb1)?.add(pb2);
    partnerHistory.get(pb2)?.add(pb1);
    opponentHistory.get(pa1)?.add(pb1);
    opponentHistory.get(pa1)?.add(pb2);
    opponentHistory.get(pa2)?.add(pb1);
    opponentHistory.get(pa2)?.add(pb2);
    opponentHistory.get(pb1)?.add(pa1);
    opponentHistory.get(pb1)?.add(pa2);
    opponentHistory.get(pb2)?.add(pa1);
    opponentHistory.get(pb2)?.add(pa2);
  }

  const skillRange = calculateSkillRange(
    selectedPlayers
      .map((name) =>
        [...malePlayers, ...femalePlayers].find((p) => p.name === name),
      )
      .filter(Boolean) as Player[],
  );

  return {
    game: session,
    number: courtNumber,
    type: matchType,
    players: selectedPlayers,
    isOccupied: true,
    time,
    skillRange,
  };
}
