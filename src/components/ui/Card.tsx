import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-card border border-border-light bg-surface backdrop-blur-md p-5 shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
