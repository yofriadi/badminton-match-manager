import { createFileRoute, useRouter } from "@tanstack/react-router";
import { HallCard } from "@/app/halls/components/hall-card";
import { fetchJson } from "@/lib/http";
import { requireVerifiedRoute } from "../lib/guards";
import { getAvailableTenantHallsServer } from "../server/loaders";

export const Route = createFileRoute("/halls/create")({
  beforeLoad: requireVerifiedRoute,
  loader: async () => getAvailableTenantHallsServer(),
  component: CreateHallRoute,
});

function CreateHallRoute() {
  const halls = Route.useLoaderData();
  const router = useRouter();

  if (!halls || halls.length === 0) {
    return (
      <div className="space-y-4 p-4 text-center">
        <p className="text-gray-500">No new halls available to add.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {halls.map((hall) => (
        <HallCard
          key={hall.id}
          hall={hall}
          actionButton={{
            label: "Add this Hall",
            action: async (formData) => {
              const hallId = String(formData.get("hallId") || "");

              await fetchJson("/api/tenant/halls", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ hallId }),
              });
              await router.invalidate();
              router.navigate({ to: "/halls" });
            },
          }}
        />
      ))}
    </div>
  );
}
