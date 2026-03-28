"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getHallsForCurrentTenant,
  getRegisteredPlayersForCurrentTenant,
  getCourtsForHall,
} from "@/app/halls/lib/actions";
import type {
  HallOption,
  PlayerOption,
  CourtOption,
  UseScheduleDataResult,
} from "../types";

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
  const refetchHalls = async () => {
    try {
      setIsLoadingHalls(true);
      setHallsError(null);
      const halls = await getHallsForCurrentTenant();
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
  };

  // Load players
  const refetchPlayers = async () => {
    try {
      setIsLoadingPlayers(true);
      setPlayersError(null);
      const players = await getRegisteredPlayersForCurrentTenant(hallId);
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
  };

  // Load courts for specific hall
  const refetchCourts = async () => {
    if (!hallId) {
      setCourts([]);
      setCourtsError(null);
      return;
    }

    try {
      setIsLoadingCourts(true);
      setCourtsError(null);
      const courts = await getCourtsForHall(hallId);
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
  };

  // Initial data loading
  useEffect(() => {
    refetchHalls();
  }, []);

  // Load data when hallId changes
  useEffect(() => {
    refetchPlayers();
    refetchCourts();
  }, [hallId]);

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
