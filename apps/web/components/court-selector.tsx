"use client";

import { useEffect, useState } from "react";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { getCourtsForHall } from "@/app/hall/lib/actions";
import { toast } from "sonner";

interface CourtSelectorProps {
  hallId: string;
  values: string[];
  onValuesChange: (values: string[]) => void;
}

interface Court {
  id: string;
  number: number;
  // Database may return boolean or 0/1. Treat anything truthy as enabled.
  isEnabled: number | boolean;
}

export function CourtSelector({ hallId, values, onValuesChange }: CourtSelectorProps) {
  const [courtOptions, setCourtOptions] = useState<Array<{ label: string; value: string; number: number }>>([]);
  const [isLoadingCourts, setIsLoadingCourts] = useState(false);

  useEffect(() => {
    const loadCourts = async () => {
      if (!hallId) {
        setCourtOptions([]);
        return;
      }

      setIsLoadingCourts(true);
      try {
        const courts = await getCourtsForHall(hallId);
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
        toast.error("Failed to load courts");
      } finally {
        setIsLoadingCourts(false);
      }
    };

    loadCourts();
  }, [hallId]);

  const getCourtNumbers = (courtIds: string[]) => {
    return courtIds.map(id => {
      const court = courtOptions.find(option => option.value === id);
      return court ? `Court ${court.number}` : id;
    });
  };

  return (
    <MultiSelector
      values={values}
      onValuesChange={onValuesChange}
      loop
    >
      <MultiSelectorTrigger>
        <div
          className="flex items-center gap-1 overflow-x-auto flex-nowrap max-w-full"
        >
          {values.length > 0 && getCourtNumbers(values).map((name, index) => (
            <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
              {name}
            </span>
          ))}
          <input
            type="text"
            placeholder={
              !hallId
                ? "Select a hall first"
                : values.length === 0
                  ? (isLoadingCourts ? "Loading courts..." : "Select courts")
                  : ""
            }
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
            disabled={!hallId || isLoadingCourts}
          />
        </div>
      </MultiSelectorTrigger>
      <MultiSelectorContent>
        <MultiSelectorList>
          {courtOptions.map((option) => (
            <MultiSelectorItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </MultiSelectorItem>
          ))}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelector>
  );
}
