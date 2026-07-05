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
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { useAsyncList } from "@/hooks/useAsyncList";
import { clienteService } from "@/services/clienteService";
import { getErrorMessage } from "@/services/errors";
import { TIPO_CLIENTE_TONE } from "@/lib/format";
import { TIPO_CLIENTE_LABELS, type Cliente } from "@/types";

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
        action={<Button onClick={openCreate}>Cadastrar cliente</Button>}
      />

      <Card className="overflow-hidden">
        {loading ? (
          <LoadingState label="Carregando clientes..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : clientes.length === 0 ? (
          <EmptyState
            title="Nenhum cliente cadastrado"
            description="Cadastre clientes para vinculá-los às negociações."
            action={<Button onClick={openCreate}>Cadastrar cliente</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">CPF</th>
                  <th className="px-5 py-3 font-medium">E-mail</th>
                  <th className="px-5 py-3 font-medium">Telefone</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clientes.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {c.nome}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {c.cpf}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {c.email}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {c.telefone}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={TIPO_CLIENTE_TONE[c.tipoCliente]}>
                        {TIPO_CLIENTE_LABELS[c.tipoCliente]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setToDelete(c);
                          }}
                          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
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
