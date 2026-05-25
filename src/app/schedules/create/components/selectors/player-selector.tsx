"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
  MultiSelectorInput,
} from "@/components/ui/multi-select";
import { toast } from "sonner";
import type { PlayerSelectorProps } from "../../types";
import { fetchJson } from "@/lib/http";

interface Player {
  id: string;
  name: string;
  gender: string;
  skillLevel: string;
}

export function PlayerSelector({
  hallId,
  values,
  onValuesChange,
  disabled,
  onError,
}: PlayerSelectorProps) {
  const [playerOptions, setPlayerOptions] = useState<
    Array<{ label: string; value: string; name: string }>
  >([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setIsLoadingPlayers(true);
        const players = hallId
          ? await fetchJson<Player[]>(
              `/api/halls/${hallId}/registered-players`,
            )
          : [];
        const options = players.map((player: Player) => ({
          label: `${player.name} (${player.skillLevel})`,
          value: player.id,
          name: player.name, // Store name separately for display
        }));
        setPlayerOptions(options);
      } catch (error) {
        console.error("Failed to load players:", error);
        const errorMessage = "Failed to load registered players";
        onError?.(errorMessage);
        toast.error(errorMessage, {
          description: "Could not fetch players for the selected hall.",
        });
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    loadPlayers();
  }, [hallId, onError]);

  const getPlayerNames = (playerIds: string[]) => {
    return playerIds.map((id) => {
      const player = playerOptions.find((option) => option.value === id);
      return player ? player.name : id;
    });
  };

  return (
    <MultiSelector
      values={values}
      onValuesChange={onValuesChange}
      loop
      disabled={disabled}
    >
      <MultiSelectorTrigger>
        {values.length > 0 &&
          getPlayerNames(values).map((name, index) => (
            <Badge key={index}>{name}</Badge>
          ))}
        <MultiSelectorInput
          placeholder={
            disabled
              ? "Select a hall first"
              : values.length === 0
                ? isLoadingPlayers
                  ? "Loading registered players..."
                  : "Select registered players"
                : ""
          }
        />
      </MultiSelectorTrigger>
      <MultiSelectorContent>
        <MultiSelectorList>
          {playerOptions.map((option) => (
            <MultiSelectorItem key={option.value} value={option.value}>
              {option.label}
            </MultiSelectorItem>
          ))}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelector>
  );
}
