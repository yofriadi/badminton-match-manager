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

  const levels = players.map(p => SKILL_LEVELS[p.skillLevel.toLowerCase()] || 0);
  const min = Math.min(...levels);
  const max = Math.max(...levels);

  const getName = (score: number) => 
    Object.entries(SKILL_LEVELS).find(([, value]) => value === score)?.[0] || "";

  const minName = getName(min);
  const maxName = getName(max);

  if (min === max) return minName;
  return `${minName} - ${maxName}`;
}

/**
 * Get player by ID from array
 */
export function getPlayerById(players: Player[], playerId: string): Player | undefined {
  return players.find(p => p.id === playerId);
}

/**
 * Check if match type is possible with given players
 */
export function canCreateMatchType(
  players: Player[],
  matchType: MatchType
): boolean {
  const men = players.filter(p => p.gender.toLowerCase() === "men" || p.gender.toLowerCase() === "male");
  const women = players.filter(p => p.gender.toLowerCase() === "women" || p.gender.toLowerCase() === "female");

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
  const men = players.filter(p => p.gender.toLowerCase() === "men" || p.gender.toLowerCase() === "male");
  const women = players.filter(p => p.gender.toLowerCase() === "women" || p.gender.toLowerCase() === "female");

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
export function generateSessionTime(sessionIndex: number, startTime: string): string {
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
  frozenMatches: GeneratedMatch[] = [],
): GeneratedMatch[] {
  const matches: GeneratedMatch[] = [];

  // Filter players for Round 1 (Session 0)
  const round1Players = players.filter((p) => round1PlayerIds.has(p.id));

  // Separate players by gender and assign skill scores (for Round 1)
  const malePlayersR1: PlayerWithSkill[] = round1Players
    .filter((p) => p.gender.toLowerCase() === "men" || p.gender.toLowerCase() === "male")
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  const femalePlayersR1: PlayerWithSkill[] = round1Players
    .filter((p) => p.gender.toLowerCase() === "women" || p.gender.toLowerCase() === "female")
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  // Separate players by gender for subsequent rounds (ALL players)
  const malePlayersAll: PlayerWithSkill[] = players
    .filter((p) => p.gender.toLowerCase() === "men" || p.gender.toLowerCase() === "male")
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  const femalePlayersAll: PlayerWithSkill[] = players
    .filter((p) => p.gender.toLowerCase() === "women" || p.gender.toLowerCase() === "female")
    .map((p) => ({
      ...p,
      skillScore: SKILL_LEVELS[p.skillLevel.toLowerCase()] ?? 0,
    }));

  // Track player availability and game statistics
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
  frozenMatches.forEach((match) => {
    if (match.game === 1) {
      matches.push(match);
      match.players.forEach((playerName) => {
        playerLastPlayed.set(playerName, 0);
        gamesPlayed.set(playerName, (gamesPlayed.get(playerName) ?? 0) + 1);

        // Update partner history
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

  // Generate matches for each session
  for (let session = 0; session < numberOfSessions; session++) {
    const sessionTime = calculateSessionTime(
      startTime,
      session,
      sessionDuration,
    );

    // Use Round 1 pool for Session 0, otherwise use full pool
    const currentMales = session === 0 ? malePlayersR1 : malePlayersAll;
    const currentFemales = session === 0 ? femalePlayersR1 : femalePlayersAll;

    const matchTypes = determineMatchTypes(
      currentMales,
      currentFemales,
      numberOfCourts,
      playerLastPlayed,
      session,
    );

    for (
      let courtIndex = 0;
      courtIndex < numberOfCourts && courtIndex < matchTypes.length;
      courtIndex++
    ) {
      const courtNumber = courtNumbers[courtIndex] ?? courtIndex + 1;

      // Skip if court is already occupied by a frozen match
      const isCourtOccupied = matches.some(
        (m) => m.game === session + 1 && m.number === courtNumber,
      );
      if (isCourtOccupied) continue;

      const matchType = matchTypes[courtIndex]!;
      const match = createBalancedMatch(
        session + 1,
        courtNumber,
        matchType,
        currentMales,
        currentFemales,
        playerLastPlayed,
        gamesPlayed,
        partnerHistory,
        session,
        sessionTime,
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
 * Determine optimal match types based on available players
 */
function determineMatchTypes(
  malePlayers: PlayerWithSkill[],
  femalePlayers: PlayerWithSkill[],
  numberOfCourts: number,
  playerLastPlayed: Map<string, number>,
  currentSession: number,
): MatchType[] {
  const types: MatchType[] = [];

  const availableMales = malePlayers.filter(
    (p) => currentSession - playerLastPlayed.get(p.name)! >= 1,
  ).length;
  const availableFemales = femalePlayers.filter(
    (p) => currentSession - playerLastPlayed.get(p.name)! >= 1,
  ).length;

  for (let i = 0; i < numberOfCourts; i++) {
    // Prefer mix doubles if balanced, then gender-specific
    if (availableMales >= 2 && availableFemales >= 2) {
      types.push("Mix Doubles");
    } else if (availableMales >= 4) {
      types.push("Men Doubles");
    } else if (availableFemales >= 4) {
      types.push("Women Doubles");
    }
  }

  return types;
}

/**
 * Create a skill-balanced match with fair team distribution
 */
function createBalancedMatch(
  session: number,
  courtNumber: string | number,
  matchType: MatchType,
  malePlayers: PlayerWithSkill[],
  femalePlayers: PlayerWithSkill[],
  playerLastPlayed: Map<string, number>,
  gamesPlayed: Map<string, number>,
  partnerHistory: Map<string, Set<string>>,
  currentSession: number,
  time: string,
): GeneratedMatch | null {
  const availableMales = malePlayers.filter(
    (p) => currentSession - playerLastPlayed.get(p.name)! >= 1,
  );
  const availableFemales = femalePlayers.filter(
    (p) => currentSession - playerLastPlayed.get(p.name)! >= 1,
  );

  const getSorted = (list: PlayerWithSkill[]) =>
    [...list].sort((a, b) => {
      const aGames = gamesPlayed.get(a.name) ?? 0;
      const bGames = gamesPlayed.get(b.name) ?? 0;
      if (aGames !== bGames) return aGames - bGames; // Fewer games first
      return b.skillScore - a.skillScore; // Higher skill first
    });

  let selectedPlayers: string[] = [];

  if (matchType === "Mix Doubles") {
    const sortedMales = getSorted(availableMales);
    const sortedFemales = getSorted(availableFemales);

    if (sortedMales.length >= 2 && sortedFemales.length >= 2) {
      // Select top 2 males and 2 females, avoiding recent partners
      const male1 = sortedMales[0]!;
      const male2 = sortedMales.find(m =>
        m.name !== male1.name &&
        !(partnerHistory.get(male1.name)?.has(m.name) ?? false)
      ) ?? sortedMales[1]!;

      const female1 = sortedFemales[0]!;
      const female2 = sortedFemales.find(f =>
        f.name !== female1.name &&
        !(partnerHistory.get(female1.name)?.has(f.name) ?? false)
      ) ?? sortedFemales[1]!;

      selectedPlayers = [male1.name, female1.name, male2.name, female2.name];
    }
  } else if (matchType === "Men Doubles") {
    const sortedMales = getSorted(availableMales);
    if (sortedMales.length >= 4) {
      selectedPlayers = sortedMales.slice(0, 4).map(p => p.name);
    }
  } else if (matchType === "Women Doubles") {
    const sortedFemales = getSorted(availableFemales);
    if (sortedFemales.length >= 4) {
      selectedPlayers = sortedFemales.slice(0, 4).map(p => p.name);
    }
  }

  if (selectedPlayers.length === 0) {
    return null;
  }

  // Update player statistics
  selectedPlayers.forEach(playerName => {
    playerLastPlayed.set(playerName, currentSession);
    gamesPlayed.set(playerName, (gamesPlayed.get(playerName) ?? 0) + 1);
  });

  // Update partner history (teams are [0,1] and [2,3])
  if (selectedPlayers.length === 4) {
    const [p1, p2, p3, p4] = selectedPlayers;
    if (p1 && p2) {
      partnerHistory.get(p1)?.add(p2);
      partnerHistory.get(p2)?.add(p1);
    }
    if (p3 && p4) {
      partnerHistory.get(p3)?.add(p4);
      partnerHistory.get(p4)?.add(p3);
    }
  }

  const skillRange = calculateSkillRange(
    selectedPlayers.map(name =>
      [...availableMales, ...availableFemales].find(p => p.name === name)
    ).filter(Boolean) as Player[]
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