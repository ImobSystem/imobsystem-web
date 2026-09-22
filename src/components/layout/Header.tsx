"use client";

import { usePathname } from "next/navigation";

/** Rótulo do breadcrumb por rota — só o nível atual, sem repetir o título da página. */
const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/imoveis": "Imóveis",
  "/corretores": "Corretores",
  "/clientes": "Clientes",
  "/negociacoes": "Negociações",
  "/configuracoes": "Configurações",
};

interface Props {
  onMenuClick: () => void;
}

/**
 * Barra superior da área logada: fina, com borda embaixo, separando o topo
 * do conteúdo como no layout de referência.
 *
 * Ela ficou propositalmente enxuta — conta, tema e logout moraram aqui até
 * o redesign, mas agora vivem no rodapé da sidebar. Sobrou o contexto de
 * navegação (e, no mobile, o botão que abre o drawer).
 */
export function Header({ onMenuClick }: Props) {
  const pathname = usePathname();
  const breadcrumb = ROUTE_LABELS["/" + pathname.split("/")[1]] ?? "";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-canvas px-4 transition-colors duration-200 sm:px-8">
      {/* Hambúrguer — só no mobile, abre a sidebar como drawer. */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="-ml-1 flex h-8 w-8 items-center justify-center rounded-md text-faint transition-colors duration-150 hover:bg-hover hover:text-foreground md:hidden"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <p className="truncate text-[13px] font-medium text-faint">{breadcrumb}</p>
    </header>
  );
}
