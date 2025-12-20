import { Badge } from "@workspace/ui/components/badge";

interface ScheduleDetailHeaderProps {
  hallName: string;
  hallAddress: string;
}

export function ScheduleDetailHeader({
  hallName,
  hallAddress,
}: ScheduleDetailHeaderProps) {
  return (
    <div className="mx-4 mt-6 mb-4 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{hallName}</h1>
        <p className="text-sm text-gray-500">{hallAddress}</p>
      </div>
    </div>
  );
}

