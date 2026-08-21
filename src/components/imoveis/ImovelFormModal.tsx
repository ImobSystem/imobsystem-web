"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FotoUpload } from "@/components/imoveis/FotoUpload";
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
  // Id do imóvel recém-criado nesta sessão do modal — assim que o POST volta,
  // trocamos a etapa "dados" pela etapa "fotos" sem fechar o modal.
  const [createdId, setCreatedId] = useState<number | null>(null);

  // Preenche (edição) ou limpa (criação) o formulário sempre que abrir.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setCreatedId(null);
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
            <Button type="submit" form="imovel-form" loading={submitting}>
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
