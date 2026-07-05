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
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
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
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && <span className="text-emerald-600">{icon}</span>}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200" />
      ) : (
        <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      )}
    </Card>
  );
}
