import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";
import { ScheduleCard } from "@/app/schedules/components/schedule-card";
import { ScheduleData } from "@/app/schedules/lib/types";

interface ScheduleCarouselProps {
  schedules: ScheduleData[];
}

export function ScheduleCarousel({ schedules }: ScheduleCarouselProps) {
  if (schedules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-wide text-gray-400 mx-4">
        Upcoming Schedules
      </p>
      <Carousel>
        <CarouselContent>
          {schedules.map((schedule, index) => (
            <CarouselItem key={`${schedule.hallId}-${schedule.date}-${index}`}>
              <ScheduleCard
                schedule={schedule}
                detailHref={`/schedules/${schedule.id}`}
                className="ml-4"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
