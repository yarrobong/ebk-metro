import type { ReactNode } from "react";
import { ChevronRight, MoonStar, Sunrise } from "lucide-react";

import type { DayScheduleTrain } from "../../domain/metro";
import { cn } from "../../lib/cn";

interface ScheduleSummaryCardProps {
  title?: string;
  contextLabel: string;
  firstTrain: DayScheduleTrain | null;
  lastTrain: DayScheduleTrain | null;
  totalCount?: number | undefined;
  onOpen?: () => void;
  actionLabel?: string;
  className?: string;
  accessibleSummary?: string;
}

export function ScheduleSummaryCard({
  title = "Первый и последний поезд",
  contextLabel,
  firstTrain,
  lastTrain,
  totalCount,
  onOpen,
  actionLabel = "Все поезда",
  className,
  accessibleSummary,
}: ScheduleSummaryCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{contextLabel}</p>
        </div>

        {onOpen && (
          <div className="flex items-center gap-1 text-sm font-medium text-accent">
            <span>{actionLabel}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SummaryCell
          icon={<Sunrise size={18} aria-hidden="true" />}
          label="Первый"
          time={firstTrain?.displayTime ?? "—"}
        />
        <SummaryCell
          icon={<MoonStar size={18} aria-hidden="true" />}
          label="Последний"
          time={lastTrain?.displayTime ?? "—"}
          note={lastTrain?.isAfterMidnight ? "после полуночи" : undefined}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
        {totalCount !== undefined ? (
          <p className="text-text-secondary">
            Всего отправлений:{" "}
            <span className="tabular-nums text-text-primary">{totalCount}</span>
          </p>
        ) : (
          <span className="text-text-secondary">{actionLabel}</span>
        )}

        {onOpen && <span className="font-medium text-accent">{actionLabel}</span>}
      </div>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "focus-ring w-full rounded-card border border-border-light bg-surface p-5 text-left shadow-card transition hover:bg-surface-hover active:scale-[0.995]",
          className,
        )}
        aria-label={accessibleSummary ?? title}
      >
        {content}
      </button>
    );
  }

  return (
    <section
      className={cn(
        "w-full rounded-card border border-border-light bg-surface p-5 text-left shadow-card",
        className,
      )}
      aria-label={accessibleSummary}
    >
      {content}
    </section>
  );
}

interface SummaryCellProps {
  icon: ReactNode;
  label: string;
  time: string;
  note?: string | undefined;
}

function SummaryCell({ icon, label, time, note }: SummaryCellProps) {
  return (
    <div className="rounded-2xl bg-surface-raised px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="text-accent">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-text-primary">{time}</p>
      {note && <p className="mt-1 text-sm text-text-secondary">{note}</p>}
    </div>
  );
}
