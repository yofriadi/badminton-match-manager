import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/lib/db";
import { eq, users } from "@/db";
import { requireApiAdminSession } from "../server/api";

export const Route = createFileRoute("/api/admin/users/$id/confirm")({
  server: {
    handlers: {
      POST: async ({
        request,
        params,
      }: {
        request: Request;
        params: { id: string };
      }) => {
        await requireApiAdminSession(request);
        const db = getDb();

        const updated = await db
          .update(users)
          .set({ emailVerified: true, updatedAt: new Date() })
          .where(eq(users.id, params.id))
          .returning();

        if (updated.length === 0) {
          return Response.json({ error: "User not found" }, { status: 404 });
        }

        return Response.json(updated[0]);
      },
    },
  },
});
