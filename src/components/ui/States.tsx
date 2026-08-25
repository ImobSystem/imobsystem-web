import type { ReactNode } from "react";
import { Button } from "./Button";

/** Spinner centralizado para estados de carregamento. */
export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-faint">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

/** Estado vazio (nenhum registro, ou nenhum resultado de filtro), com CTA opcional. */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Ícone sutil acima do título — usado no "sem resultados para esses filtros". */
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {icon && <div className="mb-1 text-faint opacity-60">{icon}</div>}
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
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
      <p className="max-w-md text-sm text-danger">{message}</p>
      {onRetry && (
        <Button variant="neutral" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
