"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "imob:theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Aplica/remove a classe `.light` no <html> e persiste a escolha.
 *
 * O tema ESCURO é o padrão do design (valores direto em `:root`) — só
 * precisamos de uma classe quando o tema é o claro, a exceção.
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  window.localStorage.setItem(STORAGE_KEY, theme);
}

/** Lê o tema inicial: preferência salva > preferência do SO > escuro. */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // A classe .light já é aplicada por um script inline no <head> (evita flash);
  // aqui só sincronizamos o estado do React com o que já está no DOM.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(getInitialTheme());
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de <ThemeProvider>.");
  }
  return ctx;
}
