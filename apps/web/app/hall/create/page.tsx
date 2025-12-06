import { getHalls } from "../lib/api";
import { HallCard } from "../components/hall-card";

// Disable static generation since this page fetches data from database
export const dynamic = "force-dynamic";

export default async function CreateDetailPage() {
  const halls = await getHalls();

  if (!halls || halls.length === 0) {
    return <div>No halls found</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {halls.map((hall) => (
        <HallCard
          key={hall.id}
          hall={hall}
          actionButton={{ href: `/`, label: "Add this Hall" }}
        />
      ))}
    </div>
  );
}
