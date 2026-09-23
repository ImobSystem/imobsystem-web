"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { planoService } from "@/services/planoService";
import { getErrorMessage } from "@/services/errors";
import type { Plano } from "@/types";

interface Oferta {
  id: Plano;
  nome: string;
  preco: string;
  features: string[];
  /** O do meio é o recomendado: borda accent + botão sólido. */
  destaque?: boolean;
}

const OFERTAS: Oferta[] = [
  {
    id: "BASICO",
    nome: "Básico",
    preco: "R$ 99,90",
    features: [
      "Até 50 imóveis",
      "Até 3 corretores",
      "Gestão de clientes",
      "Funil de negociações",
    ],
  },
  {
    id: "PROFISSIONAL",
    nome: "Profissional",
    preco: "R$ 199,90",
    destaque: true,
    features: [
      "Até 200 imóveis",
      "Até 10 corretores",
      "Tudo do Básico",
      "Assistente Imo (IA)",
      "Dashboard avançado",
    ],
  },
  {
    id: "PREMIUM",
    nome: "Premium",
    preco: "R$ 299,90",
    features: [
      "Imóveis ilimitados",
      "Corretores ilimitados",
      "Tudo do Profissional",
      "Suporte prioritário",
      "Relatórios avançados",
    ],
  },
];

const ICONE_CHECK = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/**
 * Escolha do plano.
 *
 * Fica fora do grupo `(app)`: é acessada tanto pelo bloqueio de plano
 * vencido (sem sidebar) quanto pelas Configurações.
 *
 * O pagamento não acontece aqui — assinar devolve um link do Asaas e nós
 * mandamos o usuário para lá. Quem confirma é o webhook, do outro lado.
 */
export default function PlanosPage() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.perfil === "ADMIN";

  // Guarda QUAL plano está sendo assinado: só aquele botão mostra spinner.
  const [assinando, setAssinando] = useState<Plano | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function assinar(plano: Plano) {
    if (assinando) return;
    setAssinando(plano);
    setErro(null);
    try {
      const { linkPagamento } = await planoService.assinar(plano);
      if (!linkPagamento) {
        // Sem link não há para onde navegar; melhor avisar que mandar o
        // usuário para uma URL vazia e deixá-lo achando que deu certo.
        setErro(
          "Assinatura criada, mas o link de pagamento não veio. Tente novamente.",
        );
        setAssinando(null);
        return;
      }
      // Sai do app para o checkout do Asaas; por isso não zeramos `assinando`
      // no sucesso — o botão fica travado até a navegação acontecer.
      window.location.href = linkPagamento;
    } catch (err) {
      setErro(getErrorMessage(err));
      setAssinando(null);
    }
  }

  return (
    <main className="min-h-screen bg-canvas px-4 py-12 sm:px-8 sm:py-[48px]">
      <div className="mx-auto max-w-[900px]">
        {isAuthenticated && (
          <Link
            href="/dashboard"
            className="mb-8 inline-flex items-center gap-1.5 text-[13px] text-faint transition-colors duration-150 hover:text-foreground"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Voltar ao sistema
          </Link>
        )}

        <h1 className="text-center text-[28px] font-bold tracking-tight text-foreground">
          Escolha seu plano
        </h1>
        <p className="mt-2 text-center text-sm text-faint">
          Todos os planos incluem 30 dias grátis pra testar
        </p>

        {/* Quem não é ADMIN vê os planos, mas não assina: o backend recusa. */}
        {isAuthenticated && !isAdmin && (
          <p className="mx-auto mt-6 max-w-[520px] rounded-lg border border-border bg-surface px-4 py-3 text-center text-[13px] text-muted-foreground">
            Só o administrador da imobiliária pode contratar ou trocar de
            plano. Peça a ele para renovar a assinatura.
          </p>
        )}

        {erro && (
          <div
            role="alert"
            className="mx-auto mt-6 max-w-[520px] rounded-lg border border-danger-bg bg-danger-bg px-4 py-3 text-center text-sm text-danger"
          >
            {erro}
          </div>
        )}

        <div className="mt-9 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {OFERTAS.map((oferta) => (
            <section
              key={oferta.id}
              className={
                "flex flex-col rounded-xl bg-surface p-8 transition-colors duration-200 " +
                (oferta.destaque
                  ? "border border-accent"
                  : "border border-border")
              }
            >
              {/* A linha do badge existe nos três cards (vazia nos demais):
                  sem ela, o card em destaque empurra nome e preço para
                  baixo e as três colunas desalinham. */}
              <div className="mb-4 h-[26px]">
                {oferta.destaque && (
                  <span className="inline-flex items-center rounded-full bg-accent-subtle px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                    Mais popular
                  </span>
                )}
              </div>

              <h2 className="text-xl font-semibold text-foreground">
                {oferta.nome}
              </h2>

              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-[36px] font-bold leading-none text-foreground">
                  {oferta.preco}
                </span>
                <span className="text-sm text-faint">/mês</span>
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {oferta.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 shrink-0 text-success">
                      {ICONE_CHECK}
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => assinar(oferta.id)}
                disabled={Boolean(assinando) || (isAuthenticated && !isAdmin)}
                className={
                  "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold " +
                  "transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 " +
                  (oferta.destaque
                    ? "bg-accent text-white hover:bg-[var(--accent-hover)]"
                    : "border border-border-strong text-foreground hover:bg-hover")
                }
              >
                {assinando === oferta.id && (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
                    aria-hidden
                  />
                )}
                {assinando === oferta.id ? "Abrindo pagamento..." : "Começar grátis"}
              </button>
            </section>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-faint">
          O pagamento é processado pelo Asaas. Você pode pagar com PIX, boleto
          ou cartão.
        </p>
      </div>
    </main>
  );
}
