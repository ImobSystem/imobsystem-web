"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/auth";
import { clearSession, tokenStorage, userStorage } from "@/services/storage";
import { getImobiliariaIdFromToken } from "@/services/jwt";
import type { Usuario } from "@/types";

interface AuthContextValue {
  /** Usuário autenticado, ou null se ninguém logado. */
  user: Usuario | null;
  /** Token JWT atual, ou null. */
  token: string | null;
  /** true enquanto restauramos a sessão do localStorage no primeiro render. */
  loading: boolean;
  /** Atalho derivado: existe uma sessão ativa? */
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  /**
   * Estabelece a sessão a partir de um token já obtido (ex.: após o registro,
   * que já devolve o token) — sem chamar /auth/login novamente.
   */
  loginComToken: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Ao montar, tentamos reidratar a sessão a partir do localStorage.
   * Isso permite que a sessão sobreviva a um refresh (F5) da página.
   * `loading` cobre esse intervalo para evitar "piscar" a tela de login.
   */
  useEffect(() => {
    const storedToken = tokenStorage.get();
    const storedUser = userStorage.get();
    if (storedToken && storedUser) {
      // Backfill: sessões salvas antes de expormos o imobiliariaId reextraem do token.
      const usuario: Usuario = {
        ...storedUser,
        imobiliariaId:
          storedUser.imobiliariaId ?? getImobiliariaIdFromToken(storedToken),
      };
      setToken(storedToken);
      setUser(usuario);
    }
    setLoading(false);
  }, []);

  /** Persiste token + usuário (localStorage) e atualiza o estado em memória. */
  const persistSession = useCallback((novoToken: string, usuario: Usuario) => {
    tokenStorage.set(novoToken);
    userStorage.set(usuario);
    setToken(novoToken);
    setUser(usuario);
  }, []);

  const login = useCallback(
    async (email: string, senha: string) => {
      // Deixamos o erro do axios propagar; a tela de login o traduz para o usuário.
      const data = await authService.login({ email, senha });
      // O imobiliariaId não vem no corpo da resposta — está codificado no JWT.
      const usuario: Usuario = {
        email: data.email,
        perfil: data.perfil,
        imobiliariaId: getImobiliariaIdFromToken(data.token),
      };
      persistSession(data.token, usuario);
    },
    [persistSession],
  );

  const loginComToken = useCallback(
    (novoToken: string, usuario: Usuario) => {
      persistSession(novoToken, usuario);
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      loginComToken,
      logout,
    }),
    [user, token, loading, login, loginComToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook de acesso ao contexto — garante uso dentro do provider. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  }
  return ctx;
}
