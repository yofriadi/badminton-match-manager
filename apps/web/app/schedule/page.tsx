"use client";

import { MobileNavigation } from "@/components/ui/mobile-navigation";
import { Plays } from "./components/plays";
import { CtaButton } from "./components/cta-button";
import { schedules } from "./lib/data";

export default function Schedule() {
  return (
    <div className="min-h-screen bg-white flex flex-col space-y-4 py-4">
      {schedules.map((schedule, i) => (
        <Plays key={i} schedule={schedule} />
      ))}
      <CtaButton />
      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
