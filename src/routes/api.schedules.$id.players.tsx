import { createFileRoute } from "@tanstack/react-router";
import { addPlayersToSchedule } from "@/app/schedules/lib/actions";
import { requireApiVerifiedSession } from "../server/api";

export const Route = createFileRoute("/api/schedules/$id/players")({
  server: {
    handlers: {
      POST: async ({
        request,
        params,
      }: {
        request: Request;
        params: { id: string };
      }) => {
        await requireApiVerifiedSession(request);
        const body = (await request.json()) as { playerIds?: string[] };
        await addPlayersToSchedule(
          request.headers,
          params.id,
          body.playerIds ?? [],
        );

        return Response.json({ success: true });
      },
    },
  },
});
