export type AppScreen =
  | "stations"
  | "trains"
  | "schedule"
  | "settings"
  | "about"
  | "install";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}
