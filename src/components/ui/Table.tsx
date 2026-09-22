import type { ReactNode } from "react";

/**
 * Classes das células, exportadas para as telas montarem suas próprias
 * colunas sem repetir padding/tipografia. O cabeçalho é uma faixa mais
 * clara (`bg-elevated`), como no layout de referência — nada de maiúsculas
 * espaçadas, só um rótulo discreto.
 */
export const TH_CLASS = "px-4 py-2.5 text-[13px] font-medium text-faint";
export const TD_CLASS = "px-4 py-3 text-sm text-muted-foreground";

/** Container da tabela: borda hairline, cantos de 12px, sem sombra. */
export function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

/**
 * Linha de contagem abaixo da tabela, no lugar da paginação da referência.
 *
 * É só contagem mesmo: os endpoints de listagem devolvem a coleção inteira,
 * então não há página para navegar — prometer "Página 1 de N" seria mentira.
 */
export function TableFooter({
  count,
  singular,
  plural,
}: {
  count: number;
  singular: string;
  plural: string;
}) {
  return (
    <p className="mt-3 text-[13px] text-faint">
      {count} {count === 1 ? singular : plural}
    </p>
  );
}
