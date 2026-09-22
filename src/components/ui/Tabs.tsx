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
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] transition-colors duration-150 " +
              (active
                ? "bg-elevated font-medium text-foreground"
                : "text-muted-foreground hover:bg-hover/60 hover:text-foreground")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
