import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "@tanstack/react-router";

type RouterLinkProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "children" | "href"
> & {
  children: ReactNode;
  href: string;
};

export default function RouterLink({
  children,
  href,
  ...props
}: RouterLinkProps) {
  const linkProps = props as ComponentPropsWithoutRef<"a">;

  return (
    <Link to={href as never} {...linkProps}>
      {children}
    </Link>
  );
}
