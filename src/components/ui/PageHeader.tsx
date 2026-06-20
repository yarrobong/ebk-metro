import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">{title}</h1>

        {description !== undefined && (
          <p className="mt-2 max-w-md text-base leading-6 text-text-secondary">
            {description}
          </p>
        )}
      </div>

      {action}
    </header>
  );
}
