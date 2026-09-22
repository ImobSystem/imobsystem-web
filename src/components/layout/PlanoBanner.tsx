"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { planoService } from "@/services/planoService";

/** Dispensar vale só para a sessão atual — volta a avisar no próximo login. */
const CHAVE_DISPENSADO = "kaza:aviso-plano";

/** A partir de quantos dias restantes o aviso aparece. */
const DIAS_PARA_AVISAR = 5;

/**
 * Faixa de aviso de vencimento próximo, no topo da área logada.
 *
 * Só aparece nos últimos dias de um plano ATIVO — plano vencido não passa
 * por aqui: o 402 da API leva direto para /plano-expirado.
 *
 * A falha da busca é silenciosa de propósito: um aviso secundário não pode
 * virar erro na tela de quem só queria abrir o dashboard.
 */
export function PlanoBanner() {
  const { user } = useAuth();
  const isAdmin = user?.perfil === "ADMIN";
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    try {
      if (sessionStorage.getItem(CHAVE_DISPENSADO) === "1") return;
    } catch {
      // sessionStorage bloqueado (modo privado): segue e mostra o aviso.
    }

    planoService
      .getStatus()
      .then((status) => {
        if (!ativo) return;
        const { diasRestantes, statusPlano } = status;
        if (
          statusPlano === "ATIVO" &&
          diasRestantes > 0 &&
          diasRestantes <= DIAS_PARA_AVISAR
        ) {
          setMensagem(
            `Seu plano vence em ${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}. Renove para não perder acesso.`,
          );
        }
      })
      .catch(() => {});

    return () => {
      ativo = false;
    };
  }, []);

  if (!mensagem) return null;

  function dispensar() {
    try {
      sessionStorage.setItem(CHAVE_DISPENSADO, "1");
    } catch {
      // Sem storage o aviso volta no próximo carregamento — aceitável.
    }
    setMensagem(null);
  }

  return (
    <div
      role="status"
      className="sticky top-0 z-30 flex items-center justify-center gap-3 bg-warning-bg px-4 py-2 text-center"
    >
      <p className="text-[13px] font-medium text-warning">
        {mensagem}{" "}
        {/* Corretor vê o aviso, mas não o atalho: só o ADMIN assina. */}
        {isAdmin && (
          <Link
            href="/planos"
            className="font-semibold text-accent underline-offset-2 hover:underline"
          >
            Renovar agora
          </Link>
        )}
      </p>

      <button
        type="button"
        onClick={dispensar}
        aria-label="Dispensar aviso"
        className="shrink-0 rounded p-1 text-warning transition-opacity duration-150 hover:opacity-70"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
