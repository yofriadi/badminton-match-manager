"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

interface AnimatedCtaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  width?: string;
  height?: string;
}

const AnimatedCtaButton = ({
  children,
  width = "600px",
  height = "100px",
  className = "",
  disabled = false,
  type = "button",
  ...props
}: AnimatedCtaButtonProps) => {
  const commonGradientStyles = `
    relative rounded-[50px] cursor-pointer overflow-hidden
    after:content-[""] after:block after:absolute after:bg-[var(--color-primary)]
    after:inset-[5px] after:rounded-[45px] after:z-[1]
    after:transition-opacity after:duration-300 after:ease-linear
    flex items-center justify-center
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
  `;

  return (
    <div className="text-center">
      <button
        type={type}
        className={`
          ${commonGradientStyles}
          rotatingGradient
          ${className}
        `}
        style={
          {
            "--r": "0deg",
            minWidth: width,
            height: height,
          } as CSSProperties
        }
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      >
        <span className="relative z-10 text-[var(--color-primary-foreground)] flex items-center justify-center label">
          {children}
        </span>
      </button>
    </div>
  );
};

export default AnimatedCtaButton;
