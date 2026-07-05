"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/services/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
    <main className="relative flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 transition-colors dark:bg-slate-950">
      {/* Alternador de tema no canto */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Marca */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-xl font-bold text-white shadow-sm">
            I
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            ImobSystem
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gestão imobiliária inteligente
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
            Entrar na sua conta
          </h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Informe suas credenciais para continuar.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              id="email"
              type="email"
              label="E-mail"
              placeholder="voce@imobiliaria.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={submitting}
            />
            <Input
              id="senha"
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
              disabled={submitting}
            />

            {/* Mensagem de erro amigável */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <Button type="submit" loading={submitting} className="mt-2 w-full">
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Link para o cadastro de nova imobiliária */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Não tem conta?{" "}
            <Link
              href="/registro"
              className="font-medium text-primary-600 transition hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Cadastre sua imobiliária
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} ImobSystem. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
