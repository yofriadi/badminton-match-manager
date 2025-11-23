"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import GradientButton from "@/components/ui/animated-cta-button";
import { HallBlueprint } from "./components/hall-blueprint";
import { fetchHalls } from "./lib/fetch-halls";
import type { Hall } from "./lib/types";

export default function Hall() {
  const router = useRouter();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHalls = async () => {
      try {
        const hallsData = await fetchHalls();
        setHalls(hallsData);
      } catch (error) {
        console.error("Error loading halls:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHalls();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading halls...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {halls.map((hall) => (
        <HallBlueprint
          key={hall.id}
          hall={hall}
          detailHref={`/hall/${hall.id}`}
        />
      ))}
      <div className="flex w-full justify-center items-center my-16">
        <GradientButton
          onClick={() => router.push("/hall/create")}
          width="300px"
          height="60px"
          disabled={false}
        >
          Add Hall
        </GradientButton>
      </div>
      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
