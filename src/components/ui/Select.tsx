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
}

/** Campo <select> com o mesmo visual do Input. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, id, options, placeholder, className = "", ...props },
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
          className={
            "rounded-lg border border-border bg-elevated px-3.5 py-2.5 text-sm text-muted-foreground " +
            "outline-none transition-[border-color,box-shadow] duration-150 " +
            "focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-subtle)] " +
            "disabled:cursor-not-allowed disabled:opacity-60 " +
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
      </div>
    );
  },
);
