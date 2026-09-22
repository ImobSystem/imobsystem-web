"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/services/errors";

/*
 * E-mail usado nos links do rodapé (Suporte / Contato).
 * Trocar aqui quando o endereço oficial estiver definido.
 */
const EMAIL_CONTATO = "contato@kazasystem.com.br";

/* Estilo comum dos campos — só muda o padding lateral (por causa dos ícones). */
const CAMPO =
  "w-full rounded-xl border border-[var(--login-line)] bg-[var(--login-field)] py-3 " +
  "text-sm text-[var(--login-text)] placeholder:text-[var(--login-muted)] " +
  "outline-none transition [color-scheme:dark] " +
  "focus:border-[var(--login-accent)] focus:ring-2 focus:ring-[var(--login-ring)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/*
 * Tela de login.
 *
 * Diferente do resto do app, ela NÃO segue o tema claro/escuro: é uma capa
 * fixa escura, com o skyline em linhas ao fundo e o laranja da logo como cor
 * de ação. As cores vivem em `.login-shell` (globals.css) — por isso os campos
 * e o botão são locais, e não os componentes `Input`/`Button`, que carregam a
 * paleta roxa do sistema logado.
 */
export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [avisoSenha, setAvisoSenha] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Se o usuário já está logado (ex.: voltou para /login manualmente),
  // mandamos direto para o dashboard.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, senha);
      router.replace("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-shell relative flex min-h-screen flex-col overflow-hidden">
      {/* Fundo: clarão central + skyline repetido embaixo e espelhado no topo. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="login-glow absolute inset-0" />
        <div className="login-skyline login-skyline--top absolute inset-0" />
        <div className="login-skyline login-skyline--bottom absolute inset-0" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Marca */}
        <Image
          src="/logo-kazasystem.png"
          alt="Kaza System — Gestão Imobiliária"
          width={631}
          height={240}
          loading="eager"
          fetchPriority="high"
          className="mb-8 h-auto w-[300px] max-w-[85%]"
        />

        {/* Cartão do formulário */}
        <div className="w-full max-w-sm rounded-2xl border border-white/5 bg-[var(--login-card)]/85 p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
            {/* Usuário (o backend autentica por e-mail) */}
            <div className="relative">
              <label htmlFor="usuario" className="sr-only">
                Usuário
              </label>
              <span
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--login-muted)]"
              >
                <IconeUsuario />
              </span>
              <input
                id="usuario"
                type="email"
                inputMode="email"
                placeholder="Usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                disabled={submitting}
                className={CAMPO + " pl-11 pr-4"}
              />
            </div>

            {/* Senha, com botão de revelar */}
            <div className="relative">
              <label htmlFor="senha" className="sr-only">
                Senha
              </label>
              <span
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--login-muted)]"
              >
                <IconeCadeado />
              </span>
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
                disabled={submitting}
                className={CAMPO + " pl-11 pr-12"}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={mostrarSenha}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--login-muted)] transition hover:text-[var(--login-text)] focus:outline-none focus:ring-2 focus:ring-[var(--login-ring)]"
              >
                {mostrarSenha ? <IconeOlhoAberto /> : <IconeOlhoFechado />}
              </button>
            </div>

            {/*
             * Ainda não existe fluxo de redefinição de senha no backend; até lá,
             * o link explica o caminho em vez de levar a uma rota inexistente.
             */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setAvisoSenha((v) => !v)}
                className="rounded text-xs text-[var(--login-muted)] underline-offset-2 transition hover:text-[var(--login-text)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--login-ring)]"
              >
                Esqueceu a senha?
              </button>
            </div>

            {avisoSenha && (
              <p className="rounded-lg border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs leading-relaxed text-[var(--login-muted)]">
                Peça ao administrador da sua imobiliária para cadastrar uma nova
                senha em Configurações → Corretores.
              </p>
            )}

            {/* Mensagem de erro amigável */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--login-accent)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-[var(--login-accent-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--login-ring)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden
                />
              )}
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Único caminho para o cadastro de uma nova imobiliária. */}
        <p className="mt-5 text-center text-xs text-[var(--login-muted)]">
          Ainda não tem conta?{" "}
          <Link
            href="/registro"
            className="font-medium text-[var(--login-accent-soft)] transition hover:text-[var(--login-accent)]"
          >
            Cadastre sua imobiliária
          </Link>
        </p>
      </div>

      {/* Rodapé */}
      <footer className="relative pb-6 text-center">
        <div className="flex items-center justify-center gap-6 text-xs text-[var(--login-muted)]">
          <a
            href={`mailto:${EMAIL_CONTATO}?subject=Suporte%20Kaza%20System`}
            className="inline-flex items-center gap-1.5 transition hover:text-[var(--login-text)]"
          >
            <IconeSuporte />
            Suporte
          </a>
          <a
            href={`mailto:${EMAIL_CONTATO}`}
            className="inline-flex items-center gap-1.5 transition hover:text-[var(--login-text)]"
          >
            <IconeTelefone />
            Contato
          </a>
        </div>
        <p className="mt-3 text-[11px] text-[var(--login-muted)] opacity-70">
          © {new Date().getFullYear()} Kaza System. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}

/* ---------------------------------------------------------------
 * Ícones (traço, 24x24) — mesmo padrão usado no restante da UI.
 * --------------------------------------------------------------- */

function Traco({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function IconeUsuario() {
  return (
    <Traco>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </Traco>
  );
}

function IconeCadeado() {
  return (
    <Traco>
      <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </Traco>
  );
}

function IconeOlhoFechado() {
  return (
    <Traco>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A9.8 9.8 0 0 1 12 5c5 0 9 4.5 9 7 0 1-.7 2.3-1.9 3.5" />
      <path d="M6.6 6.8C4.3 8.3 3 10.4 3 12c0 2.5 4 7 9 7 1.7 0 3.2-.5 4.5-1.3" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Traco>
  );
}

function IconeOlhoAberto() {
  return (
    <Traco>
      <path d="M3 12c0-2.5 4-7 9-7s9 4.5 9 7-4 7-9 7-9-4.5-9-7z" />
      <circle cx="12" cy="12" r="3" />
    </Traco>
  );
}

function IconeSuporte() {
  return (
    <Traco>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M14.5 9.5 18 6M9.5 9.5 6 6m8.5 8.5L18 18M9.5 14.5 6 18" />
    </Traco>
  );
}

function IconeTelefone() {
  return (
    <Traco>
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z" />
    </Traco>
  );
}
