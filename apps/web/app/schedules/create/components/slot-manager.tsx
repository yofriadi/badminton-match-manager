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
import { Input } from "@workspace/ui/components/input";
import { CourtSelector } from "./selectors/court-selector";
import type { SlotManagerProps } from "../types";

export function SlotManager({
  fieldArray,
  control,
  hallId,
  courts,
  isCourtsLoading,
}: SlotManagerProps) {
  const { fields, append, remove } = fieldArray;

  return (
    <div className="space-y-6">
      {fields.map((field: any, index: number) => (
        <div
          key={field.id}
          className="rounded-lg border border-muted-foreground/10 p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Schedule {index + 1}</h3>
            {fields.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            ) : null}
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name={`slots.${index}.startTime`}
                render={({ field: slotField }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...slotField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`slots.${index}.endTime`}
                render={({ field: slotField }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...slotField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name={`slots.${index}.courts`}
              render={({ field: slotField }) => (
                <FormItem>
                  <FormLabel>Select Courts</FormLabel>
                  <FormControl>
                    <CourtSelector
                      hallId={hallId}
                      values={slotField.value ?? []}
                      onValuesChange={(value) => slotField.onChange(value)}
                      disabled={!hallId}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose courts for this specific time.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}

      <div className="flex w-full gap-3 justify-end">
        {fields.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => remove(fields.length - 1)}
          >
            Remove Last
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              startTime: "18:00",
              endTime: "20:00",
              courts: [],
            })
          }
        >
          Add Another Schedule
        </Button>
      </div>
    </div>
  );
}
