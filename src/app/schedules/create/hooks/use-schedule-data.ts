"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  HallOption,
  PlayerOption,
  CourtOption,
  UseScheduleDataResult,
} from "../types";
import { fetchJson } from "@/lib/http";

export function useScheduleData(hallId?: string): UseScheduleDataResult {
  // Halls state
  const [halls, setHalls] = useState<HallOption[]>([]);
  const [isLoadingHalls, setIsLoadingHalls] = useState(true);
  const [hallsError, setHallsError] = useState<string | null>(null);

  // Players state
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [playersError, setPlayersError] = useState<string | null>(null);

  // Courts state
  const [courts, setCourts] = useState<CourtOption[]>([]);
  const [isLoadingCourts, setIsLoadingCourts] = useState(false);
  const [courtsError, setCourtsError] = useState<string | null>(null);

  // Load halls
  const refetchHalls = useCallback(async () => {
    try {
      setIsLoadingHalls(true);
      setHallsError(null);
      const halls = await fetchJson<Array<{ id: string; name: string }>>(
        "/api/tenant/halls",
      );
      const options = halls.map((hall) => ({
        label: hall.name,
        value: hall.id,
      }));
      setHalls(options);
    } catch (error) {
      console.error("Failed to load halls:", error);
      setHallsError("Failed to load halls");
      toast.error("Failed to load halls", {
        description:
          "Could not fetch available halls. Please refresh the page.",
      });
    } finally {
      setIsLoadingHalls(false);
    }
  }, []);

  // Load players
  const refetchPlayers = useCallback(async () => {
    try {
      setIsLoadingPlayers(true);
      setPlayersError(null);
      const players = hallId
        ? await fetchJson<
            Array<{ id: string; name: string; skillLevel: string }>
          >(`/api/halls/${hallId}/registered-players`)
        : [];
      const options = players.map((player) => ({
        label: `${player.name} (${player.skillLevel})`,
        value: player.id,
        name: player.name,
      }));
      setPlayers(options);
    } catch (error) {
      console.error("Failed to load players:", error);
      setPlayersError("Failed to load registered players");
      toast.error("Failed to load registered players", {
        description: "Could not fetch players for the selected hall.",
      });
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [hallId]);

  // Load courts for specific hall
  const refetchCourts = useCallback(async () => {
    if (!hallId) {
      setCourts([]);
      setCourtsError(null);
      return;
    }

    try {
      setIsLoadingCourts(true);
      setCourtsError(null);
      const courts = await fetchJson<Array<{ id: string; number: number }>>(
        `/api/halls/${hallId}/courts`,
      );
      const options = courts.map((court) => ({
        label: `Court ${court.number}`,
        value: court.id,
        number: court.number,
      }));
      setCourts(options);
    } catch (error) {
      console.error("Failed to load courts:", error);
      setCourtsError("Failed to load courts");
      toast.error("Failed to load courts", {
        description: "Could not fetch courts for the selected hall.",
      });
      setCourts([]);
    } finally {
      setIsLoadingCourts(false);
    }
  }, [hallId]);

  // Initial data loading
  useEffect(() => {
    refetchHalls();
  }, [refetchHalls]);

  // Load data when hallId changes
  useEffect(() => {
    refetchPlayers();
    refetchCourts();
  }, [refetchCourts, refetchPlayers]);

  return {
    halls,
    players,
    courts,
    isLoadingHalls,
    isLoadingPlayers,
    isLoadingCourts,
    hallsError,
    playersError,
    courtsError,
    refetchHalls,
    refetchPlayers,
    refetchCourts,
  };
}
