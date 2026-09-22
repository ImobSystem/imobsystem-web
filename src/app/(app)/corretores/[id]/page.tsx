"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminOnly } from "@/components/AdminOnly";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { TableCard, TH_CLASS, TD_CLASS } from "@/components/ui/Table";
import { useAuth } from "@/contexts/AuthContext";
import { corretorService } from "@/services/corretorService";
import { getErrorMessage } from "@/services/errors";
import { buildThumbUrl } from "@/lib/foto";
import { STATUS_IMOVEL_TONE, TIPO_CLIENTE_TONE } from "@/lib/format";
import {
  FINALIDADE_LABELS,
  PERFIL_LABELS,
  STATUS_IMOVEL_LABELS,
  TIPO_CLIENTE_LABELS,
  type Cliente,
  type Corretor,
  type CorretorMetricas,
  type Imovel,
} from "@/types";

/** As quatro respostas da API reunidas — a tela só renderiza com todas prontas. */
interface PerfilCorretor {
  corretor: Corretor;
  metricas: CorretorMetricas;
  imoveis: Imovel[];
  clientes: Cliente[];
}

/**
 * Iniciais do avatar: primeiras letras das duas primeiras palavras do nome
 * ("Victor Couto" → "VC"). Nome de uma palavra só usa as duas primeiras
 * letras dela ("Admin" → "AD").
 */
function iniciaisDoNome(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return "?";
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();
  return (palavras[0][0] + palavras[1][0]).toUpperCase();
}

/**
 * Perfil de um corretor: identificação, métricas e o que ele captou/cadastrou.
 *
 * Exclusiva do ADMIN. Como em /corretores, a proteção é dupla: <AdminOnly>
 * esconde e redireciona, mas os hooks rodam antes dele — por isso o fetch
 * também é guardado por `isAdmin`, para o CORRETOR nem chegar a chamar a API
 * (que, de qualquer forma, recusaria).
 */
export default function CorretorPerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // No App Router os params são uma Promise; em Client Component lê-se com `use`.
  const { id } = use(params);
  const corretorId = Number(id);

  const { user } = useAuth();
  const isAdmin = user?.perfil === "ADMIN";

  const [data, setData] = useState<PerfilCorretor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!isAdmin) return;

    if (!Number.isInteger(corretorId) || corretorId <= 0) {
      setError("Corretor não encontrado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Em paralelo: nenhuma das quatro depende do resultado da outra.
      const [corretor, metricas, imoveis, clientes] = await Promise.all([
        corretorService.buscarPorId(corretorId),
        corretorService.buscarMetricas(corretorId),
        corretorService.listarImoveisDoCorretor(corretorId),
        corretorService.listarClientesDoCorretor(corretorId),
      ]);
      setData({ corretor, metricas, imoveis, clientes });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [corretorId, isAdmin]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <AdminOnly>
      {/* Trilha: volta para a listagem sem depender do histórico do browser. */}
      <nav
        aria-label="Trilha de navegação"
        className="mb-5 flex items-center gap-2 text-[13px]"
      >
        <Link
          href="/corretores"
          className="text-faint no-underline transition-colors duration-150 hover:text-foreground hover:underline"
        >
          Corretores
        </Link>
        <span className="text-faint" aria-hidden>
          /
        </span>
        <span className="truncate text-muted-foreground">
          {data?.corretor.nome ?? "Perfil"}
        </span>
      </nav>

      {error ? (
        <Card>
          <ErrorState message={error} onRetry={carregar} />
        </Card>
      ) : loading || !data ? (
        <PerfilSkeleton />
      ) : (
        <>
          {/* Identificação */}
          <Card className="flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center">
            <span
              className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-accent-subtle text-[28px] font-bold text-accent"
              aria-hidden
            >
              {iniciaisDoNome(data.corretor.nome)}
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {data.corretor.nome}
                </h1>
                <Badge
                  tone={data.corretor.perfil === "ADMIN" ? "violet" : "blue"}
                >
                  {PERFIL_LABELS[data.corretor.perfil]}
                </Badge>
              </div>
              <p className="mt-1.5 truncate text-sm text-muted-foreground">
                {data.corretor.email}
              </p>
              <p className="mt-0.5 text-[13px] text-faint">
                CRECI {data.corretor.creci}
              </p>
            </div>
          </Card>

          {/* Métricas */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Imóveis captados"
              value={data.metricas.totalImoveis}
            />
            <MetricCard
              label="Clientes atendidos"
              value={data.metricas.totalClientes}
            />
            <MetricCard
              label="Negociações"
              value={data.metricas.totalNegociacoes}
            />
            <MetricCard
              label="Negociações ganhas"
              value={data.metricas.negociacoesGanhas}
              // Verde só quando há o que comemorar; zero fica neutro.
              positivo={data.metricas.negociacoesGanhas > 0}
            />
          </div>

          {/* Imóveis captados */}
          <section className="mt-8">
            <SectionTitle title="Imóveis" count={data.imoveis.length} />

            {data.imoveis.length === 0 ? (
              <Card>
                <EmptyState title="Este corretor ainda não captou nenhum imóvel" />
              </Card>
            ) : (
              <TableCard>
                <table className="w-full text-left">
                  <thead className="border-b border-border bg-elevated">
                    <tr>
                      <th className={TH_CLASS}>Endereço</th>
                      <th className={TH_CLASS}>Área</th>
                      <th className={TH_CLASS}>Finalidade</th>
                      <th className={TH_CLASS}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.imoveis.map((imovel) => (
                      <tr
                        key={imovel.id}
                        className="transition-colors duration-150 hover:bg-hover/50"
                      >
                        <td className={TD_CLASS}>
                          <div className="flex items-center gap-3">
                            {imovel.fotos.length > 0 && (
                              <img
                                src={buildThumbUrl(imovel.fotos[0])}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-md object-cover"
                              />
                            )}
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-foreground">
                                {imovel.endereco}
                              </span>
                              <span className="block text-[13px] text-faint">
                                {imovel.CEP}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className={TD_CLASS}>{imovel.area_m2} m²</td>
                        <td className={TD_CLASS}>
                          {FINALIDADE_LABELS[imovel.finalidade]}
                        </td>
                        <td className={TD_CLASS}>
                          <Badge tone={STATUS_IMOVEL_TONE[imovel.statusImovel]}>
                            {STATUS_IMOVEL_LABELS[imovel.statusImovel]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableCard>
            )}
          </section>

          {/* Clientes cadastrados */}
          <section className="mt-8">
            <SectionTitle title="Clientes" count={data.clientes.length} />

            {data.clientes.length === 0 ? (
              <Card>
                <EmptyState title="Este corretor ainda não cadastrou nenhum cliente" />
              </Card>
            ) : (
              <TableCard>
                <table className="w-full text-left">
                  <thead className="border-b border-border bg-elevated">
                    <tr>
                      <th className={TH_CLASS}>Nome</th>
                      <th className={TH_CLASS}>E-mail</th>
                      <th className={TH_CLASS}>Telefone</th>
                      <th className={TH_CLASS}>Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.clientes.map((cliente) => (
                      <tr
                        key={cliente.id}
                        className="transition-colors duration-150 hover:bg-hover/50"
                      >
                        <td className={`${TD_CLASS} font-medium text-foreground`}>
                          {cliente.nome}
                        </td>
                        <td className={TD_CLASS}>{cliente.email}</td>
                        <td className={TD_CLASS}>{cliente.telefone}</td>
                        <td className={TD_CLASS}>
                          <Badge tone={TIPO_CLIENTE_TONE[cliente.tipoCliente]}>
                            {TIPO_CLIENTE_LABELS[cliente.tipoCliente]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableCard>
            )}
          </section>
        </>
      )}
    </AdminOnly>
  );
}

/** Card de número do bloco de métricas. */
function MetricCard({
  label,
  value,
  positivo = false,
}: {
  label: string;
  value: number;
  positivo?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-faint">
        {label}
      </p>
      <p
        className={
          "mt-2 text-[28px] font-bold leading-none " +
          (positivo ? "text-success" : "text-foreground")
        }
      >
        {value}
      </p>
    </div>
  );
}

/** Título de seção + contagem em pill. */
function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <Badge>{count}</Badge>
    </div>
  );
}

/**
 * Esqueleto da tela inteira. Reproduz o mesmo esqueleto de espaçamento do
 * conteúdo real (avatar, 4 cards, duas tabelas) para não haver "pulo" no
 * layout quando as quatro chamadas terminam.
 */
function PerfilSkeleton() {
  return (
    <>
      <Card className="flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center">
        <Skeleton className="h-[72px] w-[72px] rounded-full" />
        <div className="w-full max-w-xs">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2.5 h-4 w-56" />
          <Skeleton className="mt-2 h-3.5 w-28" />
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-7 w-12" />
          </div>
        ))}
      </div>

      {[0, 1].map((secao) => (
        <section key={secao} className="mt-8">
          <Skeleton className="mb-3 h-5 w-32" />
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border bg-elevated px-4 py-3">
              <Skeleton className="h-3.5 w-40" />
            </div>
            <div className="divide-y divide-border">
              {[0, 1, 2].map((linha) => (
                <div key={linha} className="px-4 py-3.5">
                  <Skeleton className="h-4 w-full max-w-xl" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
