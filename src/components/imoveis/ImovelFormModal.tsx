"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FotoUpload } from "@/components/imoveis/FotoUpload";
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
  // Id do imóvel recém-criado nesta sessão do modal — assim que o POST volta,
  // trocamos a etapa "dados" pela etapa "fotos" sem fechar o modal.
  const [createdId, setCreatedId] = useState<number | null>(null);

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
    setCreatedId(null);
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
        onSaved();
      } else {
        // Não fecha o modal: o POST devolve o id, que a etapa de fotos precisa.
        const criado = await imovelService.create(form);
        setCreatedId(criado.id);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // Em edição, o id sempre existe; em criação, só depois do POST bem-sucedido.
  const idParaFotos = imovel?.id ?? createdId;
  const mostrarFotos = isEdit || createdId !== null;
  const mostrarForm = isEdit || createdId === null;

  return (
    <Modal
      open={open}
      title={isEdit ? "Editar imóvel" : "Cadastrar imóvel"}
      onClose={onClose}
      maxWidthClass={mostrarFotos ? "max-w-2xl" : "max-w-lg"}
      footer={
        mostrarForm ? (
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
              form="imovel-form"
              loading={submitting}
              disabled={isSubmitDisabled}
            >
              {isEdit ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </>
        ) : (
          <Button onClick={onSaved}>Concluir</Button>
        )
      }
    >
      {/* Etapa "dados": sempre visível em edição; em criação, só até o POST. */}
      {mostrarForm && (
        <form
          id="imovel-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
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
              className="rounded-lg border border-danger-bg bg-danger-bg px-3.5 py-2.5 text-sm text-danger"
            >
              {error}
            </div>
          )}
        </form>
      )}

      {/* Etapa "fotos": em edição some junto do form; em criação, aparece
          sozinha depois que o imóvel é criado. */}
      {mostrarFotos && idParaFotos && (
        <div className={isEdit ? "mt-6 border-t border-border pt-6" : ""}>
          <FotoUpload imovelId={idParaFotos} />
        </div>
      )}
    </Modal>
  );
}
