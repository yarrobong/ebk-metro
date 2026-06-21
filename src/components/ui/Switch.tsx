import { cn } from "../../lib/cn";

interface SwitchProps {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, label, onCheckedChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        onCheckedChange(!checked);
      }}
      className={cn(
        "focus-ring relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition",
        checked ? "bg-accent" : "bg-surface-hover",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-6 rounded-full bg-text-inverse shadow-md transition-transform",
          checked ? "translate-x-7" : "translate-x-1",
        )}
      />
    </button>
  );
}
