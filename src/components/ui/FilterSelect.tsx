interface Option {
  value: string;
  label: string;
}

interface Props {
  /** Propósito do filtro — vira o `aria-label` (não aparece na tela). */
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  /** Texto da opção vazia, ex.: "Todos os tipos". */
  allLabel?: string;
  className?: string;
}

/**
 * Select de filtro da barra de listagem.
 *
 * Segue a referência: sem legenda acima: o próprio texto da opção vazia
 * ("Todos os tipos") diz o que o campo filtra, então a barra fica com uma
 * linha só de altura.
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel = "Todos",
  className = "",
}: Props) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-10 w-full appearance-none rounded-lg border border-border bg-surface pl-3.5 pr-9 text-sm text-muted-foreground outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-ring)]"
      >
        <option value="">{allLabel}</option>
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
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
