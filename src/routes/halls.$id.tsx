import { createFileRoute, notFound } from "@tanstack/react-router";
import { HallDetailContent } from "@/app/halls/[id]/components/hall-detail-content";
import { requireVerifiedRoute } from "../lib/guards";
import { getHallDetailServer } from "../server/loaders";

export const Route = createFileRoute("/halls/$id")({
  beforeLoad: requireVerifiedRoute,
  loader: async ({ params }) => getHallDetailServer({ data: params.id }),
  component: HallDetailRoute,
});

function HallDetailRoute() {
  const data = Route.useLoaderData();

  if (!data) {
    throw notFound();
  }

  return <HallDetailContent hall={data.hall} schedules={data.schedules} />;
}
