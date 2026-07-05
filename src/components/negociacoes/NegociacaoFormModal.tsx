"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { negociacaoService } from "@/services/negociacaoService";
import { getErrorMessage } from "@/services/errors";
import {
  FINALIDADE_LABELS,
  FINALIDADE_OPTIONS,
  STATUS_NEGOCIO_LABELS,
  STATUS_NEGOCIO_OPTIONS,
  type Cliente,
  type Finalidade,
  type Imovel,
  type NegociacaoInput,
  type StatusNegocio,
} from "@/types";

interface Props {
  open: boolean;
  /** Listas para popular os selects de imóvel e cliente. */
  imoveis: Imovel[];
  clientes: Cliente[];
  onClose: () => void;
  onSaved: () => void;
}

/** Estado do formulário. imovelId/clienteId ficam como string ("" = não escolhido). */
interface FormState {
  finalidade: Finalidade;
  statusNegocio: StatusNegocio;
  dataInicio: string;
  dataFim: string;
  valor: string;
  imovelId: string;
  clienteId: string;
}

function initialForm(): FormState {
  return {
    finalidade: "VENDA",
    statusNegocio: "OPORTUNIDADE",
    dataInicio: new Date().toISOString().slice(0, 10), // hoje, YYYY-MM-DD
    dataFim: "",
    valor: "",
    imovelId: "",
    clienteId: "",
  };
}

export function NegociacaoFormModal({
  open,
  imoveis,
  clientes,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initialForm());
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.imovelId || !form.clienteId) {
      setError("Selecione um imóvel e um cliente.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: NegociacaoInput = {
        finalidade: form.finalidade,
        statusNegocio: form.statusNegocio,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim || null, // vazio -> null
        valor: Number(form.valor),
        imovelId: Number(form.imovelId),
        clienteId: Number(form.clienteId),
      };
      await negociacaoService.create(payload);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const semImoveis = imoveis.length === 0;
  const semClientes = clientes.length === 0;

  return (
    <Modal open={open} title="Nova negociação" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          id="imovelId"
          label="Imóvel"
          value={form.imovelId}
          onChange={(e) => setForm({ ...form, imovelId: e.target.value })}
          placeholder="Selecione um imóvel"
          options={imoveis.map((i) => ({
            value: String(i.id),
            label: i.endereco,
          }))}
          required
          disabled={submitting || semImoveis}
        />
        <Select
          id="clienteId"
          label="Cliente"
          value={form.clienteId}
          onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
          placeholder="Selecione um cliente"
          options={clientes.map((c) => ({
            value: String(c.id),
            label: c.nome,
          }))}
          required
          disabled={submitting || semClientes}
        />

        {(semImoveis || semClientes) && (
          <p className="text-xs text-amber-600">
            É preciso ter ao menos um imóvel e um cliente cadastrados para criar
            uma negociação.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="finalidade"
            label="Finalidade"
            value={form.finalidade}
            onChange={(e) =>
              setForm({ ...form, finalidade: e.target.value as Finalidade })
            }
            options={FINALIDADE_OPTIONS.map((v) => ({
              value: v,
              label: FINALIDADE_LABELS[v],
            }))}
            disabled={submitting}
          />
          <Select
            id="statusNegocio"
            label="Status"
            value={form.statusNegocio}
            onChange={(e) =>
              setForm({
                ...form,
                statusNegocio: e.target.value as StatusNegocio,
              })
            }
            options={STATUS_NEGOCIO_OPTIONS.map((v) => ({
              value: v,
              label: STATUS_NEGOCIO_LABELS[v],
            }))}
            disabled={submitting}
          />
        </div>

        <Input
          id="valor"
          label="Valor (R$)"
          type="number"
          min={0}
          step="0.01"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          required
          disabled={submitting}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="dataInicio"
            label="Data de início"
            type="date"
            value={form.dataInicio}
            onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
            required
            disabled={submitting}
          />
          <Input
            id="dataFim"
            label="Data de fim (opcional)"
            type="date"
            value={form.dataFim}
            onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
            disabled={submitting}
          />
        </div>

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
          <Button type="submit" loading={submitting} disabled={semImoveis || semClientes}>
            Criar negociação
          </Button>
        </div>
      </form>
    </Modal>
  );
}
