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
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={id}
          className={
            "rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 " +
            "outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 " +
            "disabled:cursor-not-allowed disabled:bg-slate-50 " +
            "dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:disabled:bg-slate-800/30 dark:[color-scheme:dark] " +
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
