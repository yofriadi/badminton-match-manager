"use client";

import { useEffect, useState } from "react";
import { Combobox } from "@workspace/ui/components/combobox";
import { getHallsForCurrentTenant } from "@/app/halls/lib/actions";
import { toast } from "sonner";
import type { HallSelectorProps } from "../../types";

export function HallSelector({ value, onChange, onError }: HallSelectorProps) {
  const [hallOptions, setHallOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoadingHalls, setIsLoadingHalls] = useState(true);

  useEffect(() => {
    const loadHalls = async () => {
      try {
        const halls = await getHallsForCurrentTenant();
        const options = halls.map((hall) => ({
          label: hall.name,
          value: hall.id,
        }));
        setHallOptions(options);
      } catch (error) {
        console.error("Failed to load halls:", error);
        const errorMessage = "Failed to load halls";
        onError?.(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingHalls(false);
      }
    };

    loadHalls();
  }, []);

  return (
    <Combobox
      options={hallOptions}
      value={value}
      onChange={onChange}
      placeholder={isLoadingHalls ? "Loading halls..." : "Select a hall"}
      searchPlaceholder={isLoadingHalls ? "Loading..." : "Search halls..."}
    />
  );
}