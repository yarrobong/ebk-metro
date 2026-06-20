import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
}: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "sheet-title" : undefined}
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 transition-opacity backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[520px] mx-auto bg-surface-raised rounded-t-[32px] overflow-hidden shadow-2xl safe-area-bottom pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-full duration-300">
        <div className="flex items-center justify-center pt-3 pb-2 opacity-40">
          <div className="w-12 h-1.5 rounded-full bg-white" />
        </div>

        <div className="px-6 pb-8 pt-2">
          <div className="flex items-start justify-between mb-6">
            <div>
              {title && (
                <h2 id="sheet-title" className="text-xl font-bold text-text-primary">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-text-secondary">{description}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="focus-ring p-2 -mr-2 text-text-secondary hover:text-text-primary rounded-full transition"
              aria-label="Закрыть"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
