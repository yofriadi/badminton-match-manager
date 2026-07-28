import { describe, expect, it, vi } from "vitest";
import {
  generateMatches,
  type GeneratedMatch,
  type Player,
} from "@/app/schedules/lib/match-generator";

describe("Match Generator - Mixed Doubles", () => {
  it("should generate Mix Doubles matches with a man and a woman on each side", () => {
    // 2 male players and 2 female players
    const players: Player[] = [
      { id: "1", name: "Alice", gender: "female", skillLevel: "intermediate" },
      { id: "2", name: "Bob", gender: "male", skillLevel: "intermediate" },
      { id: "3", name: "Charlie", gender: "male", skillLevel: "intermediate" },
      { id: "4", name: "Diana", gender: "female", skillLevel: "intermediate" },
    ];

    const round1PlayerIds = new Set(["1", "2", "3", "4"]);
    const courtNumbers = [1];

    const matches = generateMatches(
      players,
      round1PlayerIds,
      1, // numberOfCourts
      courtNumbers,
      1, // numberOfSessions
      "08:00", // startTime
      30, // sessionDuration
      [], // lockedMatches
      {
        strategy: "balanced",
        avoidRepeatPartners: true,
        avoidRepeatOpponents: true,
      },
    );

    expect(matches.length).toBe(1);
    const match = matches[0];
    expect(match.type).toBe("Mix Doubles");

    // In a valid Mixed Doubles match of [Alice, Bob, Charlie, Diana]
    // The teams should be:
    // Team 1: Alice (female) + either Bob or Charlie (male)
    // Team 2: Diana (female) + the other male player
    // This means we CANNOT have Alice & Diana on the same team, nor Bob & Charlie on the same team.

    // Find the players in the generated match
    const p1 = players.find((p) => p.name === match.players[0])!;
    const p2 = players.find((p) => p.name === match.players[1])!;
    const p3 = players.find((p) => p.name === match.players[2])!;
    const p4 = players.find((p) => p.name === match.players[3])!;

    // Team A is players[0] and players[1]
    // Team B is players[2] and players[3]
    const teamAGenders = [p1.gender, p2.gender];
    const teamBGenders = [p3.gender, p4.gender];

    expect(teamAGenders).toContain("male");
    expect(teamAGenders).toContain("female");
    expect(teamBGenders).toContain("male");
    expect(teamBGenders).toContain("female");
  });

  it("should generate matches evenly and prioritize underplayed players across multiple sessions", () => {
    // 5 players, 1 court. Over 5 sessions, every player should play exactly 4 games.
    const players: Player[] = [
      { id: "1", name: "Alice", gender: "male", skillLevel: "intermediate" },
      { id: "2", name: "Bob", gender: "male", skillLevel: "intermediate" },
      { id: "3", name: "Charlie", gender: "male", skillLevel: "intermediate" },
      { id: "4", name: "Diana", gender: "male", skillLevel: "intermediate" },
      { id: "5", name: "Ethan", gender: "male", skillLevel: "intermediate" },
    ];

    const round1PlayerIds = new Set(["1", "2", "3", "4", "5"]);
    const courtNumbers = [1];

    const matches = generateMatches(
      players,
      round1PlayerIds,
      1, // numberOfCourts
      courtNumbers,
      5, // numberOfSessions
      "08:00", // startTime
      20, // sessionDuration (20 mins)
      [], // lockedMatches
      {
        strategy: "balanced",
        avoidRepeatPartners: true,
        avoidRepeatOpponents: true,
      },
    );

    expect(matches.length).toBe(5);

    const playCounts: Record<string, number> = {};
    players.forEach((p) => {
      playCounts[p.name] = 0;
    });

    matches.forEach((m) => {
      m.players.forEach((pName) => {
        playCounts[pName]++;
      });
    });

    // With 5 players, 1 court, 5 sessions, there are exactly 20 player-slots.
    // Each of the 5 players should play exactly 4 games!
    players.forEach((p) => {
      expect(playCounts[p.name]).toBe(4);
    });
  });

  it("should dynamically choose the optimal match type to maximize play time for underplayed players", () => {
    // 6 males and 2 females. 2 courts.
    // Session 0: Mix Doubles needs 2M 2F. Remaining are 4M.
    // The generator should dynamically choose Men Doubles for Court 2 to allow the other 4M to play!
    const players: Player[] = [
      { id: "1", name: "M1", gender: "male", skillLevel: "intermediate" },
      { id: "2", name: "M2", gender: "male", skillLevel: "intermediate" },
      { id: "3", name: "M3", gender: "male", skillLevel: "intermediate" },
      { id: "4", name: "M4", gender: "male", skillLevel: "intermediate" },
      { id: "5", name: "M5", gender: "male", skillLevel: "intermediate" },
      { id: "6", name: "M6", gender: "male", skillLevel: "intermediate" },
      { id: "7", name: "F1", gender: "female", skillLevel: "intermediate" },
      { id: "8", name: "F2", gender: "female", skillLevel: "intermediate" },
    ];

    const round1PlayerIds = new Set(["1", "2", "3", "4", "5", "6", "7", "8"]);
    const courtNumbers = [1, 2];

    const matches = generateMatches(
      players,
      round1PlayerIds,
      2, // numberOfCourts
      courtNumbers,
      1, // numberOfSessions
      "08:00", // startTime
      20, // sessionDuration
      [], // lockedMatches
      {
        strategy: "balanced",
      },
    );

    // Both courts should have generated matches
    expect(matches.length).toBe(2);

    const mixDoublesMatch = matches.find((m) => m.type === "Mix Doubles");
    const menDoublesMatch = matches.find((m) => m.type === "Men Doubles");

    expect(mixDoublesMatch).toBeDefined();
    expect(menDoublesMatch).toBeDefined();

    // Verify F1 and F2 are in Mix Doubles and not Men Doubles
    expect(mixDoublesMatch!.players).toContain("F1");
    expect(mixDoublesMatch!.players).toContain("F2");
  });
  it("should generate the same uneven-player schedule across reloads", () => {
    const players: Player[] = [
      { id: "1", name: "Alice", gender: "male", skillLevel: "intermediate" },
      { id: "2", name: "Bob", gender: "male", skillLevel: "intermediate" },
      { id: "3", name: "Charlie", gender: "male", skillLevel: "intermediate" },
      { id: "4", name: "Diana", gender: "male", skillLevel: "intermediate" },
      { id: "5", name: "Ethan", gender: "male", skillLevel: "intermediate" },
    ];

    const round1PlayerIds = new Set(players.map((player) => player.id));
    const courtNumbers = [1];
    const options = {
      strategy: "balanced" as const,
      avoidRepeatPartners: true,
      avoidRepeatOpponents: true,
    };

    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("match generation should not rely on randomness");
    });

    const generateSchedule = (): GeneratedMatch[] =>
      generateMatches(
        players,
        round1PlayerIds,
        1,
        courtNumbers,
        5,
        "08:00",
        20,
        [],
        options,
      );

    try {
      const firstLoad = generateSchedule();
      const secondLoad = generateSchedule();

      expect(firstLoad).toEqual(secondLoad);
    } finally {
      randomSpy.mockRestore();
    }
  });
});
