import { createFileRoute } from "@tanstack/react-router";
import { registerAndAddPlayerToScheduleAction } from "@/app/schedules/lib/actions";
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
        const body = (await request.json()) as {
          playerId?: string;
          playerIds?: string[];
          name?: string;
          gender?: string;
          skillLevel?: string;
        };
        const result = await registerAndAddPlayerToScheduleAction(
          request.headers,
          params.id,
          body,
        );

        return Response.json(result);
      },
    },
  },
});
