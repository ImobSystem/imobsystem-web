"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { imovelService } from "@/services/imovelService";
import { corretorService } from "@/services/corretorService";
import { clienteService } from "@/services/clienteService";
import { negociacaoService } from "@/services/negociacaoService";
import { getErrorMessage } from "@/services/errors";
import {
  formatCurrency,
  formatDate,
  STATUS_NEGOCIO_TONE,
} from "@/lib/format";
import {
  STATUS_NEGOCIO_LABELS,
  type Cliente,
  type Imovel,
  type Negociacao,
} from "@/types";

interface DashboardData {
  imoveis: Imovel[];
  clientes: Cliente[];
  negociacoes: Negociacao[];
  corretoresTotal: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Sem endpoints de contagem no backend: buscamos as listas e usamos .length.
      // Promise.all pega tudo em paralelo (mais rápido que sequencial).
      const [imoveis, corretores, clientes, negociacoes] = await Promise.all([
        imovelService.list(),
        corretorService.list(),
        clienteService.list(),
        negociacaoService.list(),
      ]);
      setData({
        imoveis,
        clientes,
        negociacoes,
        corretoresTotal: corretores.length,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Visão geral da imobiliária" />
        <Card>
          <ErrorState message={error} onRetry={load} />
        </Card>
      </>
    );
  }

  // Mapas id->entidade para enriquecer os cards de negociação com endereço/nome.
  const imovelById = new Map(data?.imoveis.map((i) => [i.id, i]));
  const clienteById = new Map(data?.clientes.map((c) => [c.id, c]));

  // Últimas 5 negociações (id desc como proxy de "mais recentes").
  const recentes = [...(data?.negociacoes ?? [])]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral da imobiliária" />

      {/* Cards de totais */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Imóveis"
          value={data?.imoveis.length ?? 0}
          loading={loading}
        />
        <StatCard
          label="Corretores"
          value={data?.corretoresTotal ?? 0}
          loading={loading}
        />
        <StatCard
          label="Clientes"
          value={data?.clientes.length ?? 0}
          loading={loading}
        />
        <StatCard
          label="Negociações"
          value={data?.negociacoes.length ?? 0}
          loading={loading}
        />
      </div>

      {/* Resumo: últimas negociações */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Últimas negociações
        </h2>
        <Card className="overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : recentes.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              Nenhuma negociação cadastrada ainda.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentes.map((n) => {
                const imovel = imovelById.get(n.imovelId);
                const cliente = clienteById.get(n.clienteId);
                return (
                  <li
                    key={n.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {imovel?.endereco ?? `Imóvel #${n.imovelId}`}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {cliente?.nome ?? `Cliente #${n.clienteId}`} ·{" "}
                        {formatDate(n.dataInicio)}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(n.valor)}
                      </span>
                      <Badge tone={STATUS_NEGOCIO_TONE[n.statusNegocio]}>
                        {STATUS_NEGOCIO_LABELS[n.statusNegocio]}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
