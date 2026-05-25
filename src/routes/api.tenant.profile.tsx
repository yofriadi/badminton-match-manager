import { createFileRoute } from "@tanstack/react-router";
import { updateTenantAction } from "@/lib/tenant-actions";
import { requireApiVerifiedSession } from "../server/api";

export const Route = createFileRoute("/api/tenant/profile")({
  server: {
    handlers: {
      PATCH: async ({ request }: { request: Request }) => {
        await requireApiVerifiedSession(request);
        const body = (await request.json()) as {
          name: string;
          description: string | null;
          contactInfo: Record<string, unknown>;
        };

        await updateTenantAction(request.headers, body);
        return Response.json({ success: true });
      },
    },
  },
});
