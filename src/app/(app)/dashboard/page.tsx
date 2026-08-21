"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
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
  STATUS_NEGOCIO_DOT,
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

/** Ícone dentro do quadrado dos cards pequenos. */
function MiniIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-elevated text-faint">
      {children}
    </span>
  );
}

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
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
        <PageTitle />
        <Card>
          <ErrorState message={fatalError} onRetry={load} />
        </Card>
      </>
    );
  }

  // Mapas id->entidade para enriquecer os itens de atividade com endereço/nome.
  const imovelById = new Map((data.imoveis ?? []).map((i) => [i.id, i]));
  const clienteById = new Map((data.clientes ?? []).map((c) => [c.id, c]));

  // Últimas 5 negociações (id desc como proxy de "mais recentes").
  const recentes = [...(data.negociacoes ?? [])]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const negociacoes = data.negociacoes ?? [];
  const ganhas = negociacoes.filter((n) => n.statusNegocio === "GANHO");
  const ativas = negociacoes.filter(
    (n) => n.statusNegocio !== "GANHO" && n.statusNegocio !== "PERDIDO",
  );
  const valorEmCarteira = ativas.reduce((sum, n) => sum + n.valor, 0);
  const taxaGanho =
    negociacoes.length > 0
      ? Math.round((ganhas.length / negociacoes.length) * 100)
      : 0;

  const cardValue = (v: number | null) => (v === null ? "—" : v);

  return (
    <>
      <PageTitle />

      {/* Aviso de falha parcial (algumas seções não carregaram) */}
      {!loading && warnings.length > 0 && (
        <div
          role="alert"
          className="mb-6 rounded-lg bg-warning-bg px-4 py-3 text-sm text-warning"
        >
          Não foi possível carregar: <strong>{warnings.join(", ")}</strong>. Os
          demais dados foram exibidos normalmente.
        </div>
      )}

      {/* Stats com hierarquia: 1 card grande + 3 pequenos — nunca 4 iguais. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
        {/* Card grande — a métrica mais importante do negócio. */}
        <Card className="p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-faint">
            Negociações ativas
          </p>
          {loading ? (
            <div className="mt-2 h-12 w-20 animate-pulse rounded bg-elevated" />
          ) : (
            <p className="mt-2 text-5xl font-bold text-foreground">
              {cardValue(data.negociacoes === null ? null : ativas.length)}
            </p>
          )}
          <p className="mt-3 text-[13px] text-faint">
            {data.negociacoes === null
              ? "Não foi possível carregar."
              : `${formatCurrency(valorEmCarteira)} em carteira`}
          </p>
          {data.negociacoes !== null && negociacoes.length > 0 && (
            <div className="mt-4">
              <div className="h-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${taxaGanho}%` }}
                />
              </div>
              <p className="mt-2 text-[13px] text-faint">
                {taxaGanho}% de taxa de ganho
              </p>
            </div>
          )}
        </Card>

        {/* 3 cards pequenos, empilhados. */}
        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          <MiniStat
            label="Imóveis"
            value={cardValue(data.imoveis?.length ?? null)}
            loading={loading}
            icon={
              <svg {...ICON_PROPS}>
                <path d="M3 9.5 12 3l9 6.5" />
                <path d="M5 10v10h14V10" />
                <path d="M9 20v-6h6v6" />
              </svg>
            }
          />
          <MiniStat
            label="Corretores"
            value={cardValue(data.corretoresTotal)}
            loading={loading}
            icon={
              <svg {...ICON_PROPS}>
                <circle cx="9" cy="7" r="4" />
                <path d="M2 21v-2a6 6 0 0 1 12 0v2" />
                <path d="M16 3.1a4 4 0 0 1 0 7.8" />
                <path d="M22 21v-2a6 6 0 0 0-4-5.6" />
              </svg>
            }
          />
          <MiniStat
            label="Clientes"
            value={cardValue(data.clientes?.length ?? null)}
            loading={loading}
            icon={
              <svg {...ICON_PROPS}>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Atividade recente — lista, não tabela. */}
      <div className="mt-8">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Atividade recente
        </h2>
        <Card className="overflow-hidden">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-elevated" />
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-elevated" />
                </div>
              ))}
            </div>
          ) : data.negociacoes === null ? (
            <p className="px-5 py-8 text-center text-sm text-faint">
              Não foi possível carregar as negociações.
            </p>
          ) : recentes.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-5 py-12 text-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-2 text-faint opacity-50"
                aria-hidden
              >
                <path d="M3 3v18h18" />
                <path d="M7 15l4-4 3 3 5-6" />
              </svg>
              <p className="text-sm text-faint">Nenhuma atividade recente</p>
              <p className="text-[13px] text-faint opacity-70">
                Cadastre imóveis e negociações para ver a atividade aqui
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentes.map((n) => {
                const imovel = imovelById.get(n.imovelId);
                const cliente = clienteById.get(n.clienteId);
                return (
                  <li
                    key={n.id}
                    className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-hover"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${STATUS_NEGOCIO_DOT[n.statusNegocio]}`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {imovel?.endereco ?? `Imóvel #${n.imovelId}`}
                      </p>
                      <p className="truncate text-xs text-faint">
                        {cliente?.nome ?? `Cliente #${n.clienteId}`} ·{" "}
                        {formatDate(n.dataInicio)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(n.valor)}
                    </span>
                    <Badge tone={STATUS_NEGOCIO_TONE[n.statusNegocio]}>
                      {STATUS_NEGOCIO_LABELS[n.statusNegocio]}
                    </Badge>
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

function PageTitle() {
  return (
    <div className="mb-8">
      <h1 className="text-[28px] font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-faint">Visão geral da imobiliária</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  loading,
  icon,
}: {
  label: string;
  value: number | string;
  loading: boolean;
  icon: ReactNode;
}) {
  return (
    <Card className="flex items-center justify-between p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
          {label}
        </p>
        {loading ? (
          <div className="mt-1.5 h-7 w-10 animate-pulse rounded bg-elevated" />
        ) : (
          <p className="mt-1.5 text-[28px] font-bold text-foreground">
            {value}
          </p>
        )}
      </div>
      <MiniIcon>{icon}</MiniIcon>
    </Card>
  );
}
