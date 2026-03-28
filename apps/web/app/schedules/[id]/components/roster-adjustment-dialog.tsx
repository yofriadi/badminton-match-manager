"use client";

import React from "react";
import { Plus, Check } from "lucide-react";
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
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import type { Player } from "../../lib/match-generator";

type RosterAdjustmentDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  selectedPlayerIds: Set<string>;
  maxPlayers: number;
  onTogglePlayer: (playerId: string) => void;
  onUpdateRound: () => void;
  trigger?: React.ReactNode;
};

export const RosterAdjustmentDialog: React.FC<RosterAdjustmentDialogProps> = ({
  isOpen,
  onOpenChange,
  players,
  selectedPlayerIds,
  maxPlayers,
  onTogglePlayer,
  onUpdateRound,
  trigger,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Adjust Round
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Round 1 Players</DialogTitle>
          <DialogDescription>
            Select players for the first round. Selected{" "}
            {selectedPlayerIds.size} / {maxPlayers} players.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          {players.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No players found.</p>
          ) : (
            <div className="space-y-2">
              {players.map((player) => {
                const isSelected = selectedPlayerIds.has(player.id);
                const isDisabled =
                  !isSelected && selectedPlayerIds.size >= maxPlayers;
                return (
                  <button
                    key={player.id}
                    type="button"
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors text-left ${
                      isSelected
                        ? "border-black bg-gray-50"
                        : isDisabled
                          ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => !isDisabled && onTogglePlayer(player.id)}
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
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button
            onClick={onUpdateRound}
            disabled={selectedPlayerIds.size === 0}
          >
            Update Roster ({selectedPlayerIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
