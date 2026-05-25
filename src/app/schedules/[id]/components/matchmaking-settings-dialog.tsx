"use client";

import React from "react";
import { Sparkles, Target, Users, Repeat, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type {
  MatchmakingOptions,
  MatchmakingStrategy,
} from "../../lib/match-generator";

interface MatchmakingSettingsDialogProps {
  options: MatchmakingOptions;
  onOpenChange?: (open: boolean) => void;
  onUpdateOptions: (options: MatchmakingOptions) => void;
}

const STRATEGY_CONFIG: Record<
  MatchmakingStrategy,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
  }
> = {
  balanced: {
    label: "Balanced",
    description: "Equal weight for skill, variety, and fairness",
    icon: Scale,
    badge: "Recommended",
  },
  variety: {
    label: "Variety",
    description: "Maximize unique pairings and new partnerships",
    icon: Repeat,
  },
  competitive: {
    label: "Competitive",
    description: "Tight skill gaps for evenly-matched games",
    icon: Target,
  },
  social: {
    label: "Social",
    description: "Fair rotation ensuring equal court time",
    icon: Users,
  },
};

export const MatchmakingSettingsDialog: React.FC<
  MatchmakingSettingsDialogProps
> = ({ options, onUpdateOptions }) => {
  const currentStrategy = options.strategy || "balanced";
  const strategyInfo = STRATEGY_CONFIG[currentStrategy];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Algorithm
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
                onUpdateOptions({
                  ...options,
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
              checked={options.avoidRepeatPartners ?? true}
              onCheckedChange={(checked) =>
                onUpdateOptions({
                  ...options,
                  avoidRepeatPartners: checked,
                })
              }
            />

            <SettingToggle
              id="avoid-opponents"
              label="Avoid Repeat Opponents"
              description="Minimize repeated matchups against the same opponents"
              checked={options.avoidRepeatOpponents ?? true}
              onCheckedChange={(checked) =>
                onUpdateOptions({
                  ...options,
                  avoidRepeatOpponents: checked,
                })
              }
            />

            <SettingToggle
              id="prioritize-fairness"
              label="Prioritize Fair Play"
              description="Ensure balanced court time distribution for all players"
              checked={options.prioritizeFairPlay ?? true}
              onCheckedChange={(checked) =>
                onUpdateOptions({
                  ...options,
                  prioritizeFairPlay: checked,
                })
              }
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Changes apply to new matches
          </div>
          <DialogTrigger asChild>
            <Button size="sm">Done</Button>
          </DialogTrigger>
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
    <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-white dark:bg-slate-900/30">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(state) => onCheckedChange(state === true)}
        className="mt-0.5"
      />
      <div className="flex-1 space-y-1">
        <Label
          htmlFor={id}
          className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </Label>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
