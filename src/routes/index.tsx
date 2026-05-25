import { createFileRoute } from "@tanstack/react-router";
import { CourtPlaying } from "@/components/ui/court-playing";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  return (
    <div className="min-h-screen bg-white">
      <CourtPlaying />
    </div>
  );
}
