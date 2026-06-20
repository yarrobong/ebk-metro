import { useState, useEffect } from "react";
import { getCurrentMetroTime } from "../../domain/time";
import type { MetroTime } from "../../domain/time";

export function useLiveMetroTime(): MetroTime {
  const [time, setTime] = useState<MetroTime>(getCurrentMetroTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentMetroTime());
    }, 1000);

    const handleFocus = () => setTime(getCurrentMetroTime());
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) handleFocus();
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  return time;
}
