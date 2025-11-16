"use client";

import { useRouter } from "next/navigation";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import GradientButton from "@/components/ui/animated-cta-button";
import { HallBlueprint } from "./components/hall-blueprint";
import { halls } from "./lib/data";

export default function Hall() {
  const router = useRouter();

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
