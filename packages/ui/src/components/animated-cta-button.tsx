"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@workspace/ui/lib/utils";

interface AnimatedCtaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  width?: string;
  height?: string;
  asChild?: boolean;
}

const AnimatedCtaContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "relative z-10 text-[var(--color-primary-foreground)] flex items-center justify-center label",
        className
      )}
    >
      {children}
    </span>
  );
};

const AnimatedCtaButton = ({
  children,
  width = "600px",
  height = "100px",
  className,
  disabled = false,
  asChild = false,
  type = "button",
  ...props
}: AnimatedCtaButtonProps) => {
  const Comp = asChild ? Slot : "button";

  const commonGradientStyles = cn(
    "relative rounded-[50px] cursor-pointer overflow-hidden",
    "after:content-[''] after:block after:absolute after:bg-[var(--color-primary)]",
    "after:inset-[5px] after:rounded-[45px] after:z-[1]",
    "after:transition-opacity after:duration-300 after:ease-linear",
    "flex items-center justify-center",
    disabled && "opacity-50 cursor-not-allowed",
    "rotatingGradient",
    className
  );

  return (
    <div className="text-center">
      <Comp
        type={type}
        className={commonGradientStyles}
        style={
          {
            "--r": "0deg",
            minWidth: width,
            height: height,
          } as React.CSSProperties
        }
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <AnimatedCtaContent>{children}</AnimatedCtaContent>
        )}
      </Comp>
    </div>
  );
};

export { AnimatedCtaButton, AnimatedCtaContent };
export default AnimatedCtaButton;
