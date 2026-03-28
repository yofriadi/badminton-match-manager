import {
  getAvailableHallsForCurrentTenant,
  addHallToTenantAction,
} from "../lib/actions";
import { HallCard } from "../components/hall-card";

// Disable static generation since this page fetches data from database
export const dynamic = "force-dynamic";

export default async function CreateDetailPage() {
  const halls = await getAvailableHallsForCurrentTenant();

  async function handleAddHall(formData: FormData) {
    "use server";
    const hallId = formData.get("hallId") as string;
    await addHallToTenantAction(hallId);
  }

  if (!halls || halls.length === 0) {
    return (
      <div className="p-4 text-center space-y-4">
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
            action: handleAddHall,
            label: "Add this Hall",
          }}
        />
      ))}
    </div>
  );
}
