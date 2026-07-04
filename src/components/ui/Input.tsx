import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * Campo de formulário reutilizável com label acessível.
 * Usa `forwardRef` para funcionar com libs de formulário no futuro.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, id, className = "", ...props }, ref) {
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
          className={
            "rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 " +
            "placeholder:text-slate-400 outline-none transition " +
            "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 " +
            "disabled:cursor-not-allowed disabled:bg-slate-50 " +
            className
          }
          {...props}
        />
      </div>
    );
  },
);
