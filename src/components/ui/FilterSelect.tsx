interface Option {
  value: string;
  label: string;
}

interface Props {
  /** Legenda de 11px acima do select — o select em si só mostra "Todos" quando vazio. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}

/** Select compacto de filtro (sem o peso visual do Select de formulário). */
export function FilterSelect({ label, value, onChange, options, className = "" }: Props) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-full appearance-none rounded-lg border border-border bg-elevated py-2 pl-3 pr-8 text-sm text-muted-foreground outline-none transition-colors duration-150 focus:border-accent"
        >
          <option value="">Todos</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
