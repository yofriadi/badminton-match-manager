
import { CourtPlaying } from "@/components/ui/court-playing";
import { getCourtSessions } from "./actions/get-courts";

export default async function Home() {
  const courts = await getCourtSessions();

  return (
    <div className="min-h-screen bg-white">
      <CourtPlaying courts={courts} />
    </div>
  );
}
