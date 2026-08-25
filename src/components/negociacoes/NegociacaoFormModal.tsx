"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { negociacaoService } from "@/services/negociacaoService";
import { getErrorMessage } from "@/services/errors";
import { useFormValidation, type ValidationRules } from "@/hooks/useFormValidation";
import {
  compose,
  optionalDateAfter,
  positiveNumberString,
  required,
  selectRequired,
  validDate,
} from "@/lib/validators";
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

const rules: ValidationRules<FormState> = {
  finalidade: selectRequired(),
  statusNegocio: selectRequired(),
  valor: compose(required(), positiveNumberString()),
  imovelId: selectRequired("Selecione um imóvel."),
  clienteId: selectRequired("Selecione um cliente."),
  dataInicio: compose(required(), validDate()),
  dataFim: optionalDateAfter<FormState>("dataInicio"),
};

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

  const { getError, handleBlur, handleChange, validateAll, reset, isSubmitDisabled } =
    useFormValidation<FormState>(rules);

  useEffect(() => {
    if (open) {
      setForm(initialForm());
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
    <Modal
      open={open}
      title="Nova negociação"
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
            form="negociacao-form"
            loading={submitting}
            disabled={semImoveis || semClientes || isSubmitDisabled}
          >
            Criar negociação
          </Button>
        </>
      }
    >
      <form
        id="negociacao-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <Select
          id="imovelId"
          label="Imóvel"
          value={form.imovelId}
          onChange={(e) => setField("imovelId", e.target.value)}
          onBlur={() => handleBlur("imovelId", form.imovelId, form)}
          error={getError("imovelId")}
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
          onChange={(e) => setField("clienteId", e.target.value)}
          onBlur={() => handleBlur("clienteId", form.clienteId, form)}
          error={getError("clienteId")}
          placeholder="Selecione um cliente"
          options={clientes.map((c) => ({
            value: String(c.id),
            label: c.nome,
          }))}
          required
          disabled={submitting || semClientes}
        />

        {(semImoveis || semClientes) && (
          <p className="rounded-lg bg-warning-bg px-3.5 py-2.5 text-sm text-warning">
            É preciso ter ao menos um imóvel e um cliente cadastrados para criar
            uma negociação.
          </p>
        )}

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
            id="statusNegocio"
            label="Status"
            value={form.statusNegocio}
            onChange={(e) => setField("statusNegocio", e.target.value as StatusNegocio)}
            onBlur={() => handleBlur("statusNegocio", form.statusNegocio, form)}
            error={getError("statusNegocio")}
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
          onChange={(e) => setField("valor", e.target.value)}
          onBlur={() => handleBlur("valor", form.valor, form)}
          error={getError("valor")}
          required
          disabled={submitting}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="dataInicio"
            label="Data de início"
            type="date"
            value={form.dataInicio}
            onChange={(e) => {
              setField("dataInicio", e.target.value);
              // dataFim depende de dataInicio — revalida se já tiver sido tocada.
              handleChange("dataFim", form.dataFim, { ...form, dataInicio: e.target.value });
            }}
            onBlur={() => handleBlur("dataInicio", form.dataInicio, form)}
            error={getError("dataInicio")}
            required
            disabled={submitting}
          />
          <Input
            id="dataFim"
            label="Data de fim (opcional)"
            type="date"
            value={form.dataFim}
            onChange={(e) => setField("dataFim", e.target.value)}
            onBlur={() => handleBlur("dataFim", form.dataFim, form)}
            error={getError("dataFim")}
            disabled={submitting}
          />
        </div>

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
