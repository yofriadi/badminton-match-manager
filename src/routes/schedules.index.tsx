import { createFileRoute } from "@tanstack/react-router";
import { AppPageLayout } from "@/components/app-page-layout";
import { ScheduleList } from "@/app/schedules/components/schedule-list";
import { requireVerifiedRoute } from "../lib/guards";
import { getSchedulesServer } from "../server/loaders";

export const Route = createFileRoute("/schedules/")({
  beforeLoad: requireVerifiedRoute,
  loader: async () => getSchedulesServer(),
  component: SchedulesRoute,
});

function SchedulesRoute() {
  const schedules = Route.useLoaderData();

  return (
    <AppPageLayout
      buttonLink="/schedules/create"
      buttonText="Create Schedule"
    >
      <ScheduleList schedules={schedules} />
    </AppPageLayout>
  );
}
