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
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { useAsyncList } from "@/hooks/useAsyncList";
import { usePageAction } from "@/contexts/PageActionContext";
import { clienteService } from "@/services/clienteService";
import { getErrorMessage } from "@/services/errors";
import { TIPO_CLIENTE_TONE } from "@/lib/format";
import { TIPO_CLIENTE_LABELS, type Cliente } from "@/types";

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

export default function ClientesPage() {
  const { data: clientes, loading, error, reload } = useAsyncList(
    clienteService.list,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);

  const [toDelete, setToDelete] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(cliente: Cliente) {
    setEditing(cliente);
    setFormOpen(true);
  }

  usePageAction({ label: "Cadastrar cliente", onClick: openCreate });

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await clienteService.remove(toDelete.id);
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
        title="Clientes"
        subtitle="Compradores, locatários e proprietários"
        action={<Button size="sm" onClick={openCreate}>Cadastrar cliente</Button>}
      />

      {loading ? (
        <Card>
          <LoadingState label="Carregando clientes..." />
        </Card>
      ) : error ? (
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      ) : clientes.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum cliente cadastrado"
            description="Cadastre clientes para vinculá-los às negociações."
            action={<Button size="sm" onClick={openCreate}>Cadastrar cliente</Button>}
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
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">CPF</th>
                    <th className="px-4 py-3">E-mail</th>
                    <th className="px-4 py-3">Telefone</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clientes.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors duration-150 hover:bg-hover"
                    >
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {c.nome}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {c.cpf}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {c.email}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {c.telefone}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={TIPO_CLIENTE_TONE[c.tipoCliente]}>
                          {TIPO_CLIENTE_LABELS[c.tipoCliente]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <IconAction
                            label="Editar"
                            onClick={() => openEdit(c)}
                            icon={EDIT_ICON}
                          />
                          <IconAction
                            label="Excluir"
                            variant="danger"
                            onClick={() => {
                              setDeleteError(null);
                              setToDelete(c);
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
            {clientes.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="truncate text-sm font-medium text-foreground">
                  {c.nome}
                </p>
                <p className="truncate text-[13px] text-faint">{c.email}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <p>{c.cpf}</p>
                  <p>{c.telefone}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone={TIPO_CLIENTE_TONE[c.tipoCliente]}>
                    {TIPO_CLIENTE_LABELS[c.tipoCliente]}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <IconAction
                      label="Editar"
                      onClick={() => openEdit(c)}
                      icon={EDIT_ICON}
                    />
                    <IconAction
                      label="Excluir"
                      variant="danger"
                      onClick={() => {
                        setDeleteError(null);
                        setToDelete(c);
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

      <ClienteFormModal
        open={formOpen}
        cliente={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          reload();
        }}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir cliente"
        message={
          deleteError
            ? deleteError
            : `Tem certeza que deseja excluir "${toDelete?.nome}"? Esta ação não pode ser desfeita.`
        }
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
