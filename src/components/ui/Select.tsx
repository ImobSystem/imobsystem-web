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
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          className={
            "rounded-lg border bg-white px-3.5 py-2.5 text-slate-900 " +
            "outline-none transition focus:ring-2 " +
            "disabled:cursor-not-allowed disabled:bg-slate-50 " +
            "dark:bg-slate-800/60 dark:text-slate-100 dark:disabled:bg-slate-800/30 dark:[color-scheme:dark] " +
            (error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/70 "
              : "border-slate-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-slate-700 dark:focus:border-primary-500 ") +
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
