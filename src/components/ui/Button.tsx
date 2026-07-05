import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "danger" | "neutral";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Exibe spinner e desabilita o botão enquanto true. */
  loading?: boolean;
  /** Estilo do botão. `primary` (verde) é o padrão. */
  variant?: Variant;
}

/*
 * Estilos por variante. Todas compartilham o mesmo "movimento" (elevação no
 * hover + afundar no clique) — muda só a cor/sombra. Usar gradiente + sombra
 * colorida dá o toque "vivo".
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-primary-600/20 " +
    "hover:from-primary-500 hover:to-primary-700 hover:shadow-primary-600/30 focus:ring-primary-500/50",
  danger:
    "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-red-600/20 " +
    "hover:from-red-500 hover:to-red-700 hover:shadow-red-600/30 focus:ring-red-500/50",
  neutral:
    "bg-gradient-to-b from-slate-700 to-slate-800 text-white shadow-slate-800/20 " +
    "hover:from-slate-700 hover:to-slate-900 hover:shadow-slate-800/30 focus:ring-slate-500/50 " +
    "dark:from-slate-600 dark:to-slate-700 dark:hover:to-slate-800",
};

/**
 * Botão da aplicação.
 *
 * Detalhes de "vida": gradiente sutil, sombra colorida que cresce no hover,
 * leve elevação (-translate-y) ao passar o mouse e um "afundar" (scale) no
 * clique — tudo com `transition`. Quando `loading`, mostra spinner e bloqueia
 * cliques (evita submissões duplicadas).
 */
export function Button({
  loading = false,
  variant = "primary",
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={
        "group inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium " +
        "shadow-sm transition-all duration-200 " +
        "hover:-translate-y-0.5 hover:shadow-lg " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 " +
        "active:translate-y-0 active:scale-[0.98] " +
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0 " +
        VARIANTS[variant] +
        " " +
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
