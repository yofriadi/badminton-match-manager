"use client";

import { useEffect, useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import type { HallSelectorProps } from "../../types";
import { fetchJson } from "@/lib/http";

export function HallSelector({ value, onChange, onError }: HallSelectorProps) {
  const [hallOptions, setHallOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [isLoadingHalls, setIsLoadingHalls] = useState(true);

  useEffect(() => {
    const loadHalls = async () => {
      try {
        const halls = await fetchJson<Array<{ id: string; name: string }>>(
          "/api/tenant/halls",
        );
        const options = halls.map((hall) => ({
          label: hall.name,
          value: hall.id,
        }));
        setHallOptions(options);
      } catch (error) {
        console.error("Failed to load halls:", error);
        const errorMessage = "Failed to load halls";
        onError?.(errorMessage);
        toast.error(errorMessage, {
          description:
            "Could not fetch available halls. Please refresh the page.",
        });
      } finally {
        setIsLoadingHalls(false);
      }
    };

    loadHalls();
  }, [onError]);

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
