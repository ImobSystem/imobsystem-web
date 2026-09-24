import type { ReactNode } from "react";

interface Props {
  /** Omitir junto de `onSearchChange` quando a tela não tiver busca por texto. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Dropdowns de filtro (ex.: `<FilterSelect />`), passados pela tela. */
  children?: ReactNode;
  /** Quantos filtros estão ativos agora — controla se "Limpar" aparece. */
  activeCount: number;
  onClear: () => void;
}

/**
 * Barra de busca + filtros das listagens, no formato da referência: a busca
 * ocupa toda a largura disponível e os selects ficam encostados à direita,
 * todos com a mesma altura (40px).
 *
 * Flex-wrap: no mobile empilha e os campos viram full-width.
 */
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  children,
  activeCount,
  onClear,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {onSearchChange && (
        <div className="relative min-w-[220px] flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-faint outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-ring)]"
          />
        </div>
      )}

      {children}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm text-faint transition-colors duration-150 hover:bg-hover hover:text-foreground"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          Limpar
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-subtle px-1 text-[10px] font-semibold text-accent">
            {activeCount}
          </span>
        </button>
      )}
    </div>
  );
}
