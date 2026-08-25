"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** Atalho de ação principal da página atual (ex.: "Cadastrar imóvel"). */
export interface PageAction {
  label: string;
  onClick: () => void;
}

interface PageActionContextValue {
  action: PageAction | null;
  setAction: (action: PageAction | null) => void;
}

const PageActionContext = createContext<PageActionContextValue | undefined>(
  undefined,
);

/**
 * Ponte entre a página atual e o botão "Novo" do Header.
 *
 * Cada tela registra sua ação principal via `usePageAction`; o Header lê o
 * valor atual e renderiza o atalho (ou nada, se a tela não tiver uma ação
 * de criação — ex.: Dashboard, Configurações).
 */
export function PageActionProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<PageAction | null>(null);
  const value = useMemo(() => ({ action, setAction }), [action]);
  return (
    <PageActionContext.Provider value={value}>
      {children}
    </PageActionContext.Provider>
  );
}

export function usePageActionContext(): PageActionContextValue {
  const ctx = useContext(PageActionContext);
  if (!ctx) {
    throw new Error(
      "usePageActionContext deve ser usado dentro de <PageActionProvider>.",
    );
  }
  return ctx;
}

/**
 * Registra a ação principal da página montada. Limpa automaticamente ao
 * desmontar (evita que o botão "Novo" sobreviva à troca de rota antes da
 * próxima página registrar a sua).
 *
 * As páginas passam `onClick` como uma closure nova a cada render (ex.:
 * `() => setFormOpen(true)`), então o efeito NÃO pode depender da identidade
 * de `onClick` — faria o efeito re-rodar (e `setAction` re-renderizar o
 * provider) a cada render, num loop infinito. Por isso guardamos a ação mais
 * recente numa ref e só re-registramos no contexto quando o `label` muda.
 */
export function usePageAction(action: PageAction | null) {
  const { setAction } = usePageActionContext();
  const actionRef = useRef(action);
  actionRef.current = action;

  useEffect(() => {
    if (!action) {
      setAction(null);
      return;
    }
    setAction({
      label: action.label,
      onClick: () => actionRef.current?.onClick(),
    });
    return () => setAction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action?.label, Boolean(action), setAction]);
}
