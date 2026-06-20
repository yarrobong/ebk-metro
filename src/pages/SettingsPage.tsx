import { ChevronRight, CircleHelp, Info, Share2 } from "lucide-react";

import { useAppStore } from "../app/store";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { Switch } from "../components/ui/Switch";

export function SettingsPage() {
  const showSeconds = useAppStore((state) => state.showSeconds);

  const setShowSeconds = useAppStore((state) => state.setShowSeconds);

  const setScreen = useAppStore((state) => state.setScreen);

  return (
    <div className="space-y-6">
      <PageHeader title="Настройки" description="Основные параметры приложения." />

      <Card className="p-0">
        <div className="flex min-h-16 items-center justify-between gap-4 px-5">
          <div>
            <p className="font-medium">Показывать секунды</p>
            <p className="mt-1 text-sm text-text-secondary">
              Например, 03:42 вместо 4 минут
            </p>
          </div>

          <Switch
            checked={showSeconds}
            label="Показывать секунды"
            onCheckedChange={setShowSeconds}
          />
        </div>
      </Card>

      <Card className="divide-y divide-border p-0">
        <button
          type="button"
          onClick={() => {
            setScreen("install");
          }}
          className="focus-ring flex min-h-16 w-full items-center gap-3 px-5 text-left transition hover:bg-white/[0.03]"
        >
          <CircleHelp size={21} className="text-text-secondary" aria-hidden="true" />
          <span className="flex-1">Как установить</span>
          <ChevronRight size={20} className="text-text-disabled" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => {
            setScreen("about");
          }}
          className="focus-ring flex min-h-16 w-full items-center gap-3 px-5 text-left transition hover:bg-white/[0.03]"
        >
          <Info size={21} className="text-text-secondary" aria-hidden="true" />
          <span className="flex-1">О приложении</span>
          <ChevronRight size={20} className="text-text-disabled" aria-hidden="true" />
        </button>

        <button
          type="button"
          disabled
          className="flex min-h-16 w-full items-center gap-3 px-5 text-left opacity-50"
        >
          <Share2 size={21} className="text-text-secondary" aria-hidden="true" />
          <span className="flex-1">Поделиться приложением</span>
        </button>
      </Card>
    </div>
  );
}
