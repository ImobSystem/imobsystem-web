"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { clienteService } from "@/services/clienteService";
import { getErrorMessage } from "@/services/errors";
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

export function ClienteFormModal({ open, cliente, onClose, onSaved }: Props) {
  const isEdit = Boolean(cliente);
  const [form, setForm] = useState<ClienteInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
      setError(getErrorMessage(err));
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
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
          disabled={submitting}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="cpf"
            label="CPF"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            placeholder="000.000.000-00"
            required
            disabled={submitting}
          />
          <Input
            id="telefone"
            label="Telefone"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
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
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          disabled={submitting}
        />
        <Select
          id="tipoCliente"
          label="Tipo de cliente"
          value={form.tipoCliente}
          onChange={(e) =>
            setForm({ ...form, tipoCliente: e.target.value as TipoCliente })
          }
          options={TIPO_CLIENTE_OPTIONS.map((v) => ({
            value: v,
            label: TIPO_CLIENTE_LABELS[v],
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
            {isEdit ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
