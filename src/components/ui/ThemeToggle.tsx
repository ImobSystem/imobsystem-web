"use client";

import { useTheme } from "@/contexts/ThemeContext";

/**
 * Botão que alterna claro/escuro. Mostra sol ou lua conforme o tema,
 * com uma transição sutil de rotação/opacidade entre os dois ícones.
 *
 * O escuro é o tema padrão do design (sem classe no <html>), então o ícone
 * da lua é quem fica visível "por padrão" — o sol só aparece sob `.light`.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-faint transition-all duration-150 hover:text-muted-foreground active:scale-95"
    >
      {/* Sol (visível no modo claro) */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute rotate-90 scale-0 opacity-0 transition-all duration-300 light:rotate-0 light:scale-100 light:opacity-100"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      {/* Lua (visível no modo escuro) */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute rotate-0 scale-100 opacity-100 transition-all duration-300 light:-rotate-90 light:scale-0 light:opacity-0"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
