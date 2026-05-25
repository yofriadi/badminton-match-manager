"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { SkillLevel, PlayerGender } from "../../lib/types";
import { fetchJson } from "@/lib/http";

interface AddPlayerDialogProps {
  hallId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TenantPlayer {
  id: string;
  name: string;
  gender: string;
  skillLevel: string;
}

export function AddPlayerDialog({
  hallId,
  isOpen,
  onOpenChange,
}: AddPlayerDialogProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [existingPlayers, setExistingPlayers] = useState<TenantPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new player
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState<PlayerGender>("male");
  const [newSkillLevel, setNewSkillLevel] =
    useState<SkillLevel>("intermediate");

  // Form state for existing players
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const loadTenantPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const players = await fetchJson<TenantPlayer[]>(
        `/api/tenant/players?excludeHallId=${hallId}`,
      );
      setExistingPlayers(players);
    } catch (error) {
      console.error("Failed to load tenant players:", error);
      toast.error("Failed to load existing players");
    } finally {
      setIsLoading(false);
    }
  }, [hallId]);

  useEffect(() => {
    if (isOpen) {
      void loadTenantPlayers();
    }
  }, [isOpen, loadTenantPlayers]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      if (mode === "existing") {
        if (selectedPlayerIds.length === 0) {
          toast.error("Please select at least one player");
          return;
        }

        // Add all selected players
        await Promise.all(
          selectedPlayerIds.map((playerId) =>
            fetchJson(`/api/halls/${hallId}/players`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ playerId }),
            }),
          ),
        );
      } else {
        if (!newName.trim()) {
          toast.error("Please enter a name");
          return;
        }
        await fetchJson(`/api/halls/${hallId}/players`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newName,
            gender: newGender,
            skillLevel: newSkillLevel,
          }),
        });
      }
      toast.success(
        mode === "existing"
          ? `${selectedPlayerIds.length} player(s) added`
          : "Player created and added",
      );
      await router.invalidate();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to register player:", error);
      toast.error("Failed to add player to hall");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setNewName("");
    setNewGender("male");
    setNewSkillLevel("intermediate");
    setSelectedPlayerIds([]);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Player to Hall</DialogTitle>
          <DialogDescription>
            Select an existing player or create a new one to add to this hall.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === "existing" ? "default" : "outline"}
            className="flex-1 rounded-2xl"
            onClick={() => setMode("existing")}
          >
            Existing
          </Button>
          <Button
            variant={mode === "new" ? "default" : "outline"}
            className="flex-1 rounded-2xl"
            onClick={() => setMode("new")}
          >
            New Player
          </Button>
        </div>

        {mode === "existing" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Players</Label>
              <MultiSelector
                values={selectedPlayerIds}
                onValuesChange={setSelectedPlayerIds}
                disabled={isLoading}
              >
                <MultiSelectorTrigger className="rounded-2xl">
                  {selectedPlayerIds.map((id) => {
                    const player = existingPlayers.find((p) => p.id === id);
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="flex items-center gap-1 rounded-lg px-2 py-1"
                      >
                        {player?.name || id}
                        <button
                          type="button"
                          className="hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlayerIds(
                              selectedPlayerIds.filter((pid) => pid !== id),
                            );
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                  <MultiSelectorInput
                    placeholder={isLoading ? "Loading..." : "Choose players..."}
                  />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {existingPlayers.length === 0 ? (
                      <div className="p-2 text-sm text-center text-muted-foreground">
                        No players found. Create a new one.
                      </div>
                    ) : (
                      existingPlayers.map((player) => (
                        <MultiSelectorItem key={player.id} value={player.id}>
                          {player.name} ({player.skillLevel})
                        </MultiSelectorItem>
                      ))
                    )}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                className="rounded-2xl"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={newGender}
                  onValueChange={(v) => setNewGender(v as PlayerGender)}
                >
                  <SelectTrigger id="gender" className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill">Skill Level</Label>
                <Select
                  value={newSkillLevel}
                  onValueChange={(v) => setNewSkillLevel(v as SkillLevel)}
                >
                  <SelectTrigger id="skill" className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unrated">Unrated</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="novice">Novice</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full"
            disabled={
              isSubmitting ||
              (mode === "existing" && selectedPlayerIds.length === 0)
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? "Adding..." : "Add Player"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
