import Link from "next/link";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ScrollToBottom } from "@workspace/ui/components/scroll-to-bottom";
import AnimatedCtaButton, {
  AnimatedCtaContent,
} from "@workspace/ui/components/animated-cta-button";

interface SchedulePageLayoutProps {
  children: React.ReactNode;
  showCreateButton?: boolean;
}

export function SchedulePageLayout({
  children,
  showCreateButton = true,
}: SchedulePageLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 m-4">{children}</div>

      {showCreateButton && (
        <div className="flex w-full justify-center items-center my-16">
          <AnimatedCtaButton
            asChild
            width="300px"
            height="60px"
            disabled={false}
          >
            <Link href="/schedules/create">
              <AnimatedCtaContent>Create Schedule</AnimatedCtaContent>
            </Link>
          </AnimatedCtaButton>
        </div>
      )}

      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto z-20">
        <MobileNavigation />
      </div>

      <ScrollToBottom />
    </div>
  );
}

