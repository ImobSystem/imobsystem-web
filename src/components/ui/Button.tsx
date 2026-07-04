import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Exibe spinner e desabilita o botão enquanto true. */
  loading?: boolean;
}

/**
 * Botão primário da aplicação. Quando `loading`, mostra um spinner
 * e bloqueia cliques para evitar submissões duplicadas.
 */
export function Button({
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={
        "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 " +
        "px-4 py-2.5 font-medium text-white transition " +
        "hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 " +
        "disabled:cursor-not-allowed disabled:opacity-60 " +
        className
      }
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
