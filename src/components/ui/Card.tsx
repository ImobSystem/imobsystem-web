import type { ReactNode } from "react";

/**
 * Container padrão: fundo, borda hairline, cantos de 12px. Sem sombra, sem
 * gradiente — a separação vem do contraste tonal entre `bg-surface` e o
 * canvas atrás dele. `interactive` liga uma borda um pouco mais visível no
 * hover (neutra — o laranja fica só pros pontos de ação de verdade).
 */
export function Card({
  children,
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border border-border bg-surface transition-colors duration-200 " +
        (interactive ? "hover:border-border-strong " : "") +
        className
      }
    >
      {children}
    </div>
  );
}
