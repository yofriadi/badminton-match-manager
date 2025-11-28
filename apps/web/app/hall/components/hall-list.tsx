import { getHalls } from "../lib/api";
import { HallCard } from "./hall-card";

export async function HallList() {
  const halls = await getHalls();

  if (!halls || halls.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No halls found</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {halls.map((hall) => (
        <HallCard
          key={hall.id}
          hall={hall}
          actionButton={{
            href: `/hall/${hall.id}`,
            label: "View details",
          }}
        />
      ))}
    </div>
  );
}
