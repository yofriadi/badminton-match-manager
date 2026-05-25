import { createFileRoute } from "@tanstack/react-router";
import {
  addHallToTenantAction,
  getHallsForCurrentTenant,
} from "@/app/halls/lib/actions";
import { requireApiVerifiedSession } from "../server/api";

export const Route = createFileRoute("/api/tenant/halls")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        await requireApiVerifiedSession(request);
        const halls = await getHallsForCurrentTenant(request.headers);
        return Response.json(halls);
      },
      POST: async ({ request }: { request: Request }) => {
        await requireApiVerifiedSession(request);
        const body = (await request.json()) as { hallId?: string };

        if (!body.hallId) {
          return Response.json({ error: "Missing hallId" }, { status: 400 });
        }

        const result = await addHallToTenantAction(request.headers, body.hallId);
        return Response.json(result);
      },
    },
  },
});
