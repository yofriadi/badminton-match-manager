"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Player, GeneratedMatch } from "../../lib/match-generator";
import {
  calculateSkillRange,
  getOptimalMatchType,
} from "../../lib/match-generator";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

type RosterAdjustmentDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roundNumber: number;
  players: Player[];
  matches: GeneratedMatch[];
  onUpdateRoundMatches: (updatedMatches: GeneratedMatch[]) => void;
  trigger?: React.ReactNode;
};

export const RosterAdjustmentDialog: React.FC<RosterAdjustmentDialogProps> = ({
  isOpen,
  onOpenChange,
  roundNumber,
  players,
  matches,
  onUpdateRoundMatches,
  trigger,
}) => {
  const playersByIdMap = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  );
  const playersByNameMap = useMemo(
    () => new Map(players.map((p) => [p.name, p])),
    [players],
  );
  const [localMatches, setLocalMatches] = useState<GeneratedMatch[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalMatches(structuredClone(matches));
    }
  }, [isOpen, matches]);

  const activePlayerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const m of localMatches) {
      for (const name of m.players) {
        const p = playersByNameMap.get(name);
        if (p) ids.add(p.id);
      }
    }
    return ids;
  }, [localMatches, playersByNameMap]);

  const sittingOutPlayers = players.filter((p) => !activePlayerIds.has(p.id));

  const handleSwapPlayers = (
    courtNumber: string | number,
    slotIndex: number,
    targetPlayerId: string,
  ) => {
    const targetPlayer = playersByIdMap.get(targetPlayerId);
    if (!targetPlayer) return;

    // Find where target is currently playing (if anywhere)
    let sourceCourtNumber: string | number | null = null;
    let sourceSlotIndex: number | null = null;

    for (const m of localMatches) {
      for (let i = 0; i < m.players.length; i++) {
        const p = playersByNameMap.get(m.players[i]);
        if (p?.id === targetPlayerId) {
          sourceCourtNumber = m.number;
          sourceSlotIndex = i;
          break;
        }
      }
      if (sourceCourtNumber !== null) break;
    }

    // Current player in the clicked slot
    const currentMatchIdx = localMatches.findIndex(
      (m) => m.number === courtNumber,
    );
    if (currentMatchIdx === -1) return;
    const currentPlayerName = localMatches[currentMatchIdx].players[slotIndex];

    // Create copy of localMatches
    const updatedMatches = localMatches.map((m) => ({
      ...m,
      players: [...m.players],
    }));

    // Perform swap
    if (sourceCourtNumber !== null && sourceSlotIndex !== null) {
      const sourceMatchIdx = updatedMatches.findIndex(
        (m) => m.number === sourceCourtNumber,
      );
      updatedMatches[currentMatchIdx].players[slotIndex] = targetPlayer.name;
      updatedMatches[sourceMatchIdx].players[sourceSlotIndex] =
        currentPlayerName;
    } else {
      updatedMatches[currentMatchIdx].players[slotIndex] = targetPlayer.name;
    }

    // Update match type and skill range dynamically for ALL matches
    updatedMatches.forEach((m) => {
      const matchPlayers = m.players
        .map((name) => playersByNameMap.get(name))
        .filter((p): p is Player => !!p);

      m.skillRange = calculateSkillRange(matchPlayers);
      m.type = getOptimalMatchType(matchPlayers);
    });

    setLocalMatches(updatedMatches);
  };

  const handleSave = () => {
    onUpdateRoundMatches(localMatches);
  };

  const renderPlayerSelect = (match: GeneratedMatch, slotIdx: number) => {
    const currentName = match.players[slotIdx];
    const currentPlayer = playersByNameMap.get(currentName);

    const options: ComboboxOption[] = [];

    if (currentName && currentPlayer) {
      options.push({
        value: currentPlayer.id,
        label: `${currentName} (${currentPlayer.skillLevel || "unrated"})`,
        description: `${currentPlayer.gender} current player`,
      });
    }

    sittingOutPlayers.forEach((p) => {
      options.push({
        value: p.id,
        label: `${p.name} (${p.gender}, ${p.skillLevel})`,
        description: `substitute sitting out`,
      });
    });

    localMatches.forEach((m) => {
      m.players.forEach((name) => {
        if (name === currentName) return;
        const p = playersByNameMap.get(name);
        if (!p) return;
        options.push({
          value: p.id,
          label: `${p.name} (Court ${m.number} - ${p.skillLevel || "unrated"})`,
          description: `swap player court ${m.number}`,
        });
      });
    });

    return (
      <Combobox
        value={currentPlayer?.id ?? ""}
        onChange={(val) => handleSwapPlayers(match.number, slotIdx, val)}
        options={options}
        placeholder="Select player"
        searchPlaceholder="Search player..."
        className="w-full h-8 py-1.5 text-xs font-semibold rounded-lg border transition-all focus:outline-none focus:ring-2 cursor-pointer"
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="secondary"
            size="sm"
            className="h-8 rounded-lg text-sm"
          >
            Adjust Round
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Adjust Round {roundNumber} Matches</DialogTitle>
          <DialogDescription>
            Swap or substitute players between courts.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-95 pr-4">
          {localMatches.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">
              No matches found in this round.
            </p>
          ) : (
            <div className="space-y-4">
              {localMatches.map((match) => (
                <div
                  key={match.number}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-500 leading-none">
                        Court {match.number}
                      </span>
                      <span className="text-xs text-gray-400">
                        {match.skillRange}
                      </span>
                    </div>
                    <span className="text-xs uppercase text-gray-400 leading-none pt-[1px]">
                      {match.type === "Mix Doubles"
                        ? "XD"
                        : match.type === "Men Doubles"
                          ? "MD"
                          : match.type === "Women Doubles"
                            ? "WD"
                            : match.type}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="space-y-2">
                      <div className="space-y-2">
                        {renderPlayerSelect(match, 0)}
                        {renderPlayerSelect(match, 1)}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 flex items-center justify-center text-md font-black">
                        VS
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-2">
                        {renderPlayerSelect(match, 2)}
                        {renderPlayerSelect(match, 3)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            className="w-full sm:w-auto h-9 text-xs font-semibold rounded-lg bg-black text-white hover:bg-black/90 active:scale-95 transition-all"
          >
            Update Round
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RosterAdjustmentDialog;
