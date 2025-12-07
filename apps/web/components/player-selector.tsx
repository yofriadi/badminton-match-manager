"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { getRegisteredPlayersForCurrentTenant } from "@/app/halls/lib/actions";
import { toast } from "sonner";

interface PlayerSelectorProps {
  values: string[];
  onValuesChange: (values: string[]) => void;
}

interface Player {
  id: string;
  name: string;
  gender: string;
  skillLevel: string;
}

export function PlayerSelector({ values, onValuesChange }: PlayerSelectorProps) {
  const [playerOptions, setPlayerOptions] = useState<Array<{ label: string; value: string; name: string }>>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const players = await getRegisteredPlayersForCurrentTenant();
        const options = players.map((player: Player) => ({
          label: `${player.name} (${player.skillLevel})`,
          value: player.id,
          name: player.name, // Store name separately for display
        }));
        setPlayerOptions(options);
      } catch (error) {
        console.error("Failed to load players:", error);
        toast.error("Failed to load registered players");
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    loadPlayers();
  }, []);

  const getPlayerNames = (playerIds: string[]) => {
    return playerIds.map(id => {
      const player = playerOptions.find(option => option.value === id);
      return player ? player.name : id;
    });
  };

  return (
    <MultiSelector
      values={values}
      onValuesChange={onValuesChange}
      loop
    >
      <MultiSelectorTrigger>
        <div
          className="flex items-center gap-1 overflow-x-auto flex-nowrap max-w-full"
        >
          {values.length > 0 && getPlayerNames(values).map((name, index) => (
            <Badge key={index} variant="secondary">
              {name}
            </Badge>
          ))}
          <input
            type="text"
            placeholder={values.length === 0 ? (isLoadingPlayers ? "Loading registered players..." : "Select registered players") : ""}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </MultiSelectorTrigger>
      <MultiSelectorContent>
        <MultiSelectorList>
          {playerOptions.map((option) => (
            <MultiSelectorItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </MultiSelectorItem>
          ))}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelector>
  );
}
