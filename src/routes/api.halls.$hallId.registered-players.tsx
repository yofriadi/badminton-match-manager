import { createFileRoute } from "@tanstack/react-router";
import { getRegisteredPlayersForCurrentTenant } from "@/app/halls/lib/actions";
import { requireApiVerifiedSession } from "../server/api";

export const Route = createFileRoute("/api/halls/$hallId/registered-players")({
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
        const players = await getRegisteredPlayersForCurrentTenant(
          request.headers,
          params.hallId,
        );

        return Response.json(players);
      },
    },
  },
});
