"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { corretorService } from "@/services/corretorService";
import { getErrorMessage } from "@/services/errors";
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

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} title="Cadastrar corretor" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="nome"
          label="Nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
          disabled={submitting}
        />
        <Input
          id="email"
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          disabled={submitting}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="senha"
            label="Senha"
            type="password"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            autoComplete="new-password"
            required
            disabled={submitting}
          />
          <Input
            id="creci"
            label="CRECI"
            value={form.creci}
            onChange={(e) => setForm({ ...form, creci: e.target.value })}
            required
            disabled={submitting}
          />
        </div>
        <Select
          id="perfil"
          label="Perfil"
          value={form.perfil}
          onChange={(e) =>
            setForm({ ...form, perfil: e.target.value as Perfil })
          }
          options={PERFIL_OPTIONS.map((v) => ({
            value: v,
            label: PERFIL_LABELS[v],
          }))}
          disabled={submitting}
        />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
          >
            Cancelar
          </button>
          <Button type="submit" loading={submitting}>
            Cadastrar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
