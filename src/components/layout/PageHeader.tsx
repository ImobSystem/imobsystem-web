import type { ReactNode } from "react";

/**
 * Cabeçalho de página no formato da referência: título sozinho na primeira
 * linha e, abaixo, uma faixa com as abas à esquerda e a ação principal à
 * direita. Sem abas, a faixa vira só a ação — e some se não houver nenhuma.
 */
export function PageHeader({
  title,
  subtitle,
  tabs,
  action,
}: {
  title: string;
  subtitle?: string;
  tabs?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5">
      <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-faint">{subtitle}</p>}

      {(tabs || action) && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">{tabs}</div>
          {action}
        </div>
      )}
    </div>
  );
}
