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

/**
 * Cada métrica é opcional (null = não carregou). Assim o dashboard tolera a
 * falha de um endpoint isolado sem derrubar a tela inteira.
 */
interface DashboardData {
  imoveis: Imovel[] | null;
  clientes: Cliente[] | null;
  negociacoes: Negociacao[] | null;
  corretoresTotal: number | null;
}

const EMPTY: DashboardData = {
  imoveis: null,
  clientes: null,
  negociacoes: null,
  corretoresTotal: null,
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);
  // Seções que falharam ao carregar (ex.: ["Corretores"]).
  const [warnings, setWarnings] = useState<string[]>([]);
  // Preenchido só quando TODOS os endpoints falham (erro de tela cheia).
  const [fatalError, setFatalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setWarnings([]);
    setFatalError(null);

    // allSettled (e não all): buscamos tudo em paralelo, mas o fracasso de um
    // endpoint não cancela os outros — aproveitamos o que deu certo.
    const [imoveisR, corretoresR, clientesR, negociacoesR] =
      await Promise.allSettled([
        imovelService.list(),
        corretorService.list(),
        clienteService.list(),
        negociacaoService.list(),
      ]);

    const falhas: string[] = [];
    let ultimaMsg = "";
    if (imoveisR.status === "rejected") {
      falhas.push("Imóveis");
      ultimaMsg = getErrorMessage(imoveisR.reason);
    }
    if (corretoresR.status === "rejected") {
      falhas.push("Corretores");
      ultimaMsg = getErrorMessage(corretoresR.reason);
    }
    if (clientesR.status === "rejected") {
      falhas.push("Clientes");
      ultimaMsg = getErrorMessage(clientesR.reason);
    }
    if (negociacoesR.status === "rejected") {
      falhas.push("Negociações");
      ultimaMsg = getErrorMessage(negociacoesR.reason);
    }

    // Todos falharam → provavelmente rede/servidor fora: erro de tela cheia.
    if (falhas.length === 4) {
      setFatalError(ultimaMsg);
      setLoading(false);
      return;
    }

    setData({
      imoveis: imoveisR.status === "fulfilled" ? imoveisR.value : null,
      clientes: clientesR.status === "fulfilled" ? clientesR.value : null,
      negociacoes:
        negociacoesR.status === "fulfilled" ? negociacoesR.value : null,
      corretoresTotal:
        corretoresR.status === "fulfilled" ? corretoresR.value.length : null,
    });
    setWarnings(falhas);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (fatalError) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Visão geral da imobiliária" />
        <Card>
          <ErrorState message={fatalError} onRetry={load} />
        </Card>
      </>
    );
  }

  // Mapas id->entidade para enriquecer os cards de negociação com endereço/nome.
  const imovelById = new Map((data.imoveis ?? []).map((i) => [i.id, i]));
  const clienteById = new Map((data.clientes ?? []).map((c) => [c.id, c]));

  // Últimas 5 negociações (id desc como proxy de "mais recentes").
  const recentes = [...(data.negociacoes ?? [])]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  // Valor exibido no card: número, "—" se falhou, "0" se ainda carregando trata via loading.
  const cardValue = (v: number | null) => (v === null ? "—" : v);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral da imobiliária" />

      {/* Aviso de falha parcial (algumas seções não carregaram) */}
      {!loading && warnings.length > 0 && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
        >
          Não foi possível carregar: <strong>{warnings.join(", ")}</strong>. Os
          demais dados foram exibidos normalmente.
        </div>
      )}

      {/* Cards de totais */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Imóveis"
          value={cardValue(data.imoveis?.length ?? null)}
          loading={loading}
        />
        <StatCard
          label="Corretores"
          value={cardValue(data.corretoresTotal)}
          loading={loading}
        />
        <StatCard
          label="Clientes"
          value={cardValue(data.clientes?.length ?? null)}
          loading={loading}
        />
        <StatCard
          label="Negociações"
          value={cardValue(data.negociacoes?.length ?? null)}
          loading={loading}
        />
      </div>

      {/* Resumo: últimas negociações */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
          Últimas negociações
        </h2>
        <Card className="overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : data.negociacoes === null ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Não foi possível carregar as negociações.
            </p>
          ) : recentes.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Nenhuma negociação cadastrada ainda.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentes.map((n) => {
                const imovel = imovelById.get(n.imovelId);
                const cliente = clienteById.get(n.clienteId);
                return (
                  <li
                    key={n.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                        {imovel?.endereco ?? `Imóvel #${n.imovelId}`}
                      </p>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {cliente?.nome ?? `Cliente #${n.clienteId}`} ·{" "}
                        {formatDate(n.dataInicio)}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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
