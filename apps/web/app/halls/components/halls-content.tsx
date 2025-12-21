import { HallCard, type HallFromApi } from "../components/hall-card";

interface HallsContentProps {
  halls: HallFromApi[];
}

export function HallsContent({ halls }: HallsContentProps) {
  if (halls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg font-medium">No halls found</p>
        <p className="text-sm mt-2">Add your first hall to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {halls.map((hall) => (
        <HallCard
          key={hall.id}
          hall={hall}
          actionButton={{
            href: `/halls/${hall.id}`,
            label: "View detail",
          }}
        />
      ))}
    </div>
  );
}