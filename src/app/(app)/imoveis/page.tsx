"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImovelFormModal } from "@/components/imoveis/ImovelFormModal";
import { useAsyncList } from "@/hooks/useAsyncList";
import { imovelService } from "@/services/imovelService";
import { getErrorMessage } from "@/services/errors";
import { STATUS_IMOVEL_TONE } from "@/lib/format";
import {
  FINALIDADE_LABELS,
  STATUS_IMOVEL_LABELS,
  type Imovel,
} from "@/types";

export default function ImoveisPage() {
  const { data: imoveis, loading, error, reload } = useAsyncList(
    imovelService.list,
  );

  // Modal de formulário: `editing` decide entre criar (null) e editar (Imovel).
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Imovel | null>(null);

  // Exclusão com confirmação.
  const [toDelete, setToDelete] = useState<Imovel | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(imovel: Imovel) {
    setEditing(imovel);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await imovelService.remove(toDelete.id);
      setToDelete(null);
      reload();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Imóveis"
        subtitle="Gerencie os imóveis da imobiliária"
        action={<Button onClick={openCreate}>Cadastrar imóvel</Button>}
      />

      <Card className="overflow-hidden">
        {loading ? (
          <LoadingState label="Carregando imóveis..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : imoveis.length === 0 ? (
          <EmptyState
            title="Nenhum imóvel cadastrado"
            description="Comece cadastrando o primeiro imóvel da sua imobiliária."
            action={<Button onClick={openCreate}>Cadastrar imóvel</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Endereço</th>
                  <th className="px-5 py-3 font-medium">Área</th>
                  <th className="px-5 py-3 font-medium">Finalidade</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {imoveis.map((imovel) => (
                  <tr key={imovel.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {imovel.endereco}
                      <span className="block text-xs font-normal text-slate-400">
                        {imovel.CEP}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {imovel.area_m2} m²
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {FINALIDADE_LABELS[imovel.finalidade]}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_IMOVEL_TONE[imovel.statusImovel]}>
                        {STATUS_IMOVEL_LABELS[imovel.statusImovel]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(imovel)}
                          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setToDelete(imovel);
                          }}
                          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Cadastro / edição */}
      <ImovelFormModal
        open={formOpen}
        imovel={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          reload();
        }}
      />

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir imóvel"
        message={
          deleteError
            ? deleteError
            : `Tem certeza que deseja excluir "${toDelete?.endereco}"? Esta ação não pode ser desfeita.`
        }
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
