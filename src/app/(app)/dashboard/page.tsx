"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { CaptacoesChart } from "@/components/dashboard/CaptacoesChart";
import { useAuth } from "@/contexts/AuthContext";
import { imovelService } from "@/services/imovelService";
import { corretorService } from "@/services/corretorService";
import { clienteService } from "@/services/clienteService";
import { negociacaoService } from "@/services/negociacaoService";
import { getErrorMessage } from "@/services/errors";
import { useCountUp } from "@/hooks/useCountUp";
import {
  formatCurrency,
  formatDate,
  STATUS_NEGOCIO_DOT,
  STATUS_NEGOCIO_TONE,
} from "@/lib/format";
import {
  STATUS_NEGOCIO_LABELS,
  type Captacao,
  type Cliente,
  type Corretor,
  type Imovel,
  type Negociacao,
  type StatusNegocio,
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

/** Ícone dentro do quadrado dos cards pequenos. `accent` destaca em laranja. */
function MiniIcon({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] " +
        (accent ? "bg-accent-subtle text-accent" : "bg-elevated text-faint")
      }
    >
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
  const { user } = useAuth();
  const isAdmin = user?.perfil === "ADMIN";

  /** Corretor selecionado no gráfico de captações (null = todos). */
  const [corretorFiltro, setCorretorFiltro] = useState<number | null>(null);
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);
  // Seções que falharam ao carregar (ex.: ["Corretores"]).
  const [warnings, setWarnings] = useState<string[]>([]);
  // Preenchido só quando TODOS os endpoints falham (erro de tela cheia).
  const [fatalError, setFatalError] = useState<string | null>(null);

  // Captações por corretor — endpoint separado, só acessível pelo ADMIN.
  const [captacoes, setCaptacoes] = useState<Captacao[] | null>(null);
  const [captacoesLoading, setCaptacoesLoading] = useState(true);
  const [captacoesError, setCaptacoesError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setWarnings([]);
    setFatalError(null);

    // GET /corretores é exclusivo do ADMIN — o CORRETOR nem tenta (evitaria
    // um 403 disfarçado de "falha ao carregar").
    // allSettled (e não all): buscamos tudo em paralelo, mas o fracasso de um
    // endpoint não cancela os outros — aproveitamos o que deu certo.
    const [imoveisR, corretoresR, clientesR, negociacoesR] =
      await Promise.allSettled([
        imovelService.list(),
        isAdmin ? corretorService.list() : Promise.resolve<Corretor[]>([]),
        clienteService.list(),
        negociacaoService.list(),
      ]);

    const falhas: string[] = [];
    let ultimaMsg = "";
    if (imoveisR.status === "rejected") {
      falhas.push("Imóveis");
      ultimaMsg = getErrorMessage(imoveisR.reason);
    }
    if (isAdmin && corretoresR.status === "rejected") {
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
    // (O CORRETOR não busca Corretores, então sua "fonte total" é 3, não 4.)
    if (falhas.length === (isAdmin ? 4 : 3)) {
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
        isAdmin && corretoresR.status === "fulfilled"
          ? corretoresR.value.length
          : null,
    });
    setWarnings(falhas);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const loadCaptacoes = useCallback(async () => {
    setCaptacoesLoading(true);
    setCaptacoesError(null);
    try {
      const result = await corretorService.listarCaptacoes();
      setCaptacoes(result);
    } catch (err) {
      setCaptacoesError(getErrorMessage(err));
    } finally {
      setCaptacoesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadCaptacoes();
    }
  }, [isAdmin, loadCaptacoes]);

  if (fatalError) {
    return (
      <>
        <PageTitle isAdmin={isAdmin} />
        <Card>
          <ErrorState message={fatalError} onRetry={load} />
        </Card>
      </>
    );
  }

  // Mapas id->entidade para enriquecer os itens de atividade com endereço/nome.
  const imovelById = new Map((data.imoveis ?? []).map((i) => [i.id, i]));
  const clienteById = new Map((data.clientes ?? []).map((c) => [c.id, c]));

  /*
   * Filtro vindo do gráfico: clicar na barra de um corretor recorta a lista
   * de atividade. É filtro de verdade (Negociacao carrega `corretorId`), não
   * mock — e roda no cliente, sobre os dados já em memória, sem nova request.
   */
  const corretorEmFoco =
    corretorFiltro === null
      ? null
      : (captacoes ?? []).find((c) => c.corretorId === corretorFiltro) ?? null;

  const negociacoesVisiveis = (data.negociacoes ?? []).filter(
    (n) => corretorFiltro === null || n.corretorId === corretorFiltro,
  );

  // Últimas 5 negociações (id desc como proxy de "mais recentes").
  const recentes = [...negociacoesVisiveis]
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
      <PageTitle isAdmin={isAdmin} />

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

      {/*
       * Bento assimétrico: o card principal ocupa 2 colunas e 2 linhas à
       * esquerda; à direita, dois cards pequenos em cima e um largo embaixo.
       * É isso que come o espaço morto que sobrava ao lado do card grande.
       */}
      <div
        className="dash-entra grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-5"
        style={{ "--passo": 1 } as CSSProperties}
      >
        {/* Card grande — a métrica mais importante do negócio. */}
        <Card className="vidro dash-hover flex flex-col p-7 lg:col-span-2 lg:row-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-faint">
            {isAdmin ? "Negociações ativas" : "Minhas negociações ativas"}
          </p>
          {loading ? (
            <div className="mt-2 h-14 w-24 animate-pulse rounded bg-elevated" />
          ) : (
            <NumeroGrande
              valor={data.negociacoes === null ? null : ativas.length}
            />
          )}
          <p className="mt-3 text-[13px] text-faint">
            {data.negociacoes === null
              ? "Não foi possível carregar."
              : `${formatCurrency(valorEmCarteira)} em carteira`}
          </p>

          {data.negociacoes !== null && negociacoes.length > 0 && (
            <>
              <div className="mt-5">
                <BarraTaxa taxa={taxaGanho} />
                <p className="mt-2 text-[13px] text-faint">
                  {taxaGanho}% de taxa de ganho
                </p>
              </div>

              {/* Preenche a base do card com o recorte que sustenta a taxa
                  acima, em vez de deixar o espaço vazio. */}
              <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                <Recorte rotulo="Ganhas" valor={ganhas.length} destaque />
                <Recorte rotulo="Em aberto" valor={ativas.length} />
              </div>
            </>
          )}
        </Card>

        {/* Cards menores: dois em cima, um largo embaixo. */}
          <MiniStat
            label={isAdmin ? "Imóveis" : "Meus imóveis"}
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
          {isAdmin ? (
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
          ) : (
            // Destaque pessoal: "captações" do corretor = imóveis dele, que o
            // backend já filtra — mesma contagem do card "Meus imóveis" acima.
            <MiniStat
              label="Minhas captações"
              value={cardValue(data.imoveis?.length ?? null)}
              loading={loading}
              accent
              icon={
                <svg {...ICON_PROPS}>
                  <path d="M4 22V4" />
                  <path d="M4 4h14l-3 4 3 4H4" />
                </svg>
              }
            />
          )}
          {/* Card largo: fecha a linha de baixo do bento. */}
          <MiniStat
            label={isAdmin ? "Clientes" : "Meus clientes"}
            value={cardValue(data.clientes?.length ?? null)}
            loading={loading}
            className="lg:col-span-2"
            icon={
              <svg {...ICON_PROPS}>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
              </svg>
            }
          />
      </div>

      {/* Atividade recente — lista, não tabela. */}
      <div
        className="dash-entra mt-8"
        style={{ "--passo": 2 } as CSSProperties}
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold text-foreground">
            Atividade recente
          </h2>

          {/* Chip do filtro vindo do gráfico — e a saída dele. */}
          {corretorEmFoco && (
            <button
              type="button"
              onClick={() => setCorretorFiltro(null)}
              className="animate-fade-in inline-flex items-center gap-1.5 rounded-full bg-accent-subtle px-2.5 py-1 text-xs font-medium text-accent transition-opacity duration-150 hover:opacity-80"
            >
              {corretorEmFoco.nomeCorretor}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
              <span className="sr-only">Limpar filtro</span>
            </button>
          )}
        </div>
        <Card className="vidro overflow-hidden">
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
                    className="group flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-hover"
                  >
                    <PontoStatus status={n.statusNegocio} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {imovel?.endereco ?? `Imóvel #${n.imovelId}`}
                      </p>
                      <p className="truncate text-xs text-faint">
                        {cliente?.nome ?? `Cliente #${n.clienteId}`} ·{" "}
                        {formatDate(n.dataInicio)}
                      </p>
                    </div>

                    {/*
                     * Ações inline: ocultas por padrão, entram no hover da
                     * linha (e no foco pelo teclado, senão some para quem
                     * navega sem mouse).
                     */}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100">
                      <AcaoLinha
                        href="/negociacoes"
                        titulo="Abrir no funil"
                        icone={
                          <>
                            <path d="M15 3h6v6" />
                            <path d="M10 14 21 3" />
                            <path d="M21 14v7H3V3h7" />
                          </>
                        }
                      />
                      {isAdmin && (
                        <AcaoLinha
                          titulo="Filtrar por este corretor"
                          onClick={() => setCorretorFiltro(n.corretorId)}
                          icone={
                            <>
                              <path d="M3 5h18l-7 8v6l-4 2v-8z" />
                            </>
                          }
                        />
                      )}
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

      {isAdmin && (
        <div className="dash-entra" style={{ "--passo": 3 } as CSSProperties}>
          <CaptacoesChart
            data={captacoes}
            loading={captacoesLoading}
            error={captacoesError}
            onRetry={loadCaptacoes}
            corretorSelecionado={corretorFiltro}
            onSelecionarCorretor={setCorretorFiltro}
          />
        </div>
      )}
    </>
  );
}

/* Mesma tipografia do <PageHeader> das outras telas — aqui é local só
 * porque o dashboard não tem abas nem ação principal. */
function PageTitle({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="mb-6">
      <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-faint">
        {isAdmin ? "Visão geral da imobiliária" : "Visão geral do seu trabalho"}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  loading,
  icon,
  accent = false,
  className = "",
}: {
  label: string;
  value: number | string;
  loading: boolean;
  icon: ReactNode;
  /** Destaca o ícone em laranja — usado no card pessoal "Minhas captações". */
  accent?: boolean;
  className?: string;
}) {
  // "—" (métrica que não carregou) não conta; número conta.
  const numero = typeof value === "number" ? value : null;
  const animado = useCountUp(numero);

  return (
    <Card
      className={`vidro dash-hover flex items-center justify-between p-5 ${className}`}
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
          {label}
        </p>
        {loading ? (
          <div className="mt-1.5 h-7 w-10 animate-pulse rounded bg-elevated" />
        ) : (
          <p className={`mt-1.5 text-[28px] ${GRADIENTE_NUMERO}`}>
            {numero === null ? value : animado}
          </p>
        )}
      </div>
      <MiniIcon accent={accent}>{icon}</MiniIcon>
    </Card>
  );
}

/**
 * Número da métrica principal: peso extra e preenchimento em gradiente.
 *
 * O gradiente sai dos tokens de texto (e não de um branco fixo) para não
 * sumir no tema claro, onde a escala inverte.
 */
const GRADIENTE_NUMERO =
  "bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-muted)] " +
  "bg-clip-text font-extrabold tracking-tight text-transparent";

function NumeroGrande({ valor }: { valor: number | null }) {
  const animado = useCountUp(valor);
  return (
    <p className={`mt-2 text-6xl leading-none ${GRADIENTE_NUMERO}`}>
      {animado === null ? "—" : animado}
    </p>
  );
}

/** Barra da taxa de ganho — cresce de 0% até o valor real ao montar. */
function BarraTaxa({ taxa }: { taxa: number }) {
  const [largura, setLargura] = useState(0);

  useEffect(() => {
    // Sem animação: vai direto ao valor, sem depender de requestAnimationFrame.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLargura(taxa);
      return;
    }
    // Um frame com 0% antes de ir ao valor final: sem isso o browser pinta
    // já na largura certa e a transição não acontece.
    const frame = requestAnimationFrame(() => setLargura(taxa));
    return () => cancelAnimationFrame(frame);
  }, [taxa]);

  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-elevated"
      role="progressbar"
      aria-valuenow={taxa}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Taxa de ganho"
    >
      <div
        className="dash-barra h-full rounded-full bg-accent"
        style={{ width: `${largura}%` }}
      />
    </div>
  );
}

/** Negócios abertos ainda se mexem — só eles pulsam. */
const STATUS_EM_ANDAMENTO: StatusNegocio[] = [
  "OPORTUNIDADE",
  "EM_ATENDIMENTO",
  "VISITA_AGENDADA",
  "PROPOSTA",
];

/**
 * Ponto de status da linha.
 *
 * O halo pulsante fica só nos negócios em andamento: piscar num "Ganho" ou
 * "Perdido" sugeriria movimento onde o caso já fechou.
 */
function PontoStatus({ status }: { status: StatusNegocio }) {
  const cor = STATUS_NEGOCIO_DOT[status];
  const pulsa = STATUS_EM_ANDAMENTO.includes(status);

  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
      {pulsa && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${cor}`}
        />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${cor}`} />
    </span>
  );
}

/** Botão/atalho de ação que aparece no hover da linha de atividade. */
function AcaoLinha({
  titulo,
  icone,
  href,
  onClick,
}: {
  titulo: string;
  icone: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const classe =
    "flex h-7 w-7 items-center justify-center rounded-md text-faint " +
    "transition-colors duration-150 hover:bg-elevated hover:text-foreground " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]";

  const svg = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icone}
    </svg>
  );

  if (href) {
    return (
      <Link href={href} title={titulo} aria-label={titulo} className={classe}>
        {svg}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      aria-label={titulo}
      className={classe}
    >
      {svg}
    </button>
  );
}

/** Mini-recorte na base do card grande (ganhas / em aberto). */
function Recorte({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: number;
  destaque?: boolean;
}) {
  const animado = useCountUp(valor);
  return (
    <div className="rounded-lg border border-border bg-elevated/50 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wider text-faint">{rotulo}</p>
      <p
        className={
          "mt-0.5 text-lg font-bold " +
          (destaque ? "text-success" : "text-foreground")
        }
      >
        {animado}
      </p>
    </div>
  );
}
