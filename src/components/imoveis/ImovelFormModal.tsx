"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { imovelService } from "@/services/imovelService";
import { getErrorMessage } from "@/services/errors";
import { useFormValidation, type ValidationRules } from "@/hooks/useFormValidation";
import { maskCEP } from "@/lib/masks";
import {
  cepValido,
  compose,
  minLength,
  positiveNumber,
  required,
  selectRequired,
} from "@/lib/validators";
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

const rules: ValidationRules<ImovelInput> = {
  endereco: compose(required(), minLength(5)),
  CEP: compose(required(), cepValido()),
  area_m2: positiveNumber(),
  finalidade: selectRequired(),
  statusImovel: selectRequired(),
};

export function ImovelFormModal({ open, imovel, onClose, onSaved }: Props) {
  const isEdit = Boolean(imovel);
  const [form, setForm] = useState<ImovelInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getError, handleBlur, handleChange, validateAll, reset, isSubmitDisabled } =
    useFormValidation<ImovelInput>(rules);

  function setField<K extends keyof ImovelInput>(key: K, value: ImovelInput[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    handleChange(key, value, next);
  }

  // Preenche (edição) ou limpa (criação) o formulário sempre que abrir.
  useEffect(() => {
    if (!open) return;
    setError(null);
    reset();
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
    if (!validateAll(form)) return;
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
          onChange={(e) => setField("endereco", e.target.value)}
          onBlur={() => handleBlur("endereco", form.endereco, form)}
          error={getError("endereco")}
          required
          disabled={submitting}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="cep"
            label="CEP"
            inputMode="numeric"
            value={form.CEP}
            onChange={(e) => setField("CEP", maskCEP(e.target.value))}
            onBlur={() => handleBlur("CEP", form.CEP, form)}
            error={getError("CEP")}
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
            onChange={(e) => setField("area_m2", Number(e.target.value))}
            onBlur={() => handleBlur("area_m2", form.area_m2, form)}
            error={getError("area_m2")}
            required
            disabled={submitting}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="finalidade"
            label="Finalidade"
            value={form.finalidade}
            onChange={(e) => setField("finalidade", e.target.value as Finalidade)}
            onBlur={() => handleBlur("finalidade", form.finalidade, form)}
            error={getError("finalidade")}
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
            onChange={(e) => setField("statusImovel", e.target.value as StatusImovel)}
            onBlur={() => handleBlur("statusImovel", form.statusImovel, form)}
            error={getError("statusImovel")}
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
