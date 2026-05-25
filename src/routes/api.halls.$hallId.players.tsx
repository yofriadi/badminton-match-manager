import { createFileRoute } from "@tanstack/react-router";
import { registerPlayerToHallAction } from "@/app/halls/lib/actions";
import { requireApiVerifiedSession } from "../server/api";

export const Route = createFileRoute("/api/halls/$hallId/players")({
  server: {
    handlers: {
      POST: async ({
        request,
        params,
      }: {
        request: Request;
        params: { hallId: string };
      }) => {
        await requireApiVerifiedSession(request);
        const player = (await request.json()) as {
          playerId?: string;
          name?: string;
          gender?: string;
          skillLevel?: string;
        };

        const result = await registerPlayerToHallAction(
          request.headers,
          params.hallId,
          player,
        );

        return Response.json(result);
      },
    },
  },
});
