"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@workspace/ui/components/form";
import { PlayerSelector } from "../selectors/player-selector";
import type { PlayersFormFieldProps } from "../../types";

export function PlayersFormField({
  control,
  hallId,
  onError,
}: PlayersFormFieldProps) {
  return (
    <FormField
      control={control}
      name="registeredPlayers"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Registered Players</FormLabel>
          <FormControl>
            <PlayerSelector
              hallId={hallId}
              values={field.value ?? []}
              onValuesChange={field.onChange}
              disabled={!hallId}
              onError={onError}
            />
          </FormControl>
          <FormDescription>Select multiple options.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
