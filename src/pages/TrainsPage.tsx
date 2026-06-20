import { Clock3, MapPin, ArrowRightLeft, AlertTriangle } from "lucide-react";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { useAppStore } from "../app/store";
import { getStationById, getDirectionById, getNextStation } from "../domain/metro";
import { cn } from "../lib/cn";
import { useLiveMetroTime } from "../app/hooks/useLiveMetroTime";
import {
  getDayTypeForDate,
  getScheduleFor,
  getUpcomingTrains,
} from "../domain/metro/schedule.service";
import { formatTimer, formatRelativeTime } from "../domain/time";
import { metadata } from "../data/metadata";

function formatDateRussian(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function TrainsPage() {
  const {
    selectedStationId,
    selectedDirectionId,
    setScreen,
    selectDirection,
    showSeconds,
  } = useAppStore();

  const metroTime = useLiveMetroTime();

  if (!selectedStationId || !selectedDirectionId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Следующий поезд"
          description="Сначала необходимо выбрать текущую станцию."
        />

        <Card className="text-center">
          <Clock3 size={44} className="mx-auto text-accent" aria-hidden="true" />

          <p className="mt-4 text-lg font-semibold">Станция не выбрана</p>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            После выбора станции здесь появятся таймер и следующие поезда.
          </p>

          <Button
            fullWidth
            className="mt-6"
            onClick={() => {
              setScreen("stations");
            }}
          >
            Выбрать станцию
          </Button>
        </Card>
      </div>
    );
  }

  const station = getStationById(selectedStationId);
  const nextStation = getNextStation(selectedStationId, selectedDirectionId);

  const dayType = getDayTypeForDate(metroTime.dateString, metroTime.isWeekend);
  const schedule = getScheduleFor(selectedStationId, selectedDirectionId, dayType);
  const upcoming = getUpcomingTrains(schedule || [], metroTime);

  return (
    <div className="space-y-6 pb-8">
      {/* Current Station Header */}
      <div className="flex items-center justify-between bg-surface-raised p-4 rounded-2xl">
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Текущая станция
          </p>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-accent" />
            <h2 className="text-lg font-bold text-text-primary">{station?.name}</h2>
          </div>
        </div>
        <button
          onClick={() => setScreen("stations")}
          className="focus-ring text-sm font-medium text-accent hover:text-accent-hover transition px-3 py-1.5 bg-accent/10 rounded-lg"
        >
          Изменить
        </button>
      </div>

      {/* Direction Toggle */}
      {station && station.availableDirections.length > 1 && (
        <div className="bg-surface-raised p-1.5 rounded-xl flex gap-1 relative overflow-hidden">
          {station.availableDirections.map((dirId) => {
            const dir = getDirectionById(dirId);
            const isActive = dirId === selectedDirectionId;
            return (
              <button
                key={dirId}
                onClick={() => selectDirection(dirId)}
                className={cn(
                  "focus-ring relative flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                  isActive
                    ? "text-white bg-surface shadow-sm"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {dir?.shortName || dir?.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Single direction info (if terminus) */}
      {station && station.availableDirections.length === 1 && (
        <div className="bg-surface-raised p-4 rounded-xl flex items-center justify-center">
          <p className="text-sm font-medium text-text-secondary text-center">
            Направление:{" "}
            <span className="text-text-primary">
              {getDirectionById(selectedDirectionId)?.name}
            </span>
          </p>
        </div>
      )}

      {/* Next Station Info */}
      {nextStation && (
        <div className="flex items-center gap-3 px-2">
          <ArrowRightLeft size={16} className="text-text-disabled" />
          <p className="text-sm text-text-secondary">
            Следующая станция:{" "}
            <span className="font-medium text-text-primary">{nextStation.name}</span>
          </p>
        </div>
      )}
      {!nextStation && (
        <div className="flex items-center gap-3 px-2">
          <ArrowRightLeft size={16} className="text-error" />
          <p className="text-sm text-error">Не удалось определить следующую станцию.</p>
        </div>
      )}

      {/* Timer Card */}
      {upcoming.status === "error" || upcoming.status === "not_found" ? (
        <Card className="text-center py-10">
          <AlertTriangle size={36} className="mx-auto text-warning mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Нет данных</h3>
          <p className="text-sm text-text-secondary px-4">
            {upcoming.status === "error"
              ? "Расписание для выбранного направления не найдено."
              : "Поезда на текущее время не найдены."}
          </p>
        </Card>
      ) : upcoming.nearest ? (
        <Card
          className={cn(
            "text-center py-8 relative overflow-hidden transition-colors duration-500",
            upcoming.nearest.status === "approaching" &&
              "border-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]",
            upcoming.nearest.status === "arriving" && "bg-accent/10 border-accent",
          )}
        >
          <p className="text-sm font-medium text-text-secondary mb-4 uppercase tracking-wider">
            Следующий поезд
          </p>

          <div className="tabular-nums text-6xl sm:text-7xl font-bold tracking-tight mb-4 text-text-primary">
            {upcoming.nearest.status === "arriving" ? (
              <span className="text-5xl sm:text-6xl text-accent animate-pulse">
                Поезд прибывает
              </span>
            ) : upcoming.nearest.status === "approaching" && !showSeconds ? (
              <span className="text-5xl sm:text-6xl text-accent">Меньше минуты</span>
            ) : (
              formatTimer(upcoming.nearest.secondsLeft, showSeconds)
            )}
          </div>

          <p
            className={cn(
              "text-lg font-medium",
              upcoming.nearest.status === "approaching" && "text-accent animate-pulse",
              upcoming.nearest.status === "arriving" && "text-accent",
            )}
          >
            {upcoming.nearest.status === "arriving"
              ? "По расписанию"
              : upcoming.nearest.status === "approaching"
                ? "Поезд приближается"
                : `Прибытие в ${upcoming.nearest.displayTime}`}
          </p>

          {upcoming.nearest.isLast && (
            <p className="mt-2 text-sm font-medium text-warning bg-warning/10 inline-block px-3 py-1 rounded-full">
              Последний поезд
            </p>
          )}
        </Card>
      ) : null}

      {/* Next Trains List */}
      {upcoming.next.length > 0 && (
        <div className="bg-surface-raised rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3 px-2">
            Следующие поезда
          </h3>
          <ul className="space-y-1">
            {upcoming.next.map((train) => (
              <li
                key={train.scheduleTime}
                className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium tabular-nums text-text-primary">
                    {train.displayTime}
                  </span>
                  {train.isLast && (
                    <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded">
                      последний
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-text-secondary tabular-nums">
                  через {formatRelativeTime(train.secondsLeft, showSeconds)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center space-y-2 mt-8 opacity-60">
        <p className="text-xs font-medium text-text-primary bg-surface-raised inline-block px-3 py-1.5 rounded-lg mb-2">
          {dayType === "weekend" ? "Выходной день" : "Рабочий день"}
        </p>
        <p className="text-xs text-text-secondary">
          Расписание обновлено {formatDateRussian(metadata.checkedAt)}
        </p>
        <p className="text-[11px] leading-relaxed text-text-secondary max-w-xs mx-auto">
          Время рассчитано по расписанию. Фактическое движение поездов может отличаться.
        </p>
      </div>
    </div>
  );
}
