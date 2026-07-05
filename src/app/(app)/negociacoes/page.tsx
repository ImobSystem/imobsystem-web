"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { NegociacaoFormModal } from "@/components/negociacoes/NegociacaoFormModal";
import { imovelService } from "@/services/imovelService";
import { clienteService } from "@/services/clienteService";
import { negociacaoService } from "@/services/negociacaoService";
import { getErrorMessage } from "@/services/errors";
import { formatCurrency } from "@/lib/format";
import {
  STATUS_NEGOCIO_LABELS,
  STATUS_NEGOCIO_OPTIONS,
  type Cliente,
  type Imovel,
  type Negociacao,
  type StatusNegocio,
} from "@/types";

/** Barra de cor no topo de cada coluna do funil. */
const COLUMN_ACCENT: Record<StatusNegocio, string> = {
  OPORTUNIDADE: "bg-slate-400",
  EM_ATENDIMENTO: "bg-blue-500",
  VISITA_AGENDADA: "bg-violet-500",
  PROPOSTA: "bg-amber-500",
  GANHO: "bg-emerald-500",
  PERDIDO: "bg-red-500",
};

export default function NegociacoesPage() {
  const [negociacoes, setNegociacoes] = useState<Negociacao[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  // Guarda o id da negociação cujo status está sendo alterado (para desabilitar o select).
  const [movingId, setMovingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [neg, imv, cli] = await Promise.all([
        negociacaoService.list(),
        imovelService.list(),
        clienteService.list(),
      ]);
      setNegociacoes(neg);
      setImoveis(imv);
      setClientes(cli);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Lookups id->entidade para exibir endereço/nome nos cards.
  const imovelById = useMemo(
    () => new Map(imoveis.map((i) => [i.id, i])),
    [imoveis],
  );
  const clienteById = useMemo(
    () => new Map(clientes.map((c) => [c.id, c])),
    [clientes],
  );

  // Agrupa as negociações por status (uma lista por coluna do funil).
  const byStatus = useMemo(() => {
    const groups = new Map<StatusNegocio, Negociacao[]>(
      STATUS_NEGOCIO_OPTIONS.map((s) => [s, []]),
    );
    for (const n of negociacoes) {
      groups.get(n.statusNegocio)?.push(n);
    }
    return groups;
  }, [negociacoes]);

  async function handleChangeStatus(
    negociacao: Negociacao,
    novoStatus: StatusNegocio,
  ) {
    if (novoStatus === negociacao.statusNegocio) return;
    setMovingId(negociacao.id);
    try {
      await negociacaoService.updateStatus(negociacao.id, novoStatus);
      // Atualização otimista local (evita recarregar tudo só para mover um card).
      setNegociacoes((prev) =>
        prev.map((n) =>
          n.id === negociacao.id ? { ...n, statusNegocio: novoStatus } : n,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setMovingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Negociações"
        subtitle="Funil de vendas e locações"
        action={
          <Button onClick={() => setFormOpen(true)}>Nova negociação</Button>
        }
      />

      {loading ? (
        <Card>
          <LoadingState label="Carregando negociações..." />
        </Card>
      ) : error ? (
        <Card>
          <ErrorState message={error} onRetry={load} />
        </Card>
      ) : (
        // Funil: colunas roláveis horizontalmente quando não cabem na tela.
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_NEGOCIO_OPTIONS.map((status) => {
            const items = byStatus.get(status) ?? [];
            return (
              <div
                key={status}
                className="flex w-72 shrink-0 flex-col rounded-2xl bg-slate-50/80 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-800"
              >
                {/* Cabeçalho da coluna */}
                <div className="flex items-center gap-2 px-4 pt-4">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${COLUMN_ACCENT[status]}`}
                  />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {STATUS_NEGOCIO_LABELS[status]}
                  </h3>
                  <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  {items.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                      Nenhuma negociação
                    </p>
                  ) : (
                    items.map((n) => {
                      const imovel = imovelById.get(n.imovelId);
                      const cliente = clienteById.get(n.clienteId);
                      return (
                        <div
                          key={n.id}
                          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-800/60"
                        >
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(n.valor)}
                          </p>
                          <p className="mt-1 truncate text-sm text-slate-700 dark:text-slate-300">
                            {imovel?.endereco ?? `Imóvel #${n.imovelId}`}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {cliente?.nome ?? `Cliente #${n.clienteId}`}
                          </p>

                          {/* Mudança de status via PUT /negociacoes/{id}/status */}
                          <select
                            value={n.statusNegocio}
                            disabled={movingId === n.id}
                            onChange={(e) =>
                              handleChangeStatus(
                                n,
                                e.target.value as StatusNegocio,
                              )
                            }
                            className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-600 outline-none transition focus:border-emerald-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:[color-scheme:dark]"
                            aria-label="Mover para outro status"
                          >
                            {STATUS_NEGOCIO_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_NEGOCIO_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NegociacaoFormModal
        open={formOpen}
        imoveis={imoveis}
        clientes={clientes}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />
    </>
  );
}
