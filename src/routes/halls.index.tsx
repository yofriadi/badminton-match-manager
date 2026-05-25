import { createFileRoute } from "@tanstack/react-router";
import { AppPageLayout } from "@/components/app-page-layout";
import { HallsContent } from "@/app/halls/components/halls-content";
import { requireVerifiedRoute } from "../lib/guards";
import { getTenantHallsServer } from "../server/loaders";

export const Route = createFileRoute("/halls/")({
  beforeLoad: requireVerifiedRoute,
  loader: async () => getTenantHallsServer(),
  component: HallsRoute,
});

function HallsRoute() {
  const halls = Route.useLoaderData();

  return (
    <AppPageLayout buttonLink="/halls/create" buttonText="Add Hall">
      <HallsContent halls={halls ?? []} />
    </AppPageLayout>
  );
}
