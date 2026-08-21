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
        <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          className={
            "rounded-lg border bg-elevated px-3.5 py-2.5 text-sm text-muted-foreground " +
            "placeholder:text-faint outline-none transition-[border-color,box-shadow] duration-150 " +
            "disabled:cursor-not-allowed disabled:opacity-60 " +
            (error
              ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_var(--status-danger-bg)] "
              : "border-border focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-subtle)] ") +
            className
          }
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  },
);
