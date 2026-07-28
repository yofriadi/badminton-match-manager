"use client";

import { useEffect, useState } from "react";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
  MultiSelectorInput,
} from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { CourtSelectorProps } from "../../types";
import { fetchJson } from "@/lib/http";

interface Court {
  id: string;
  number: number;
  // Database may return boolean or 0/1. Treat anything truthy as enabled.
  isEnabled: number | boolean;
}

export function CourtSelector({
  hallId,
  values,
  onValuesChange,
  disabled,
  onError,
  options: preloadedOptions,
  isLoading: isPreloading,
}: CourtSelectorProps) {
  const [courtOptions, setCourtOptions] = useState<
    Array<{ label: string; value: string; number: number }>
  >([]);
  const [isLoadingCourts, setIsLoadingCourts] = useState(false);

  // Use pre-loaded options when provided by a parent; otherwise use independently fetched data.
  const effectiveOptions = preloadedOptions ?? courtOptions;
  const effectiveLoading = isPreloading ?? isLoadingCourts;

  useEffect(() => {
    // Skip independent fetch when pre-loaded options are provided by the parent.
    if (preloadedOptions !== undefined) {
      return;
    }

    const loadCourts = async () => {
      if (!hallId) {
        setCourtOptions([]);
        return;
      }

      setIsLoadingCourts(true);
      try {
        const courts = await fetchJson<Court[]>(`/api/halls/${hallId}/courts`);
        const options = courts
          .filter((court: Court) => Boolean(court.isEnabled))
          .map((court: Court) => ({
            label: `Court ${court.number}`,
            value: court.id,
            number: court.number,
          }));
        setCourtOptions(options);
      } catch (error) {
        console.error("Failed to load courts:", error);
        const errorMessage = "Failed to load courts";
        onError?.(errorMessage);
        toast.error(errorMessage, {
          description: "Could not fetch courts for the selected hall.",
        });
      } finally {
        setIsLoadingCourts(false);
      }
    };

    loadCourts();
  }, [hallId, onError, preloadedOptions]);

  const getCourtNumbers = (courtIds: string[]) => {
    return courtIds.map((id) => {
      const court = effectiveOptions.find((option) => option.value === id);
      return court ? `Court ${court.number}` : id;
    });
  };

  return (
    <MultiSelector
      values={values}
      onValuesChange={onValuesChange}
      loop
      disabled={disabled}
    >
      <MultiSelectorTrigger>
        {values.length > 0 &&
          getCourtNumbers(values).map((name, index) => (
            <Badge key={index}>{name}</Badge>
          ))}
        <MultiSelectorInput
          placeholder={
            disabled
              ? "Select a hall first"
              : !hallId
                ? "Select a hall first"
                : values.length === 0
                  ? effectiveLoading
                    ? "Loading courts..."
                    : effectiveOptions.length === 0
                      ? "No courts available"
                      : "Select courts"
                  : ""
          }
        />
      </MultiSelectorTrigger>
      <MultiSelectorContent>
        <MultiSelectorList>
          {effectiveOptions.map((option) => (
            <MultiSelectorItem key={option.value} value={option.value}>
              {option.label}
            </MultiSelectorItem>
          ))}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelector>
  );
}
