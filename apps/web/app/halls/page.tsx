import { MobileNavigation } from "@/components/mobile-navigation";
import AnimatedCtaButton, {
  AnimatedCtaContent,
} from "@workspace/ui/components/animated-cta-button";
import { getHalls } from "@/lib/halls";
import { HallCard } from "./components/hall-card";
import Link from "next/link";
import { ScrollToBottom } from "@workspace/ui/components/scroll-to-bottom";

// Disable static generation since this page fetches data from database
export const dynamic = "force-dynamic";

export default async function Hall() {
  const halls = await getHalls();

  if (!halls || halls.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No halls found</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="space-y-6 m-4">
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
      <div className="flex w-full justify-center items-center my-16">
        <AnimatedCtaButton width="300px" height="60px" disabled={false} asChild>
          <Link href="/halls/create">
            <AnimatedCtaContent>Add Hall</AnimatedCtaContent>
          </Link>
        </AnimatedCtaButton>
      </div>
      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto z-20">
        <MobileNavigation />
      </div>
      <ScrollToBottom />
    </div>
  );
}
