"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/States";
import type { Captacao } from "@/types";

/** Altura de cada barra (px) — usada para dimensionar o gráfico conforme o número de corretores. */
const ROW_HEIGHT = 44;
const MIN_HEIGHT = 300;

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload as Captacao;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-foreground">
        {item.nomeCorretor}: {item.totalCaptacoes} captações
      </p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-3" style={{ minHeight: MIN_HEIGHT }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3 w-24 shrink-0 animate-pulse rounded bg-elevated" />
          <div
            className="h-5 animate-pulse rounded bg-elevated"
            style={{ width: `${40 + ((i * 13) % 45)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

interface CaptacoesChartProps {
  data: Captacao[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Corretor em foco; a barra dele fica cheia e as outras esmaecem. */
  corretorSelecionado?: number | null;
  /** Clique numa barra. Clicar na barra já selecionada manda `null` (limpa). */
  onSelecionarCorretor?: (corretorId: number | null) => void;
}

/** Gráfico de barras horizontal com o total de imóveis captados por corretor — só ADMIN. */
export function CaptacoesChart({
  data,
  loading,
  error,
  onRetry,
  corretorSelecionado = null,
  onSelecionarCorretor,
}: CaptacoesChartProps) {
  const clicavel = Boolean(onSelecionarCorretor);

  function alternar(captacao: Captacao) {
    if (!onSelecionarCorretor) return;
    onSelecionarCorretor(
      captacao.corretorId === corretorSelecionado ? null : captacao.corretorId,
    );
  }
  const temDados = (data ?? []).some((c) => c.totalCaptacoes > 0);
  const chartHeight = Math.max(MIN_HEIGHT, (data?.length ?? 0) * ROW_HEIGHT);

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-base font-semibold text-foreground">
        Captações por corretor
      </h2>
      <Card className="vidro p-6">
        <p className="mb-4 text-[13px] text-faint">
          {clicavel
            ? "Imóveis captados por cada corretor — clique numa barra para filtrar a atividade"
            : "Imóveis captados por cada corretor"}
        </p>

        {loading ? (
          <ChartSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : !temDados ? (
          <p
            className="flex items-center justify-center text-sm text-faint"
            style={{ minHeight: MIN_HEIGHT }}
          >
            Nenhuma captação registrada ainda
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: 480, height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data ?? []}
                  layout="vertical"
                  margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="var(--border-primary)"
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border-primary)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="nomeCorretor"
                    width={120}
                    tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border-primary)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--bg-hover)" }}
                    content={ChartTooltip}
                  />
                  <Bar
                    dataKey="totalCaptacoes"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                    onClick={(_, indice) => {
                      const item = (data ?? [])[indice];
                      if (item) alternar(item);
                    }}
                    cursor={clicavel ? "pointer" : undefined}
                    isAnimationActive
                  >
                    {/* Uma Cell por corretor: só assim dá para esmaecer as
                        barras que não são a selecionada. */}
                    {(data ?? []).map((captacao) => {
                      const emFoco =
                        corretorSelecionado === null ||
                        corretorSelecionado === captacao.corretorId;
                      return (
                        <Cell
                          key={captacao.corretorId}
                          fill="var(--accent)"
                          fillOpacity={emFoco ? 1 : 0.28}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
