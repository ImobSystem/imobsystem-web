"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import { getErrorMessage } from "@/services/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { RegistroRequest, Usuario } from "@/types";

/** Campos do formulário: o payload da API + confirmação de senha (só no front). */
interface FormState extends RegistroRequest {
  confirmarSenha: string;
}

const emptyForm: FormState = {
  nomeImobiliaria: "",
  cnpj: "",
  emailImobiliaria: "",
  telefone: "",
  nomeAdmin: "",
  emailAdmin: "",
  senha: "",
  creci: "",
  confirmarSenha: "",
};

/** Erros por campo (chave = nome do campo). */
type FieldErrors = Partial<Record<keyof FormState, string>>;

// Regex simples de e-mail (suficiente para validação de front; o back valida de verdade).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valida o formulário e devolve os erros por campo (objeto vazio = tudo ok). */
function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};

  // Todos os campos são obrigatórios.
  (Object.keys(emptyForm) as (keyof FormState)[]).forEach((key) => {
    if (!form[key].trim()) errors[key] = "Campo obrigatório.";
  });

  if (form.emailImobiliaria && !EMAIL_REGEX.test(form.emailImobiliaria)) {
    errors.emailImobiliaria = "E-mail inválido.";
  }
  if (form.emailAdmin && !EMAIL_REGEX.test(form.emailAdmin)) {
    errors.emailAdmin = "E-mail inválido.";
  }
  if (form.senha && form.senha.length < 6) {
    errors.senha = "Mínimo de 6 caracteres.";
  }
  if (form.confirmarSenha && form.confirmarSenha !== form.senha) {
    errors.confirmarSenha = "As senhas não coincidem.";
  }

  return errors;
}

export default function RegistroPage() {
  const { loginComToken, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Se já estiver logado, não faz sentido ver o registro.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  /** Atualiza um campo e limpa o erro dele conforme o usuário digita. */
  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      // confirmarSenha é só do front — montamos o payload apenas com o contrato da API.
      const payload: RegistroRequest = {
        nomeImobiliaria: form.nomeImobiliaria,
        cnpj: form.cnpj,
        emailImobiliaria: form.emailImobiliaria,
        telefone: form.telefone,
        nomeAdmin: form.nomeAdmin,
        emailAdmin: form.emailAdmin,
        senha: form.senha,
        creci: form.creci,
      };
      const data = await authService.registro(payload);

      // 201 já devolve o token -> login automático (sem novo /auth/login).
      const usuario: Usuario = {
        email: data.email,
        perfil: data.perfil,
        imobiliariaId: data.imobiliariaId,
      };
      loginComToken(data.token, usuario);
      router.replace("/dashboard");
    } catch (err) {
      // Ex.: e-mail já cadastrado — a mensagem vem do backend via getErrorMessage.
      setApiError(getErrorMessage(err));
      setSubmitting(false);
    }
    // Em caso de sucesso não desligamos `submitting`: a navegação desmonta a tela.
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 transition-colors dark:bg-slate-950">
      {/* Alternador de tema no canto */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg">
        {/* Marca */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-xl font-bold text-white shadow-sm">
            I
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            ImobSystem
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Crie a conta da sua imobiliária
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            {/* Seção 1 — Dados da imobiliária */}
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Dados da imobiliária
              </h2>
              <Input
                id="nomeImobiliaria"
                label="Nome da imobiliária"
                value={form.nomeImobiliaria}
                onChange={(e) => setField("nomeImobiliaria", e.target.value)}
                error={fieldErrors.nomeImobiliaria}
                disabled={submitting}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="cnpj"
                  label="CNPJ"
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj}
                  onChange={(e) => setField("cnpj", e.target.value)}
                  error={fieldErrors.cnpj}
                  disabled={submitting}
                />
                <Input
                  id="telefone"
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => setField("telefone", e.target.value)}
                  error={fieldErrors.telefone}
                  disabled={submitting}
                />
              </div>
              <Input
                id="emailImobiliaria"
                type="email"
                label="E-mail da imobiliária"
                placeholder="contato@imobiliaria.com"
                value={form.emailImobiliaria}
                onChange={(e) => setField("emailImobiliaria", e.target.value)}
                error={fieldErrors.emailImobiliaria}
                disabled={submitting}
              />
            </section>

            {/* Seção 2 — Conta do administrador */}
            <section className="flex flex-col gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Sua conta de administrador
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="nomeAdmin"
                  label="Seu nome"
                  value={form.nomeAdmin}
                  onChange={(e) => setField("nomeAdmin", e.target.value)}
                  error={fieldErrors.nomeAdmin}
                  disabled={submitting}
                />
                <Input
                  id="creci"
                  label="CRECI"
                  value={form.creci}
                  onChange={(e) => setField("creci", e.target.value)}
                  error={fieldErrors.creci}
                  disabled={submitting}
                />
              </div>
              <Input
                id="emailAdmin"
                type="email"
                label="Seu e-mail"
                placeholder="voce@imobiliaria.com"
                value={form.emailAdmin}
                onChange={(e) => setField("emailAdmin", e.target.value)}
                error={fieldErrors.emailAdmin}
                autoComplete="email"
                disabled={submitting}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="senha"
                  type="password"
                  label="Senha"
                  placeholder="Mínimo 6 caracteres"
                  value={form.senha}
                  onChange={(e) => setField("senha", e.target.value)}
                  error={fieldErrors.senha}
                  autoComplete="new-password"
                  disabled={submitting}
                />
                <Input
                  id="confirmarSenha"
                  type="password"
                  label="Confirmar senha"
                  placeholder="••••••••"
                  value={form.confirmarSenha}
                  onChange={(e) => setField("confirmarSenha", e.target.value)}
                  error={fieldErrors.confirmarSenha}
                  autoComplete="new-password"
                  disabled={submitting}
                />
              </div>
            </section>

            {/* Erro vindo da API (ex.: e-mail já cadastrado) */}
            {apiError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                {apiError}
              </div>
            )}

            <Button type="submit" loading={submitting} className="w-full">
              {submitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 transition hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
