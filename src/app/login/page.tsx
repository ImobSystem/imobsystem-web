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
    <main className="relative flex min-h-screen justify-center bg-base px-4 pt-[15vh] pb-12 transition-colors">
      {/* Alternador de tema no canto */}
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="h-fit w-full max-w-[400px]">
        {/* Marca — só texto, sem ícone/placeholder */}
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">
            ImobSystem
          </h1>
          <p className="mt-1.5 text-sm text-faint">Gestão imobiliária</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="mb-1 text-lg font-semibold text-foreground">
            Entrar na sua conta
          </h2>
          <p className="mb-6 text-sm text-faint">
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
                className="rounded-lg bg-danger-bg px-3.5 py-2.5 text-sm text-danger"
              >
                {error}
              </div>
            )}

            <Button type="submit" loading={submitting} className="mt-2 w-full">
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Link para o cadastro de nova imobiliária */}
          <p className="mt-6 text-center text-sm text-faint">
            Não tem conta?{" "}
            <Link
              href="/registro"
              className="font-medium text-accent transition-colors duration-200 hover:text-[var(--accent-hover)]"
            >
              Cadastre sua imobiliária
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-faint">
          © {new Date().getFullYear()} ImobSystem. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
