import { createFileRoute } from "@tanstack/react-router";
import { requireVerifiedRoute } from "../lib/guards";
import { ScheduleFormContainer } from "@/app/schedules/create/components/schedule-form-container";

export const Route = createFileRoute("/schedules/create")({
  beforeLoad: requireVerifiedRoute,
  component: CreateScheduleRoute,
});

function CreateScheduleRoute() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <ScheduleFormContainer />
    </div>
  );
}
