import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/lib/db";
import { asc, eq, users } from "@/db";
import { requireApiAdminSession } from "../server/api";

export const Route = createFileRoute("/api/admin/users")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        await requireApiAdminSession(request);

        const db = getDb();
        const pending = await db
          .select()
          .from(users)
          .where(eq(users.emailVerified, false))
          .orderBy(asc(users.createdAt));

        return Response.json(pending);
      },
    },
  },
});
