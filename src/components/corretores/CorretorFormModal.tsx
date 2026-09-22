"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { corretorService } from "@/services/corretorService";
import { getErrorMessage } from "@/services/errors";
import { useFormValidation, type ValidationRules } from "@/hooks/useFormValidation";
import {
  compose,
  email as emailRule,
  minLength,
  required,
  selectRequired,
} from "@/lib/validators";
import {
  PERFIL_LABELS,
  PERFIL_OPTIONS,
  type Perfil,
} from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  nome: string;
  email: string;
  senha: string;
  creci: string;
  perfil: Perfil;
}

const emptyForm: FormState = {
  nome: "",
  email: "",
  senha: "",
  creci: "",
  perfil: "CORRETOR",
};

const rules: ValidationRules<FormState> = {
  nome: compose(required(), minLength(3)),
  email: compose(required(), emailRule()),
  senha: compose(required(), minLength(6)),
  creci: required(),
  perfil: selectRequired(),
};

/**
 * Cadastro de corretor. Diferente dos outros recursos, este endpoint ainda
 * exige `imobiliariaId` no corpo — preenchemos automaticamente com o do ADMIN
 * logado (extraído do JWT). Se o token não trouxer esse dado, bloqueamos o
 * envio e avisamos, para não mandar uma requisição fadada a falhar.
 */
export function CorretorFormModal({ open, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const imobiliariaId = user?.imobiliariaId ?? null;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getError, handleBlur, handleChange, validateAll, setFieldError, reset, isSubmitDisabled } =
    useFormValidation<FormState>(rules);

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setError(null);
      reset();
    }
  }, [open]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    handleChange(key, value, next);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateAll(form)) return;
    if (imobiliariaId === null) {
      setError(
        "Não foi possível identificar sua imobiliária no token. Refaça o login ou contate o suporte.",
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await corretorService.create({ ...form, imobiliariaId });
      onSaved();
    } catch (err) {
      const message = getErrorMessage(err);
      if (/e-?mail/i.test(message)) {
        setFieldError("email", message);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Cadastrar corretor"
      onClose={onClose}
      footer={
        <>
          <Button
            type="button"
            variant="neutral"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="corretor-form"
            loading={submitting}
            disabled={isSubmitDisabled}
          >
            Cadastrar
          </Button>
        </>
      }
    >
      <form id="corretor-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="nome"
          label="Nome"
          value={form.nome}
          onChange={(e) => setField("nome", e.target.value)}
          onBlur={() => handleBlur("nome", form.nome, form)}
          error={getError("nome")}
          required
          disabled={submitting}
        />
        <Input
          id="email"
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          onBlur={() => handleBlur("email", form.email, form)}
          error={getError("email")}
          required
          disabled={submitting}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="senha"
            label="Senha"
            type="password"
            value={form.senha}
            onChange={(e) => setField("senha", e.target.value)}
            onBlur={() => handleBlur("senha", form.senha, form)}
            error={getError("senha")}
            autoComplete="new-password"
            required
            disabled={submitting}
          />
          <Input
            id="creci"
            label="CRECI"
            value={form.creci}
            onChange={(e) => setField("creci", e.target.value)}
            onBlur={() => handleBlur("creci", form.creci, form)}
            error={getError("creci")}
            required
            disabled={submitting}
          />
        </div>
        <Select
          id="perfil"
          label="Perfil"
          value={form.perfil}
          onChange={(e) => setField("perfil", e.target.value as Perfil)}
          onBlur={() => handleBlur("perfil", form.perfil, form)}
          error={getError("perfil")}
          options={PERFIL_OPTIONS.map((v) => ({
            value: v,
            label: PERFIL_LABELS[v],
          }))}
          disabled={submitting}
        />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger-bg bg-danger-bg px-3.5 py-2.5 text-sm text-danger"
          >
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}
