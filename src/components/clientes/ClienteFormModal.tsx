"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { clienteService } from "@/services/clienteService";
import { getErrorMessage } from "@/services/errors";
import { useFormValidation, type ValidationRules } from "@/hooks/useFormValidation";
import { maskCPF, maskTelefone } from "@/lib/masks";
import {
  compose,
  cpfValido,
  email as emailRule,
  minLength,
  required,
  selectRequired,
  telefoneValido,
} from "@/lib/validators";
import {
  TIPO_CLIENTE_LABELS,
  TIPO_CLIENTE_OPTIONS,
  type Cliente,
  type ClienteInput,
  type TipoCliente,
} from "@/types";

interface Props {
  open: boolean;
  cliente?: Cliente | null;
  onClose: () => void;
  onSaved: () => void;
}

const emptyForm: ClienteInput = {
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  tipoCliente: "COMPRADOR",
};

const rules: ValidationRules<ClienteInput> = {
  nome: compose(required(), minLength(3)),
  cpf: compose(required(), cpfValido()),
  email: compose(required(), emailRule()),
  telefone: compose(required(), telefoneValido()),
  tipoCliente: selectRequired(),
};

export function ClienteFormModal({ open, cliente, onClose, onSaved }: Props) {
  const isEdit = Boolean(cliente);
  const [form, setForm] = useState<ClienteInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getError, handleBlur, handleChange, validateAll, setFieldError, reset, isSubmitDisabled } =
    useFormValidation<ClienteInput>(rules);

  useEffect(() => {
    if (!open) return;
    setError(null);
    reset();
    if (cliente) {
      setForm({
        nome: cliente.nome,
        cpf: cliente.cpf,
        email: cliente.email,
        telefone: cliente.telefone,
        tipoCliente: cliente.tipoCliente,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, cliente]);

  function setField<K extends keyof ClienteInput>(key: K, value: ClienteInput[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    handleChange(key, value, next);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateAll(form)) return;
    setSubmitting(true);
    setError(null);
    try {
      if (cliente) {
        await clienteService.update(cliente.id, form);
      } else {
        await clienteService.create(form);
      }
      onSaved();
    } catch (err) {
      const message = getErrorMessage(err);
      if (/cpf/i.test(message)) {
        setFieldError("cpf", message);
      } else if (/e-?mail/i.test(message)) {
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
      title={isEdit ? "Editar cliente" : "Cadastrar cliente"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="cpf"
            label="CPF"
            inputMode="numeric"
            value={form.cpf}
            onChange={(e) => setField("cpf", maskCPF(e.target.value))}
            onBlur={() => handleBlur("cpf", form.cpf, form)}
            error={getError("cpf")}
            placeholder="000.000.000-00"
            required
            disabled={submitting}
          />
          <Input
            id="telefone"
            label="Telefone"
            inputMode="numeric"
            value={form.telefone}
            onChange={(e) => setField("telefone", maskTelefone(e.target.value))}
            onBlur={() => handleBlur("telefone", form.telefone, form)}
            error={getError("telefone")}
            placeholder="(00) 00000-0000"
            required
            disabled={submitting}
          />
        </div>
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
        <Select
          id="tipoCliente"
          label="Tipo de cliente"
          value={form.tipoCliente}
          onChange={(e) => setField("tipoCliente", e.target.value as TipoCliente)}
          onBlur={() => handleBlur("tipoCliente", form.tipoCliente, form)}
          error={getError("tipoCliente")}
          options={TIPO_CLIENTE_OPTIONS.map((v) => ({
            value: v,
            label: TIPO_CLIENTE_LABELS[v],
          }))}
          disabled={submitting}
        />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <Button type="submit" loading={submitting} disabled={isSubmitDisabled}>
            {isEdit ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
