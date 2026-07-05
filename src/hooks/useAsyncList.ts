"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/services/errors";

interface AsyncListState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  /** Rebusca os dados (usado após criar/editar/excluir e no "tentar novamente"). */
  reload: () => void;
}

/**
 * Encapsula o ciclo de vida de "buscar uma lista da API":
 * carregamento inicial, tratamento de erro e recarga sob demanda.
 *
 * `fetcher` deve ser estável (ex.: `imovelService.list`) para não refazer
 * a busca a cada render.
 */
export function useAsyncList<T>(fetcher: () => Promise<T[]>): AsyncListState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetcher());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
