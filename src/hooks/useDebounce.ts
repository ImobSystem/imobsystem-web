"use client";

import { useEffect, useState } from "react";

/**
 * Devolve `value` só depois que ele passar `delayMs` sem mudar.
 *
 * Usado no campo de busca dos filtros: sem isso, cada tecla digitada
 * dispararia uma chamada à API. Voltar a um valor "vazio" (string vazia,
 * por exemplo ao clicar em "Limpar") aplica na hora — só o preenchimento
 * é debounced, senão o botão Limpar pareceria travado por até `delayMs`.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (!value) {
      setDebounced(value);
      return;
    }
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
