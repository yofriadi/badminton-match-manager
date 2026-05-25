import { createFileRoute } from "@tanstack/react-router";
import { getTenantPlayersAction } from "@/app/halls/lib/actions";
import { requireApiVerifiedSession } from "../server/api";

export const Route = createFileRoute("/api/tenant/players")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        await requireApiVerifiedSession(request);
        const url = new URL(request.url);
        const excludeHallId = url.searchParams.get("excludeHallId") || undefined;
        const players = await getTenantPlayersAction(
          request.headers,
          excludeHallId,
        );

        return Response.json(players);
      },
    },
  },
});
