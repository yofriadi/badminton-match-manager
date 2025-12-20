"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@workspace/ui/components/form";
import { HallSelector } from "../selectors/hall-selector";
import type { HallFormFieldProps } from "../../types";

export function HallFormField({ control, onError }: HallFormFieldProps) {
  return (
    <FormField
      control={control}
      name="hallId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Hall</FormLabel>
          <FormControl>
            <HallSelector
              value={field.value}
              onChange={field.onChange}
              onError={onError}
            />
          </FormControl>
          <FormDescription>
            Pick the hall where the schedule will take place.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}