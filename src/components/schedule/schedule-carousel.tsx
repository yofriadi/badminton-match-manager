import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ScheduleCard } from "@/app/schedules/components/schedule-card";
import type { ScheduleData } from "@/app/schedules/lib/types";

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
        <CarouselContent className="py-1 px-4">
          {schedules.map((schedule, index) => (
            <CarouselItem
              key={`${schedule.hallId}-${schedule.date}-${index}`}
              className={
                schedules.length > 1
                  ? "basis-[82%] sm:basis-[75%] md:basis-[480px]"
                  : "basis-full"
              }
            >
              <ScheduleCard
                schedule={schedule}
                detailHref={`/schedules/${schedule.id}`}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
