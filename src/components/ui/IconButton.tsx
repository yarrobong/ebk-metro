import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
}

export function IconButton({
  children,
  className,
  label,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "focus-ring inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:bg-surface-hover hover:text-text-primary active:scale-95",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
