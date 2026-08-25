"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IconAction } from "@/components/ui/IconAction";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImovelFormModal } from "@/components/imoveis/ImovelFormModal";
import { useAsyncList } from "@/hooks/useAsyncList";
import { usePageAction } from "@/contexts/PageActionContext";
import { imovelService } from "@/services/imovelService";
import { getErrorMessage } from "@/services/errors";
import { STATUS_IMOVEL_TONE } from "@/lib/format";
import { buildThumbUrl } from "@/lib/foto";
import {
  FINALIDADE_LABELS,
  STATUS_IMOVEL_LABELS,
  type Imovel,
} from "@/types";

const EDIT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const DELETE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

function FotoThumb({ imovel }: { imovel: Imovel }) {
  if (imovel.fotos.length > 0) {
    return (
      <img
        src={buildThumbUrl(imovel.fotos[0])}
        alt={`Foto de ${imovel.endereco}`}
        className="h-10 w-10 shrink-0 rounded-md object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-elevated text-faint">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  );
}

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

  usePageAction({ label: "Cadastrar imóvel", onClick: openCreate });

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
        action={<Button size="sm" onClick={openCreate}>Cadastrar imóvel</Button>}
      />

      {loading ? (
        <Card>
          <LoadingState label="Carregando imóveis..." />
        </Card>
      ) : error ? (
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      ) : imoveis.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum imóvel cadastrado"
            description="Comece cadastrando o primeiro imóvel da sua imobiliária."
            action={<Button size="sm" onClick={openCreate}>Cadastrar imóvel</Button>}
          />
        </Card>
      ) : (
        <>
          {/* Desktop: tabela */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border bg-elevated text-[11px] font-semibold uppercase tracking-wider text-faint">
                  <tr>
                    <th className="px-4 py-3">Foto</th>
                    <th className="px-4 py-3">Endereço</th>
                    <th className="px-4 py-3">Área</th>
                    <th className="px-4 py-3">Finalidade</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {imoveis.map((imovel) => (
                    <tr
                      key={imovel.id}
                      className="transition-colors duration-150 hover:bg-hover"
                    >
                      <td className="px-4 py-3.5">
                        <FotoThumb imovel={imovel} />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {imovel.endereco}
                        <span className="block text-[13px] text-faint">
                          {imovel.CEP}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {imovel.area_m2} m²
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {FINALIDADE_LABELS[imovel.finalidade]}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={STATUS_IMOVEL_TONE[imovel.statusImovel]}>
                          {STATUS_IMOVEL_LABELS[imovel.statusImovel]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <IconAction
                            label="Editar"
                            onClick={() => openEdit(imovel)}
                            icon={EDIT_ICON}
                          />
                          <IconAction
                            label="Excluir"
                            variant="danger"
                            onClick={() => {
                              setDeleteError(null);
                              setToDelete(imovel);
                            }}
                            icon={DELETE_ICON}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile: cards empilhados */}
          <div className="flex flex-col gap-2 md:hidden">
            {imoveis.map((imovel) => (
              <div
                key={imovel.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-center gap-3">
                  <FotoThumb imovel={imovel} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {imovel.endereco}
                    </p>
                    <p className="truncate text-[13px] text-faint">
                      {imovel.CEP}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <p>{imovel.area_m2} m²</p>
                  <p>{FINALIDADE_LABELS[imovel.finalidade]}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone={STATUS_IMOVEL_TONE[imovel.statusImovel]}>
                    {STATUS_IMOVEL_LABELS[imovel.statusImovel]}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <IconAction
                      label="Editar"
                      onClick={() => openEdit(imovel)}
                      icon={EDIT_ICON}
                    />
                    <IconAction
                      label="Excluir"
                      variant="danger"
                      onClick={() => {
                        setDeleteError(null);
                        setToDelete(imovel);
                      }}
                      icon={DELETE_ICON}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
