import GradientButton from "@/components/ui/animated-cta-button";

const CtaButton = () => {
  return (
    <div className="flex w-full justify-center items-center my-16">
      <GradientButton
        onClick={() => console.log("clicked")}
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
