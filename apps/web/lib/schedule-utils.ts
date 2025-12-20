import { PlaySession } from "@/app/schedules/lib/types";

/**
 * Merge sessions that share the exact same start/end time (and optionally player level) 
 * into a single entry with multiple courts.
 */
export function mergeSessionsByTime(
  sessions: PlaySession[], 
  includeLevelInKey: boolean = false
): PlaySession[] {
  return Object.values(
    sessions.reduce<Record<string, PlaySession>>(
      (acc, session) => {
        const timeKey = `${session.timeStart}-${session.timeEnd}`;
        const key = includeLevelInKey 
          ? `${timeKey}-${session.playerLevel}`
          : timeKey;
        
        const existing = acc[key];

        if (existing) {
          const sessionsCourts = Array.isArray(session.court) ? session.court : [session.court];
          const existingCourts = Array.isArray(existing.court) ? existing.court : [existing.court];
          
          existing.court = [...existingCourts, ...sessionsCourts]
            .filter((v, i, a) => a.indexOf(v) === i) // unique
            .sort((a, b) => Number(a) - Number(b)); // numeric sort
        } else {
          // Clone to avoid mutating original session objects
          acc[key] = { 
            ...session,
            court: Array.isArray(session.court) ? [...session.court] : [session.court]
          };
        }

        return acc;
      },
      {},
    ),
  );
}
