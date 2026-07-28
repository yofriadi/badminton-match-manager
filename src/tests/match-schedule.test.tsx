import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MatchSchedule from "@/app/schedules/[id]/components/match-schedule";
import type {
  GeneratedMatch,
  Player,
} from "@/app/schedules/lib/match-generator";
import type { ScheduleRoundOverride } from "@/app/schedules/lib/types";

vi.mock("@/components/ui/animated-cta-button", () => ({
  default: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("@/app/schedules/[id]/components/empty-match-state", () => ({
  EmptyMatchState: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock("@/app/schedules/[id]/components/roster-adjustment-dialog", () => ({
  RosterAdjustmentDialog: ({
    roundNumber,
    matches,
    onUpdateRoundMatches,
  }: {
    roundNumber: number;
    matches: GeneratedMatch[];
    onUpdateRoundMatches: (matches: GeneratedMatch[]) => void;
  }) => (
    <button
      onClick={() => {
        const [firstMatch, ...rest] = matches;
        if (!firstMatch) return;
        onUpdateRoundMatches([
          {
            ...firstMatch,
            players: ["Ethan", ...firstMatch.players.slice(1)],
          },
          ...rest,
        ]);
      }}
    >
      adjust-round-{roundNumber}
    </button>
  ),
}));

vi.mock("@/app/schedules/[id]/components/match-round", () => ({
  MatchRound: ({
    gameNumber,
    matches,
    headerAction,
  }: {
    gameNumber: number;
    matches: { players: string[] }[];
    headerAction?: ReactNode;
  }) => (
    <div data-testid={`round-${gameNumber}`}>
      {headerAction}
      {matches.flatMap((match) => match.players).join(",")}
    </div>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("MatchSchedule persistence", () => {
  const players: Player[] = [
    { id: "1", name: "Alice", gender: "male", skillLevel: "intermediate" },
    { id: "2", name: "Bob", gender: "male", skillLevel: "intermediate" },
    { id: "3", name: "Charlie", gender: "male", skillLevel: "intermediate" },
    { id: "4", name: "Diana", gender: "male", skillLevel: "intermediate" },
    { id: "5", name: "Ethan", gender: "male", skillLevel: "intermediate" },
  ];

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
      }),
    );
  });

  it("persists the initially generated schedule", async () => {
    render(
      <MatchSchedule
        scheduleId="schedule-1"
        players={players}
        courtNumbers={[1]}
        startTime="08:00"
        durationHours={2}
        initialNumberOfSessions={5}
      />,
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const [, request] = vi.mocked(fetch).mock.calls[0]!;
    expect(request).toMatchObject({
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });

    const body = JSON.parse(String(request?.body)) as {
      numberOfSessions: number;
      generatedMatches: ScheduleRoundOverride[];
    };

    expect(body.numberOfSessions).toBe(5);
    expect(body.generatedMatches).toHaveLength(5);
    expect(body.generatedMatches[0]?.playerIds).toHaveLength(4);
  });

  it("does not persist again when generated schedule already exists", async () => {
    const initialGeneratedMatches: ScheduleRoundOverride[] = [
      {
        game: 1,
        number: 1,
        playerIds: ["1", "2", "3", "4"],
        time: "08:00",
        type: "Men Doubles",
        skillRange: "Intermediate - Intermediate",
      },
    ];

    render(
      <MatchSchedule
        scheduleId="schedule-1"
        players={players.slice(0, 4)}
        courtNumbers={[1]}
        startTime="08:00"
        durationHours={2}
        initialNumberOfSessions={1}
        initialGeneratedMatches={initialGeneratedMatches}
      />,
    );

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  it("preserves manual substitutions when regenerating rounds", async () => {
    const initialGeneratedMatches: ScheduleRoundOverride[] = [
      {
        game: 1,
        number: 1,
        playerIds: ["1", "2", "3", "4"],
        time: "08:00",
        type: "Men Doubles",
        skillRange: "Intermediate - Intermediate",
      },
      {
        game: 2,
        number: 1,
        playerIds: ["2", "3", "4", "5"],
        time: "08:20",
        type: "Men Doubles",
        skillRange: "Intermediate - Intermediate",
      },
    ];

    const { rerender } = render(
      <MatchSchedule
        scheduleId="schedule-1"
        players={players}
        courtNumbers={[1]}
        startTime="08:00"
        durationHours={2}
        initialNumberOfSessions={2}
        initialGeneratedMatches={initialGeneratedMatches}
      />,
    );

    fireEvent.click(screen.getByText("adjust-round-1"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const firstBody = JSON.parse(
      String(vi.mocked(fetch).mock.calls[0]?.[1]?.body),
    ) as {
      manualSubstitutions: {
        game: number;
        court: string | number;
        slot: number;
        playerId: string;
      }[];
      generatedMatches: ScheduleRoundOverride[];
    };

    expect(firstBody.manualSubstitutions).toEqual([
      { game: 1, court: 1, slot: 0, playerId: "5" },
    ]);
    expect(firstBody.generatedMatches[0]?.playerIds?.[0]).toBe("5");

    fireEvent.click(screen.getByText("Generate More Round"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    const secondBody = JSON.parse(
      String(vi.mocked(fetch).mock.calls[1]?.[1]?.body),
    ) as {
      manualSubstitutions: {
        game: number;
        court: string | number;
        slot: number;
        playerId: string;
      }[];
      generatedMatches: ScheduleRoundOverride[];
      numberOfSessions: number;
    };

    expect(secondBody.numberOfSessions).toBe(3);
    expect(secondBody.manualSubstitutions).toEqual([
      { game: 1, court: 1, slot: 0, playerId: "5" },
    ]);
    expect(secondBody.generatedMatches[0]?.playerIds?.[0]).toBe("5");

    rerender(
      <MatchSchedule
        scheduleId="schedule-1"
        players={players}
        courtNumbers={[1]}
        startTime="08:00"
        durationHours={2}
        matchmakingOptions={{ strategy: "competitive" }}
        initialNumberOfSessions={2}
        initialGeneratedMatches={initialGeneratedMatches}
      />,
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    const thirdBody = JSON.parse(
      String(vi.mocked(fetch).mock.calls[2]?.[1]?.body),
    ) as {
      manualSubstitutions: {
        game: number;
        court: string | number;
        slot: number;
        playerId: string;
      }[];
      generatedMatches: ScheduleRoundOverride[];
    };

    // Settings changed → manual substitutions are cleared and schedule is fully regenerated
    expect(thirdBody.manualSubstitutions).toEqual([]);
    // The first player slot should be the deterministic base schedule (no sub applied)
    expect(thirdBody.generatedMatches[0]?.playerIds).toHaveLength(4);
  });
});
