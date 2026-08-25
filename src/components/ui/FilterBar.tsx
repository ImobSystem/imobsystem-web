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
 * Barra de busca + filtros reutilizável entre as telas de listagem.
 * Flex-wrap: empilha no mobile, os inputs ficam full-width.
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
    <div className="mb-4 flex flex-wrap items-end gap-3">
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
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
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
            className="w-full rounded-lg border border-border bg-elevated py-2 pl-9 pr-3 text-sm text-muted-foreground placeholder:text-faint outline-none transition-colors duration-150 focus:border-accent"
          />
        </div>
      )}

      {children}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm text-faint transition-colors duration-150 hover:text-muted-foreground"
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
