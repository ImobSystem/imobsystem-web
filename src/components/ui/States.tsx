import type { ReactNode } from "react";
import { Button } from "./Button";

/** Spinner centralizado para estados de carregamento. */
export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

/** Estado vazio (nenhum registro), com CTA opcional. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-base font-medium text-slate-700 dark:text-slate-200">
        {title}
      </p>
      {description && (
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** Estado de erro com botão de "Tentar novamente". */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="max-w-md text-sm text-red-600 dark:text-red-400">
        {message}
      </p>
      {onRetry && (
        <Button variant="neutral" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
