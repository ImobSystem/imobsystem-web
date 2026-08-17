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
import { useAuth } from "@/contexts/AuthContext";
import { imobiliariaService } from "@/services/imobiliariaService";
import { getErrorMessage } from "@/services/errors";
import type { Imobiliaria } from "@/types";

interface ImobiliariaContextValue {
  /** Imobiliária do usuário logado, ou null enquanto carrega/falha. */
  imobiliaria: Imobiliaria | null;
  /** true durante a busca em GET /imobiliarias/minha. */
  loading: boolean;
  /** Mensagem amigável quando a busca falha, ou null. */
  error: string | null;
  /** Refaz a busca (usado no "tentar novamente"). */
  reload: () => void;
  /**
   * Atualiza só a logo em memória, sem novo GET.
   * Chamado após salvar em Configurações para a sidebar refletir na hora.
   */
  aplicarLogo: (logoBase64: string) => void;
}

const ImobiliariaContext = createContext<ImobiliariaContextValue | undefined>(
  undefined,
);

/**
 * Carrega uma única vez os dados da imobiliária logada e os compartilha com
 * toda a área logada (sidebar, header e tela de Configurações).
 *
 * Fica *dentro* do <ProtectedRoute> no layout de `(app)`, então só monta
 * quando já existe sessão — nunca dispara a chamada de usuário deslogado.
 */
export function ImobiliariaProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [imobiliaria, setImobiliaria] = useState<Imobiliaria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    // Sem sessão não há o que buscar; limpamos para não vazar dados da
    // imobiliária anterior caso outro usuário logue em seguida.
    if (!isAuthenticated) {
      setImobiliaria(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setImobiliaria(await imobiliariaService.getMinhaImobiliaria());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    reload();
  }, [reload]);

  const aplicarLogo = useCallback((logoBase64: string) => {
    setImobiliaria((prev) => (prev ? { ...prev, logoBase64 } : prev));
  }, []);

  const value = useMemo<ImobiliariaContextValue>(
    () => ({ imobiliaria, loading, error, reload, aplicarLogo }),
    [imobiliaria, loading, error, reload, aplicarLogo],
  );

  return (
    <ImobiliariaContext.Provider value={value}>
      {children}
    </ImobiliariaContext.Provider>
  );
}

/** Hook de acesso ao contexto — garante uso dentro do provider. */
export function useImobiliaria(): ImobiliariaContextValue {
  const ctx = useContext(ImobiliariaContext);
  if (!ctx) {
    throw new Error(
      "useImobiliaria deve ser usado dentro de <ImobiliariaProvider>.",
    );
  }
  return ctx;
}
