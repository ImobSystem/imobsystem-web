import { forwardRef, type SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  /** Texto do placeholder desabilitado (ex.: "Selecione..."). */
  placeholder?: string;
  /** Mensagem de erro do campo; quando presente, destaca a borda em vermelho. */
  error?: string;
}

/** Campo <select> com o mesmo visual do Input. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, id, options, placeholder, error, className = "", ...props },
    ref,
  ) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          className={
            "rounded-lg border bg-elevated px-3.5 py-2.5 text-sm text-muted-foreground " +
            "outline-none transition-[border-color,box-shadow] duration-150 " +
            "disabled:cursor-not-allowed disabled:opacity-60 " +
            (error
              ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_var(--status-danger-bg)] "
              : "border-border focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-subtle)] ") +
            className
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="animate-fade-in text-xs font-normal text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </div>
    );
  },
);
