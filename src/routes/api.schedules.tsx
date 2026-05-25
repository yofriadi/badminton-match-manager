import { createFileRoute } from "@tanstack/react-router";
import { createSchedule } from "@/app/schedules/lib/actions";
import { requireApiVerifiedSession } from "../server/api";

export const Route = createFileRoute("/api/schedules")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        await requireApiVerifiedSession(request);
        const body = (await request.json()) as Parameters<typeof createSchedule>[1];
        const schedule = await createSchedule(request.headers, body);
        return Response.json(schedule);
      },
    },
  },
});
