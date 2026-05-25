import type { ScheduleData } from "../lib/types";
import { ScheduleCard } from "./schedule-card";

interface ScheduleListProps {
  schedules: ScheduleData[];
}

export function ScheduleList({ schedules }: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg font-medium">No schedules found</p>
        <p className="text-sm mt-2">
          Create your first schedule to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {schedules.map((schedule) => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
}
