import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Mensagem de erro do campo; quando presente, destaca a borda em vermelho. */
  error?: string;
}

/**
 * Campo de formulário reutilizável com label acessível.
 * Usa `forwardRef` para funcionar com libs de formulário no futuro.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, id, error, className = "", ...props }, ref) {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          className={
            "rounded-lg border bg-white px-3.5 py-2.5 text-slate-900 " +
            "placeholder:text-slate-400 outline-none transition " +
            "focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 " +
            (error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 "
              : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 ") +
            className
          }
          {...props}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  },
);
