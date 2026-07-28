import { createFileRoute } from "@tanstack/react-router";
import { updateScheduleConfigAction } from "@/app/schedules/lib/actions";
import type {
  ScheduleManualSubstitution,
  ScheduleRoundOverride,
} from "@/app/schedules/lib/types";
import type { MatchmakingOptions } from "@/app/schedules/lib/match-generator";
import { requireApiVerifiedSession } from "../server/api";

export const Route = createFileRoute("/api/schedules/$id/config")({
  server: {
    handlers: {
      PATCH: async ({
        request,
        params,
      }: {
        request: Request;
        params: { id: string };
      }) => {
        await requireApiVerifiedSession(request);
        const body = (await request.json()) as {
          numberOfSessions?: number;
          generatedMatches?: ScheduleRoundOverride[];
          manualSubstitutions?: ScheduleManualSubstitution[];
          matchmakingOptions?: MatchmakingOptions;
        };
        const result = await updateScheduleConfigAction(
          request.headers,
          params.id,
          body,
        );
        return Response.json(result);
      },
    },
  },
});
