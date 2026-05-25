import { createFileRoute } from "@tanstack/react-router";
import { getCourtsForHall } from "@/app/halls/lib/actions";
import { requireApiVerifiedSession } from "../server/api";

export const Route = createFileRoute("/api/halls/$hallId/courts")({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request;
        params: { hallId: string };
      }) => {
        await requireApiVerifiedSession(request);
        const courts = await getCourtsForHall(params.hallId);
        return Response.json(courts);
      },
    },
  },
});
