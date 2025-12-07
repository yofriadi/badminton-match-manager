"use client";

import { useRouter } from "next/navigation";
import AnimatedCtaButton from "@/components/ui/animated-cta-button";

const CtaButton = () => {
  const router = useRouter();

  return (
    <div className="flex w-full justify-center items-center my-16">
      <AnimatedCtaButton
        onClick={() => router.push("/schedules/create")}
        width="300px"
        height="60px"
        disabled={false}
      >
        Create Schedule
      </AnimatedCtaButton>
    </div>
  );
};

export { CtaButton };
