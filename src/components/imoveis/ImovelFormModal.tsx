"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { imovelService } from "@/services/imovelService";
import { getErrorMessage } from "@/services/errors";
import {
  FINALIDADE_LABELS,
  FINALIDADE_OPTIONS,
  STATUS_IMOVEL_LABELS,
  STATUS_IMOVEL_OPTIONS,
  type Finalidade,
  type Imovel,
  type ImovelInput,
  type StatusImovel,
} from "@/types";

interface Props {
  open: boolean;
  /** Quando presente, o modal opera em modo edição (PUT); senão, criação (POST). */
  imovel?: Imovel | null;
  onClose: () => void;
  onSaved: () => void;
}

/** Estado inicial em branco para o modo de criação. */
const emptyForm: ImovelInput = {
  endereco: "",
  CEP: "",
  area_m2: 0,
  finalidade: "VENDA",
  statusImovel: "DISPONIVEL",
};

export function ImovelFormModal({ open, imovel, onClose, onSaved }: Props) {
  const isEdit = Boolean(imovel);
  const [form, setForm] = useState<ImovelInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preenche (edição) ou limpa (criação) o formulário sempre que abrir.
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (imovel) {
      setForm({
        endereco: imovel.endereco,
        CEP: imovel.CEP,
        area_m2: imovel.area_m2,
        finalidade: imovel.finalidade,
        statusImovel: imovel.statusImovel,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, imovel]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (imovel) {
        await imovelService.update(imovel.id, form);
      } else {
        await imovelService.create(form);
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
      title={isEdit ? "Editar imóvel" : "Cadastrar imóvel"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="endereco"
          label="Endereço"
          value={form.endereco}
          onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          required
          disabled={submitting}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="cep"
            label="CEP"
            value={form.CEP}
            onChange={(e) => setForm({ ...form, CEP: e.target.value })}
            placeholder="00000-000"
            required
            disabled={submitting}
          />
          <Input
            id="area"
            label="Área (m²)"
            type="number"
            min={0}
            step="0.01"
            value={form.area_m2 || ""}
            onChange={(e) =>
              setForm({ ...form, area_m2: Number(e.target.value) })
            }
            required
            disabled={submitting}
          />
        </div>
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
            id="statusImovel"
            label="Status"
            value={form.statusImovel}
            onChange={(e) =>
              setForm({
                ...form,
                statusImovel: e.target.value as StatusImovel,
              })
            }
            options={STATUS_IMOVEL_OPTIONS.map((v) => ({
              value: v,
              label: STATUS_IMOVEL_LABELS[v],
            }))}
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
          <Button type="submit" loading={submitting}>
            {isEdit ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
