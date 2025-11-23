"use client";

import * as React from "react";
import { addDays, format, isBefore, startOfDay, startOfToday } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as BaseCalendar } from "@workspace/ui/components/calendar";

type ScheduleDateTimePickerBaseProps = Omit<
  InputProps,
  "type" | "value" | "defaultValue" | "onChange"
>;

export type ScheduleDateTimePickerProps = ScheduleDateTimePickerBaseProps & {
  value?: Date | null;
  onChange?: (value: Date | null) => void;
};

const DISPLAY_FORMAT = "PPP";
const TIME_VALUE_FORMAT = "HH:mm";

const isValidDate = (input: unknown): input is Date => {
  return input instanceof Date && !Number.isNaN(input.getTime());
};

export const ScheduleDateTimePicker = React.forwardRef<
  HTMLInputElement,
  ScheduleDateTimePickerProps
>(
  (
    {
      value,
      onChange,
      className,
      id: providedId,
      name: providedName,
      disabled,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const generatedId = React.useId();
    const id = providedId ?? generatedId;
    const name = providedName ?? id;
    const minSelectableDate = React.useMemo(
      () => startOfDay(addDays(startOfToday(), 1)),
      [],
    );

    const sanitizedValue = React.useMemo(() => {
      if (!isValidDate(value)) {
        return null;
      }

      if (!isBefore(value, minSelectableDate)) {
        return value;
      }

      const next = new Date(minSelectableDate);
      next.setHours(
        value.getHours(),
        value.getMinutes(),
        value.getSeconds(),
        0,
      );
      return next;
    }, [value, minSelectableDate]);

    React.useEffect(() => {
      if (!onChange) return;
      if (
        isValidDate(value) &&
        sanitizedValue &&
        value.getTime() !== sanitizedValue.getTime()
      ) {
        onChange(sanitizedValue);
      }
      if (!value && sanitizedValue) {
        onChange(sanitizedValue);
      }
    }, [value, sanitizedValue, onChange]);

    const timeValue = React.useMemo(() => {
      if (!sanitizedValue) return "";
      try {
        return format(sanitizedValue, TIME_VALUE_FORMAT);
      } catch {
        return "";
      }
    }, [sanitizedValue]);

    const displayValue = React.useMemo(() => {
      if (!sanitizedValue) return "Select date";
      try {
        return format(sanitizedValue, DISPLAY_FORMAT);
      } catch {
        return "Select date";
      }
    }, [sanitizedValue]);

    const handleDateSelect = (selected: Date | undefined) => {
      if (!selected) return;

      const selectedStart = startOfDay(selected);
      if (isBefore(selectedStart, minSelectableDate)) {
        return;
      }

      const next = new Date(selected);
      const source = sanitizedValue ?? minSelectableDate;
      if (source) {
        next.setHours(
          source.getHours(),
          source.getMinutes(),
          source.getSeconds(),
          0,
        );
      }

      onChange?.(next);
      setOpen(false);
    };

    const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      if (!raw) {
        onChange?.(null);
        return;
      }

      const [hours = 0, minutes = 0, seconds = 0] = raw
        .split(":")
        .map((value) => Number.parseInt(value, 10));
      const base = sanitizedValue
        ? new Date(sanitizedValue)
        : new Date(minSelectableDate);
      base.setHours(hours, minutes, seconds, 0);
      onChange?.(base);
    };

    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <input
          type="hidden"
          value={sanitizedValue ? sanitizedValue.toISOString() : ""}
          id={id}
          name={name}
          readOnly
          disabled={disabled}
          onBlur={onBlur}
          ref={ref}
          {...props}
        />
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor={`${id}-date`} className="px-1">
              Date
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  id={`${id}-date`}
                  className={cn(
                    "min-w-40 justify-between font-normal",
                    !value && "text-muted-foreground",
                  )}
                  disabled={disabled}
                >
                  <span className="truncate">{displayValue}</span>
                  <ChevronDownIcon className="size-4 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <BaseCalendar
                  mode="single"
                  selected={sanitizedValue ?? undefined}
                  captionLayout="dropdown"
                  onSelect={handleDateSelect}
                  disabled={
                    disabled
                      ? () => true
                      : [{ before: minSelectableDate }]
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor={`${id}-time`} className="px-1">
              Time
            </Label>
            <Input
              type="time"
              id={`${id}-time`}
              value={timeValue}
              onChange={handleTimeChange}
              onBlur={onBlur}
              disabled={disabled}
              className="appearance-none bg-background [&&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>
        </div>
      </div>
    );
  },
);

ScheduleDateTimePicker.displayName = "ScheduleDateTimePicker";
