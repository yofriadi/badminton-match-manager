import { Badge } from "@workspace/ui/components/badge";

interface ScheduleDetailsProps {
  date: string;
  time: string;
  price: string;
  amenities: string[];
}

export function ScheduleDetails({
  date,
  time,
  price,
  amenities,
}: ScheduleDetailsProps) {
  return (
    <div className="mx-4 mt-6 mb-6 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
          Date
        </p>
        <p className="text-sm font-medium text-gray-900">{date}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
          Time
        </p>
        <p className="text-sm font-medium text-gray-900">{time}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400 pb-1">
          Price
        </p>
        <p className="text-sm font-medium text-gray-900">
          {price} <span className="text-xs text-gray-400">/ person</span>
        </p>
      </div>
      <div>
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
