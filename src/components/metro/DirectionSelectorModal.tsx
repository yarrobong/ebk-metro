import { ArrowDown, ArrowUp } from "lucide-react";

import type { DirectionId, Station } from "../../domain/metro/metro.types";
import { getDirectionById } from "../../domain/metro";

export function DirectionSelectorModal({
  station,
  onSelect,
}: DirectionSelectorModalProps) {
  const directions = station.availableDirections.map((id) => getDirectionById(id)!);

  return (
    <div className="flex flex-col gap-3">
      {directions.map((dir) => {
        const Icon = dir.indexDelta === 1 ? ArrowDown : ArrowUp;
        return (
          <button
            key={dir.id}
            type="button"
            onClick={() => onSelect(dir.id)}
            className="focus-ring group flex items-center justify-between min-h-[64px] px-5 bg-surface border border-border rounded-xl hover:border-accent hover:bg-accent-muted transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-raised text-text-secondary group-hover:text-accent group-hover:bg-accent/10 transition">
                <Icon size={20} aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="text-xs text-text-secondary font-medium tracking-wide uppercase mb-0.5">
                  Направление
                </p>
                <p className="text-base font-semibold text-text-primary transition group-hover:text-text-primary">
                  {dir.name}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface DirectionSelectorModalProps {
  station: Station;
  onSelect: (directionId: DirectionId) => void;
}
