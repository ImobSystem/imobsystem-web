"use client";

export interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Rótulo do grupo para leitores de tela (ex.: "Filtrar por tipo"). */
  label: string;
}

/**
 * Abas em formato de pílula, como no layout de referência.
 *
 * Nas listagens elas não são navegação: são o filtro principal da tela
 * (tipo, status...) promovido de um `<select>` para algo visível de cara.
 * Por isso `role="tablist"` com botões, e não links.
 */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex items-center gap-1 overflow-x-auto"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={
              "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] " +
              "transition-all duration-300 " +
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] " +
              (active
                ? // Pílula sólida invertida: o contraste sai dos tokens, então
                  // vira clara no tema escuro e escura no claro, sem hardcode.
                  "bg-foreground font-semibold text-canvas shadow-sm"
                : "text-muted-foreground hover:bg-hover hover:text-foreground")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
