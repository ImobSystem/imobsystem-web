import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "danger" | "neutral";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Exibe spinner e desabilita o botão enquanto true. */
  loading?: boolean;
  /** Estilo do botão. `primary` (ember) é o padrão. */
  variant?: Variant;
  /**
   * `sm` é o CTA compacto de cabeçalho de página (8px/16px, 13px) — `md`
   * (default) é o tamanho usado em modais/formulários (10px/20px, 14px).
   */
  size?: Size;
}

/*
 * Estilos por variante. O primário é o ÚNICO elemento com fundo laranja
 * sólido do sistema inteiro — e "brilha" no hover com um glow (box-shadow
 * em duas camadas), a assinatura visual do Cron.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-[var(--accent-hover)] " +
    "hover:shadow-[0_0_0_1px_var(--accent-glow-inner),0_0_20px_4px_var(--accent-glow-outer)] " +
    "focus:ring-accent/40",
  danger:
    "bg-transparent text-danger border border-danger-bg hover:bg-danger-bg focus:ring-danger/30",
  neutral:
    "bg-transparent text-muted-foreground border border-border-strong hover:bg-hover focus:ring-accent/20",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-5 py-2.5 text-sm",
};

/**
 * Botão da aplicação.
 *
 * `loading` mostra spinner e bloqueia cliques (evita duplo submit).
 */
export function Button({
  loading = false,
  variant = "primary",
  size = "md",
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={
        "inline-flex items-center justify-center gap-2 rounded font-medium " +
        "transition-all duration-200 " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base " +
        "active:scale-[0.98] " +
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none " +
        SIZES[size] +
        " " +
        VARIANTS[variant] +
        " " +
        className
      }
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
