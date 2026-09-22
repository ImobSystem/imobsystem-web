"use client";

import type { ReactNode } from "react";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const traco = (path: ReactNode) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {path}
  </svg>
);

interface Feature {
  icone: ReactNode;
  titulo: string;
  descricao: string;
}

const FEATURES: Feature[] = [
  {
    // Home
    icone: traco(
      <>
        <path d="M3 9.5 12 3l9 6.5" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>,
    ),
    titulo: "Gestão de Imóveis",
    descricao: "Cadastre imóveis com fotos, filtre por status e finalidade.",
  },
  {
    // Users
    icone: traco(
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a6 6 0 0 1 12 0v2" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
        <path d="M22 21v-2a6 6 0 0 0-4-5.6" />
      </>,
    ),
    titulo: "Equipe de Corretores",
    descricao: "Acompanhe captações e performance de cada corretor.",
  },
  {
    // UserCircle
    icone: traco(
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="10" r="3" />
        <path d="M6.2 18.4a7 7 0 0 1 11.6 0" />
      </>,
    ),
    titulo: "Carteira de Clientes",
    descricao: "Compradores, locatários e proprietários organizados.",
  },
  {
    // TrendingUp
    icone: traco(
      <>
        <path d="m3 17 6-6 4 4 8-8" />
        <path d="M16 7h5v5" />
      </>,
    ),
    titulo: "Funil de Negociações",
    descricao: "Do primeiro contato ao fechamento, em kanban.",
  },
  {
    // Sparkles
    icone: traco(
      <>
        <path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8z" />
        <path d="M18.5 15.5 19.2 17.3 21 18l-1.8.7-.7 1.8-.7-1.8L16 18l1.8-.7z" />
      </>,
    ),
    titulo: "Assistente Imo",
    descricao: "Cadastre imóveis conversando. Sem formulários.",
  },
  {
    // BarChart3
    icone: traco(
      <>
        <path d="M3 3v18h18" />
        <path d="M8 17v-5M13 17V8M18 17v-8" />
      </>,
    ),
    titulo: "Dashboard Inteligente",
    descricao: "Métricas em tempo real e ranking de corretores.",
  },
];

export function LandingFeatures() {
  // Os cards entram em cascata, 100ms entre eles.
  const gridRef = useRevealOnScroll<HTMLDivElement>(100);

  return (
    <section className="mx-auto max-w-[1100px] px-5 py-[100px] sm:px-8">
      <h2 className="text-center text-[28px] font-bold tracking-tight text-[var(--ink-text)]">
        Tudo que sua imobiliária precisa
      </h2>

      <div
        ref={gridRef}
        className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <article
            key={feature.titulo}
            className="landing-reveal rounded-xl border border-[var(--landing-borda)] bg-[rgba(255,255,255,0.02)] p-7 backdrop-blur-[4px] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[var(--landing-borda-forte)] hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.9)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--ink-accent)_14%,transparent)] text-[var(--ink-accent)]">
              {feature.icone}
            </span>
            <h3 className="mt-4 text-[15px] font-semibold text-[var(--ink-text)]">
              {feature.titulo}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-text-secondary)]">
              {feature.descricao}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
