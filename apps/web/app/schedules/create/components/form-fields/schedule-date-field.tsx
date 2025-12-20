"use client";

import { Button } from "@workspace/ui/components/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Calendar as BaseCalendar } from "@workspace/ui/components/calendar";
import { isBefore } from "date-fns";
import type { ScheduleDateFieldProps } from "../../types";

export function ScheduleDateField({
  control,
  name,
  label,
  description,
  minDate,
}: ScheduleDateFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-fit min-w-40 justify-between"
              >
                {field.value ? field.value.toLocaleDateString() : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <BaseCalendar
                mode="single"
                selected={field.value ?? undefined}
                onSelect={(value) => {
                  if (!value) return;
                  const normalized = new Date(value);
                  normalized.setHours(0, 0, 0, 0);
                  if (isBefore(normalized, minDate)) return;
                  field.onChange(normalized);
                }}
                disabled={[{ before: minDate }]}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}