import { ArrowLeft, Share } from "lucide-react";

import { useAppStore } from "../app/store";
import { Card } from "../components/ui/Card";
import { IconButton } from "../components/ui/IconButton";
import { PageHeader } from "../components/ui/PageHeader";

const installSteps = [
  "Откройте приложение в Safari.",
  "Нажмите кнопку «Поделиться».",
  "Выберите «На экран Домой».",
  "Нажмите «Добавить».",
];

export function InstallPage() {
  const setScreen = useAppStore((state) => state.setScreen);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Установка"
        description="Как добавить приложение на экран iPhone."
        action={
          <IconButton
            label="Вернуться в настройки"
            onClick={() => {
              setScreen("settings");
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
        }
      />

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-accent-muted text-accent">
            <Share size={22} aria-hidden="true" />
          </div>

          <p className="font-semibold">Установка через Safari</p>
        </div>

        <ol className="mt-6 space-y-5">
          {installSteps.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-sm font-bold text-accent">
                {index + 1}
              </span>

              <p className="pt-1 leading-6 text-text-secondary">{step}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
