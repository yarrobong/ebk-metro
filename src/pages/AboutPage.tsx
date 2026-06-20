import { ArrowLeft, TrainFront } from "lucide-react";

import { useAppStore } from "../app/store";
import { Card } from "../components/ui/Card";
import { IconButton } from "../components/ui/IconButton";
import { PageHeader } from "../components/ui/PageHeader";

export function AboutPage() {
  const setScreen = useAppStore((state) => state.setScreen);

  return (
    <div className="space-y-6">
      <PageHeader
        title="О приложении"
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

      <Card className="text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-accent">
          <TrainFront size={40} aria-hidden="true" />
        </div>

        <h2 className="mt-5 text-2xl font-bold">Метро Екатеринбурга</h2>

        <p className="mt-2 text-sm text-text-secondary">Версия 0.1.0</p>

        <p className="mt-6 leading-7 text-text-secondary">
          Приложение для быстрого просмотра времени до следующего поезда.
        </p>
      </Card>
    </div>
  );
}
