import { Badge } from "@workspace/ui/components/badge";

interface HallAmenitiesProps {
  amenities: string[];
}

export function HallAmenities({ amenities }: HallAmenitiesProps) {
  if (amenities.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-6">
      <div className="mx-4">
        <p className="text-xs uppercase tracking-wide text-gray-400 pb-2">
          Amenities
        </p>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {amenities.map((amenity) => (
              <Badge
                key={amenity}
                variant="secondary"
                className="text-xs font-normal whitespace-nowrap"
              >
                {amenity}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
