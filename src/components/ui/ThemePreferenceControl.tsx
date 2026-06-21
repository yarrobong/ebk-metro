import { useRef, type KeyboardEvent } from "react";

import { cn } from "../../lib/cn";
import type { ThemePreference, ResolvedTheme } from "../../app/theme";

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  shortLabel: string;
}> = [
  { value: "system", label: "Автоматически", shortLabel: "Авто" },
  { value: "light", label: "Светлая", shortLabel: "Светлая" },
  { value: "dark", label: "Тёмная", shortLabel: "Тёмная" },
];

interface ThemePreferenceControlProps {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  onChange: (preference: ThemePreference) => void;
}

export function ThemePreferenceControl({
  preference,
  resolvedTheme,
  onChange,
}: ThemePreferenceControlProps) {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleArrowNavigation = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    event.preventDefault();

    const lastIndex = themeOptions.length - 1;
    let nextIndex = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = lastIndex;
    }

    const nextOption = themeOptions[nextIndex];
    if (!nextOption) {
      return;
    }

    optionRefs.current[nextIndex]?.focus();
    onChange(nextOption.value);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-text-primary">Тема</p>
          <p className="mt-1 text-sm text-text-secondary">
            {getDescription(preference, resolvedTheme)}
          </p>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="Тема приложения"
        className="grid grid-cols-3 gap-2"
      >
        {themeOptions.map((option, index) => {
          const isSelected = option.value === preference;

          return (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={option.label}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => {
                handleArrowNavigation(event, index);
              }}
              className={cn(
                "focus-ring flex min-h-11 items-center justify-center rounded-xl border px-3 py-3 text-center text-sm font-semibold transition",
                isSelected
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border bg-surface text-text-secondary hover:border-border-strong hover:bg-surface-hover hover:text-text-primary",
              )}
            >
              <span className="sm:hidden">{option.shortLabel}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getDescription(preference: ThemePreference, resolvedTheme: ResolvedTheme) {
  if (preference === "system") {
    return `Как на устройстве. Сейчас используется ${resolvedTheme === "dark" ? "тёмная" : "светлая"} тема.`;
  }

  if (preference === "light") {
    return "Всегда использовать светлую тему.";
  }

  return "Всегда использовать тёмную тему.";
}
