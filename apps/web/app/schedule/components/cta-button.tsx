"use client";

import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/animated-cta-button";

const CtaButton = () => {
  const router = useRouter();

  return (
    <div className="flex w-full justify-center items-center my-16">
      <GradientButton
        onClick={() => router.push("/schedule/create")}
        width="300px"
        height="60px"
        disabled={false}
      >
        Create Schedule
      </GradientButton>
    </div>
  );
};

export { CtaButton };
