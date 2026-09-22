import type { ReactNode } from "react";

/** Cabeçalho de página: título + subtítulo à esquerda, ação à direita. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-faint">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
