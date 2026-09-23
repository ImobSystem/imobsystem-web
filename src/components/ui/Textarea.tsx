import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  /** Mensagem de erro do campo; quando presente, destaca a borda em vermelho. */
  error?: string;
  /** Texto de apoio abaixo do campo (some quando há erro). */
  hint?: string;
}

/** Campo de texto longo — mesmo visual do Input, só que multilinha. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, id, error, hint, rows = 5, className = "", ...props },
    ref,
  ) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-invalid={error ? true : undefined}
          className={
            "resize-y rounded-lg border bg-elevated px-3.5 py-2.5 text-sm text-muted-foreground " +
            "placeholder:text-faint outline-none transition-[border-color,box-shadow] duration-150 " +
            "disabled:cursor-not-allowed disabled:opacity-60 " +
            (error
              ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_var(--status-danger-bg)] "
              : "border-border focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-subtle)] ") +
            className
          }
          {...props}
        />
        {error ? (
          <span className="animate-fade-in text-xs font-normal text-danger">
            {error}
          </span>
        ) : hint ? (
          <span className="text-xs text-faint">{hint}</span>
        ) : null}
      </div>
    );
  },
);
