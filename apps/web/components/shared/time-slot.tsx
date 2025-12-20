import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface TimeSlotProps {
  startTime: string;
  endTime: string;
  courts: string[] | string;
  playerLevel?: string;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

export function TimeSlot({
  startTime,
  endTime,
  courts,
  playerLevel,
  className,
  variant = "default",
}: TimeSlotProps) {
  const courtArray = Array.isArray(courts) ? courts : [courts];

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>{startTime} - {endTime}</span>
        {courtArray.length > 0 && (
          <>
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Court {courtArray.join(", ")}</span>
          </>
        )}
        {playerLevel && (
          <Badge variant="secondary" className="text-xs">
            {playerLevel}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {startTime} - {endTime}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          Court {courtArray.join(", ")}
        </div>
        {playerLevel && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {playerLevel}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TimeSlotListProps {
  slots: Array<{
    startTime: string;
    endTime: string;
    courts: string[] | string;
    playerLevel?: string;
  }>;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

export function TimeSlotList({
  slots,
  className,
  variant = "default",
}: TimeSlotListProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No time slots scheduled
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {slots.map((slot, index) => (
        <TimeSlot
          key={index}
          startTime={slot.startTime}
          endTime={slot.endTime}
          courts={slot.courts}
          playerLevel={slot.playerLevel}
          variant={variant}
        />
      ))}
    </div>
  );
}