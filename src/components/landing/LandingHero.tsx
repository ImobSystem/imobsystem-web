"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

/**
 * Gerador pseudoaleatório com semente fixa.
 *
 * As partículas precisam sair IGUAIS no servidor e no cliente — `Math.random()`
 * aqui geraria posições diferentes nos dois lados e quebraria a hidratação.
 */
function prng(semente: number) {
  let estado = semente;
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
}

interface Particula {
  esquerda: number;
  topo: number;
  tamanho: number;
  opacidade: number;
  duracao: number;
  atraso: number;
}

const PARTICULAS: Particula[] = (() => {
  const aleatorio = prng(20260922);
  return Array.from({ length: 26 }, () => ({
    esquerda: aleatorio() * 100,
    topo: aleatorio() * 100,
    tamanho: 2 + aleatorio() * 2,
    opacidade: 0.1 + aleatorio() * 0.2,
    duracao: 15 + aleatorio() * 10,
    // Atraso negativo: cada partícula já começa num ponto diferente do ciclo.
    atraso: aleatorio() * -25,
  }));
})();

/** Deslocamento máximo, em px, de cada card no parallax. */
const PARALLAX_MAX = 15;

/** Alturas (%) das barras do card decorativo de captações. */
const BARRAS = [35, 52, 44, 70, 58, 100];

export function LandingHero() {
  const secaoRef = useRef<HTMLElement>(null);
  const slotsRef = useRef<HTMLDivElement[]>([]);

  // Parallax: os cards andam na direção oposta ao mouse.
  useEffect(() => {
    const secao = secaoRef.current;
    if (!secao) return;

    // Sem movimento pra quem pediu, e sem trabalho onde os cards nem aparecem.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    let frame = 0;

    function aoMover(evento: MouseEvent) {
      if (frame) return;
      // Um reposicionamento por quadro: mousemove dispara muito mais que isso.
      frame = requestAnimationFrame(() => {
        frame = 0;
        const area = secao!.getBoundingClientRect();
        const dx = (evento.clientX - area.left) / area.width - 0.5;
        const dy = (evento.clientY - area.top) / area.height - 0.5;

        slotsRef.current.forEach((slot, indice) => {
          if (!slot) return;
          // Cards alternados reagem menos: dá sensação de profundidade.
          const forca = PARALLAX_MAX * (indice % 2 === 0 ? 1 : 0.6);
          slot.style.setProperty("--parallax-x", `${-dx * 2 * forca}px`);
          slot.style.setProperty("--parallax-y", `${-dy * 2 * forca}px`);
        });
      });
    }

    secao.addEventListener("mousemove", aoMover);
    return () => {
      secao.removeEventListener("mousemove", aoMover);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function registrarSlot(indice: number) {
    return (elemento: HTMLDivElement | null) => {
      if (elemento) slotsRef.current[indice] = elemento;
    };
  }

  return (
    <section
      ref={secaoRef}
      className="relative overflow-hidden px-5 pb-[100px] pt-[140px] text-center sm:px-8"
    >
      {/* Fundo: halo do accent + partículas */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="landing-halo absolute inset-0" />
        {PARTICULAS.map((particula, indice) => (
          <span
            key={indice}
            className="landing-particula"
            style={
              {
                left: `${particula.esquerda}%`,
                top: `${particula.topo}%`,
                width: `${particula.tamanho}px`,
                height: `${particula.tamanho}px`,
                opacity: particula.opacidade,
                animationDuration: `${particula.duracao}s`,
                animationDelay: `${particula.atraso}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Cards decorativos — só no desktop largo, onde não disputam espaço
          com o texto central. */}
      <div aria-hidden className="pointer-events-none hidden lg:block">
        <div
          ref={registrarSlot(0)}
          className="landing-slot left-[4%] top-[26%]"
        >
          <div className="landing-float">
            <CardFlutuante>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-text-muted)]">
                Resumo
              </p>
              <Linha rotulo="Imóveis" valor="24" />
              <Linha rotulo="Clientes" valor="18" />
              <Linha rotulo="Negociações" valor="7" />
            </CardFlutuante>
          </div>
        </div>

        <div
          ref={registrarSlot(1)}
          className="landing-slot right-[5%] top-[22%]"
        >
          <div className="landing-float" style={{ animationDelay: "1.4s" }}>
            <CardFlutuante>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--ink-accent)]">{ICONE_SPARKLES}</span>
                <span className="text-[12px] font-semibold text-[var(--ink-text)]">
                  Imo
                </span>
              </div>
              <p className="mt-2 rounded-[10px_10px_10px_2px] bg-[var(--landing-vidro-forte)] px-2.5 py-2 text-[12px] leading-snug text-[var(--ink-text-secondary)]">
                Cadastrei o apto na Boa Viagem
              </p>
            </CardFlutuante>
          </div>
        </div>

        <div
          ref={registrarSlot(2)}
          className="landing-slot bottom-[14%] left-[9%]"
        >
          <div className="landing-float" style={{ animationDelay: "0.7s" }}>
            <CardFlutuante>
              <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--status-success)_18%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--status-success)]">
                Disponível
              </span>
              <p className="mt-2 text-[15px] font-bold text-[var(--ink-text)]">
                R$ 350.000
              </p>
            </CardFlutuante>
          </div>
        </div>

        <div
          ref={registrarSlot(3)}
          className="landing-slot bottom-[12%] right-[7%]"
        >
          <div className="landing-float" style={{ animationDelay: "2.1s" }}>
            <CardFlutuante>
              <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-text-muted)]">
                Captações
              </p>
              {/* Barrinhas decorativas — a última em destaque, como o mês atual. */}
              <div className="mt-2.5 flex h-12 items-end gap-1">
                {BARRAS.map((altura, indice) => (
                  <span
                    key={indice}
                    className={
                      "flex-1 rounded-sm " +
                      (indice === BARRAS.length - 1
                        ? "bg-[var(--ink-accent)]"
                        : "bg-[var(--landing-borda-forte)]")
                    }
                    style={{ height: `${altura}%` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-[var(--ink-text-muted)]">
                Últimos 6 meses
              </p>
            </CardFlutuante>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative mx-auto max-w-[760px]">
        <div
          className="landing-badge landing-sobe inline-flex items-center rounded-full px-3.5 py-1.5"
          style={{ animationDelay: "60ms" }}
        >
          <span className="text-[13px] font-medium text-[var(--ink-text-muted)]">
            Gestão imobiliária inteligente
          </span>
        </div>

        <h1 className="landing-sobe mt-6 text-[36px] font-bold leading-[1.1] tracking-tight text-[var(--ink-text)] sm:text-[56px]">
          Gerencie sua imobiliária
          <br />
          <span className="landing-gradiente">com inteligência</span>
        </h1>

        <p
          className="landing-sobe mx-auto mt-5 max-w-[550px] text-base leading-relaxed text-[var(--ink-text-secondary)] sm:text-[18px]"
          style={{ animationDelay: "200ms" }}
        >
          Imóveis, clientes, corretores e negociações em um só lugar — com
          assistente de IA que cadastra por você.
        </p>

        <div
          className="landing-sobe mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "340ms" }}
        >
          <Link
            href="/registro"
            className="w-full rounded bg-[var(--ink-accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_var(--landing-brilho)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_44px_var(--landing-brilho-forte)] sm:w-auto"
          >
            Começar grátis
          </Link>
          <Link
            href="/login"
            className="w-full rounded border border-[var(--landing-borda-forte)] bg-[var(--landing-vidro-forte)] px-8 py-3.5 text-sm font-medium text-[var(--ink-text)] backdrop-blur-[4px] transition-colors duration-200 hover:bg-[var(--landing-borda)] sm:w-auto"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Casca de vidro dos cards decorativos. */
function CardFlutuante({ children }: { children: ReactNode }) {
  return (
    <div className="landing-vidro w-[170px] rounded-xl p-4 text-left shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)]">
      {children}
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-[12px]">
      <span className="text-[var(--ink-text-muted)]">{rotulo}</span>
      <span className="font-semibold text-[var(--ink-text)]">{valor}</span>
    </div>
  );
}

const ICONE_SPARKLES = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8z" />
    <path d="M18.5 15.5 19.2 17.3 21 18l-1.8.7-.7 1.8-.7-1.8L16 18l1.8-.7z" />
  </svg>
);
