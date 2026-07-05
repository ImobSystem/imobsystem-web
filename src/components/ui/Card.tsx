import type { ReactNode } from "react";

/** Container branco padrão (borda + sombra sutil + cantos arredondados). */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-surface shadow-sm transition-colors dark:border-slate-800 ${className}`}
    >
      {children}
    </div>
  );
}

/** Card de métrica do dashboard (rótulo + valor + ícone opcional). */
export function StatCard({
  label,
  value,
  loading = false,
  icon,
}: {
  label: string;
  value: number | string;
  loading?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {icon && (
          <span className="text-primary-600 dark:text-primary-400">{icon}</span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      ) : (
        <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
          {value}
        </p>
      )}
    </Card>
  );
}
