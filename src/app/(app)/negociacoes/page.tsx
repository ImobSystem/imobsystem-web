"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { NegociacaoFormModal } from "@/components/negociacoes/NegociacaoFormModal";
import { usePageAction } from "@/contexts/PageActionContext";
import { imovelService } from "@/services/imovelService";
import { clienteService } from "@/services/clienteService";
import { negociacaoService } from "@/services/negociacaoService";
import { getErrorMessage } from "@/services/errors";
import { formatCurrency, formatDate, STATUS_NEGOCIO_DOT } from "@/lib/format";
import {
  STATUS_NEGOCIO_LABELS,
  STATUS_NEGOCIO_OPTIONS,
  type Cliente,
  type Imovel,
  type Negociacao,
  type StatusNegocio,
} from "@/types";

export default function NegociacoesPage() {
  const [negociacoes, setNegociacoes] = useState<Negociacao[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  // Guarda o id da negociação cujo status está sendo alterado (para desabilitar o select).
  const [movingId, setMovingId] = useState<number | null>(null);

  usePageAction({ label: "Nova negociação", onClick: () => setFormOpen(true) });

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
          <Button size="sm" onClick={() => setFormOpen(true)}>Nova negociação</Button>
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
        // Funil com rolagem horizontal: colunas de largura fixa lado a lado,
        // como um kanban de verdade — não empilha em telas estreitas.
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STATUS_NEGOCIO_OPTIONS.map((status) => {
            const items = byStatus.get(status) ?? [];
            return (
              <div
                key={status}
                className="flex w-[280px] shrink-0 flex-col rounded-xl border border-border bg-surface p-4"
              >
                {/* Cabeçalho da coluna */}
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${STATUS_NEGOCIO_DOT[status]}`}
                  />
                  <h3 className="text-[13px] font-semibold text-foreground">
                    {STATUS_NEGOCIO_LABELS[status]}
                  </h3>
                  <span className="ml-auto text-xs font-medium text-faint">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="mt-4 flex flex-1 flex-col">
                  {items.length === 0 ? (
                    <p className="py-6 text-center text-xs text-faint">
                      Nenhuma negociação
                    </p>
                  ) : (
                    items.map((n) => {
                      const imovel = imovelById.get(n.imovelId);
                      const cliente = clienteById.get(n.clienteId);
                      return (
                        <div
                          key={n.id}
                          className="mb-2 cursor-pointer rounded-lg border border-border bg-elevated p-3.5 transition-all duration-150 hover:-translate-y-px hover:border-border-strong"
                        >
                          <p className="text-[15px] font-semibold text-foreground">
                            {formatCurrency(n.valor)}
                          </p>
                          <p className="mt-1 truncate text-[13px] text-muted-foreground">
                            {imovel?.endereco ?? `Imóvel #${n.imovelId}`}
                          </p>
                          <p className="mt-1.5 truncate text-xs text-faint">
                            {cliente?.nome ?? `Cliente #${n.clienteId}`}
                          </p>

                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            <span className="shrink-0 text-[11px] text-faint">
                              {formatDate(n.dataInicio)}
                            </span>
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
                              onClick={(e) => e.stopPropagation()}
                              className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted-foreground outline-none transition-colors duration-150 focus:border-accent disabled:opacity-60"
                              aria-label="Mover para outro status"
                            >
                              {STATUS_NEGOCIO_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {STATUS_NEGOCIO_LABELS[s]}
                                </option>
                              ))}
                            </select>
                          </div>
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
