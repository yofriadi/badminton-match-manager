"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Sparkles, Zap, Users, Trophy, Heart } from "lucide-react";
import type {
  MatchmakingOptions,
  MatchmakingStrategy,
} from "../../lib/match-generator";

interface MatchmakingSettingsDialogProps {
  options: MatchmakingOptions;
  onOpenChange?: (open: boolean) => void;
  onSaveOptions: (options: MatchmakingOptions) => Promise<void>;
}

const STRATEGY_CONFIG: Record<
  MatchmakingStrategy,
  {
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    badge: string;
  }
> = {
  balanced: {
    label: "Balanced",
    description:
      "Creates evenly matched games by minimizing skill gaps between teams.",
    icon: Zap,
    badge: "Recommended",
  },
  variety: {
    label: "Variety",
    description: "Maximizes unique pairings so players meet different people.",
    icon: Users,
    badge: "Social",
  },
  competitive: {
    label: "Competitive",
    description:
      "Pits the strongest against the strongest for high-stakes matches.",
    icon: Trophy,
    badge: "Ranked",
  },
  social: {
    label: "Social",
    description: "Relaxes skill balancing in favor of fun and casual mixing.",
    icon: Heart,
    badge: "Casual",
  },
};

export const MatchmakingSettingsDialog: React.FC<
  MatchmakingSettingsDialogProps
> = ({ options, onSaveOptions }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MatchmakingOptions>(options);

  useEffect(() => {
    if (open) {
      setDraft(options);
    }
  }, [open, options]);

  const currentStrategy = draft.strategy || "balanced";
  const strategyInfo = STRATEGY_CONFIG[currentStrategy];
  const handleSave = async () => {
    try {
      await onSaveOptions(draft);
      setOpen(false);
    } catch {
      // dialog stays open; caller shows toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Auto Matching
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] gap-0 p-0 overflow-hidden">
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(120,119,198,0.1),transparent_50%)]" />
          <DialogHeader className="relative space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">
                  Matchmaking Algorithm
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-sm leading-relaxed">
              Fine-tune how matches are generated to optimize for skill balance,
              variety, and fairness.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="strategy" className="text-sm font-semibold">
                Strategy
              </Label>
              {strategyInfo?.badge && (
                <Badge variant="secondary" className="text-xs">
                  {strategyInfo.badge}
                </Badge>
              )}
            </div>
            <Select
              value={currentStrategy}
              onValueChange={(value) =>
                setDraft({
                  ...draft,
                  strategy: value as MatchmakingStrategy,
                })
              }
            >
              <SelectTrigger
                id="strategy"
                className="h-11 w-full rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STRATEGY_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-slate-500" />
                        <div className="flex flex-col">
                          <span className="font-medium">{config.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {config.description}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {strategyInfo && (
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  {React.createElement(strategyInfo.icon, {
                    className:
                      "h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5",
                  })}
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm">
                      {strategyInfo.label} Mode
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {strategyInfo.description}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-950 px-2 text-muted-foreground">
                Advanced Options
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <SettingToggle
              id="avoid-partners"
              label="Avoid Repeat Partners"
              description="Prioritize pairing players with new partners each round"
              checked={draft.avoidRepeatPartners ?? true}
              onCheckedChange={(checked) =>
                setDraft({
                  ...draft,
                  avoidRepeatPartners: checked,
                })
              }
            />

            <SettingToggle
              id="avoid-opponents"
              label="Avoid Repeat Opponents"
              description="Minimize repeated matchups against the same opponents"
              checked={draft.avoidRepeatOpponents ?? true}
              onCheckedChange={(checked) =>
                setDraft({
                  ...draft,
                  avoidRepeatOpponents: checked,
                })
              }
            />

            <SettingToggle
              id="prioritize-fairness"
              label="Prioritize Fair Play"
              description="Ensure balanced court time distribution for all players"
              checked={draft.prioritizeFairPlay ?? true}
              onCheckedChange={(checked) =>
                setDraft({
                  ...draft,
                  prioritizeFairPlay: checked,
                })
              }
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Changes apply when saved
          </div>
          <Button size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SettingToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Toggle
        id={id}
        pressed={checked}
        onPressedChange={onCheckedChange}
        className="cursor-pointer"
      />
    </div>
  );
}
