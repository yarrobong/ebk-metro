import type { Direction } from "../domain/metro/metro.types";

export const directions: Direction[] = [
  {
    id: "to-botanicheskaya",
    name: "В сторону Ботанической",
    shortName: "К Ботанической",
    terminus: "botanicheskaya",
    indexDelta: 1,
  },
  {
    id: "to-prospekt-kosmonavtov",
    name: "В сторону Проспекта Космонавтов",
    shortName: "К Пр. Космонавтов",
    terminus: "prospekt-kosmonavtov",
    indexDelta: -1,
  },
];
