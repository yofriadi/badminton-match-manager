import { CourtLayout } from "../../../../components/court-layout";
import { Hall, Row, Court } from "@/app/halls/lib/types";

interface ScheduleHallBlueprintProps {
  hall: Hall;
  bookedCourts: string[];
}

export function ScheduleHallBlueprint({
  hall,
  bookedCourts,
}: ScheduleHallBlueprintProps) {
  return (
    <div className="mt-2 mx-4">
      <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
        Court
      </p>
      <CourtLayout hall={hall} renderCard={false} bookedCourts={bookedCourts} />
    </div>
  );
}
