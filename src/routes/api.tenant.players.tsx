import { createFileRoute } from "@tanstack/react-router";
import {
  exportTenantPlayersCsvAction,
  getTenantPlayersAction,
  importTenantPlayersCsvAction,
} from "@/app/halls/lib/actions";
import { requireApiVerifiedSession } from "../server/api";

const CSV_CONTENT_TYPE = "text/csv; charset=utf-8";

export const Route = createFileRoute("/api/tenant/players")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        await requireApiVerifiedSession(request);
        const url = new URL(request.url);

        if (url.searchParams.get("format") === "csv") {
          const csv = await exportTenantPlayersCsvAction(request.headers);

          return new Response(csv, {
            headers: {
              "content-type": CSV_CONTENT_TYPE,
              "content-disposition":
                'attachment; filename="tenant-players.csv"',
            },
          });
        }

        const excludeHallId =
          url.searchParams.get("excludeHallId") || undefined;
        const players = await getTenantPlayersAction(
          request.headers,
          excludeHallId,
        );

        return Response.json(players);
      },
      POST: async ({ request }: { request: Request }) => {
        await requireApiVerifiedSession(request);

        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File) || file.size === 0) {
          return Response.json(
            { error: "Please choose a CSV file to import." },
            { status: 400 },
          );
        }

        try {
          const result = await importTenantPlayersCsvAction(
            request.headers,
            await file.text(),
          );

          return Response.json(result);
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to import tenant players.",
            },
            { status: 400 },
          );
        }
      },
    },
  },
});
