import { MobileNavigation } from "@/components/ui/mobile-navigation";
import GradientButton from "@/components/ui/animated-cta-button";
import { HallList } from "./components/hall-list";
import Link from "next/link";

export default function Hall() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <HallList />
      <div className="flex w-full justify-center items-center my-16">
        <Link href="/hall/create">
          <GradientButton width="300px" height="60px" disabled={false}>
            Add Hall
          </GradientButton>
        </Link>
      </div>
      <div className="mt-auto sticky bottom-0 left-0 right-0 w-full px-4 pb-4 max-w-md mx-auto">
        <MobileNavigation />
      </div>
    </div>
  );
}
