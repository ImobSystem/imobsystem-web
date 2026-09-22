"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Tela de bloqueio por assinatura vencida.
 *
 * É para onde o interceptor do axios manda o usuário quando a API responde
 * 402. Fica FORA do grupo `(app)` de propósito: sem sidebar, sem header — o
 * sistema está bloqueado, e a única saída é renovar (ou sair da conta).
 *
 * A rota renderiza sem exigir sessão, mas assinar exige: por isso o caminho
 * daqui é `/planos`, que cuida de checar quem está logado.
 */
export default function PlanoExpiradoPage() {
  const { logout } = useAuth();
  const router = useRouter();

  function sair() {
    logout();
    router.replace("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-[500px] rounded-2xl border border-border bg-surface p-9 text-center">
        <span
          className="mx-auto flex h-12 w-12 items-center justify-center text-warning"
          aria-hidden
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
          Seu plano expirou
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Renove sua assinatura para continuar usando o Kaza System.
        </p>

        <Link
          href="/planos"
          className="mt-6 block w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_0_1px_var(--accent-glow-inner),0_0_20px_4px_var(--accent-glow-outer)]"
        >
          Ver planos e renovar
        </Link>

        <button
          type="button"
          onClick={sair}
          className="mt-4 text-[13px] text-faint transition-colors duration-150 hover:text-foreground hover:underline"
        >
          Sair da conta
        </button>
      </div>
    </main>
  );
}
