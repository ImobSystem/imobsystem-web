/**
 * Acesso centralizado ao localStorage.
 *
 * Motivos para não usar `localStorage` direto pelo código:
 *  - No Next.js (SSR) `window`/`localStorage` não existem no servidor; qualquer
 *    acesso direto quebraria a renderização. Aqui protegemos com o guard
 *    `typeof window === "undefined"`.
 *  - Centralizar as chaves evita "strings mágicas" espalhadas e divergentes.
 */

const TOKEN_KEY = "imob:token";
const USER_KEY = "imob:user";

import type { Usuario } from "@/types";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

export const userStorage = {
  get(): Usuario | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      // Dado corrompido: limpa para não travar o app em loop.
      window.localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  set(user: Usuario): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(USER_KEY);
  },
};

/** Limpa toda a sessão (token + usuário). */
export function clearSession(): void {
  tokenStorage.clear();
  userStorage.clear();
}
