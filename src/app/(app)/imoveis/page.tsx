"use client";

import { useCallback, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IconAction } from "@/components/ui/IconAction";
import { FilterBar } from "@/components/ui/FilterBar";
import { TableCard, TableFooter, TH_CLASS, TD_CLASS } from "@/components/ui/Table";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Tabs } from "@/components/ui/Tabs";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImovelFormModal } from "@/components/imoveis/ImovelFormModal";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useDebounce } from "@/hooks/useDebounce";
import { imovelService } from "@/services/imovelService";
import { getErrorMessage } from "@/services/errors";
import { STATUS_IMOVEL_TONE, formatCurrency } from "@/lib/format";
import { buildThumbUrl } from "@/lib/foto";
import {
  FINALIDADE_LABELS,
  FINALIDADE_OPTIONS,
  STATUS_IMOVEL_LABELS,
  STATUS_IMOVEL_OPTIONS,
  TIPO_IMOVEL_LABELS,
  TIPO_IMOVEL_OPTIONS,
  type Finalidade,
  type Imovel,
  type StatusImovel,
  type TipoImovel,
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

/**
 * "Bairro, Cidade - UF" com o que estiver preenchido, ou `null` se nada foi
 * informado — imóveis cadastrados antes desses campos existirem caem aqui.
 */
function localizacao(imovel: Imovel): string | null {
  const cidadeUf = [imovel.cidade, imovel.estado].filter(Boolean).join(" - ");
  const partes = [imovel.bairro, cidadeUf].filter(Boolean);
  return partes.length > 0 ? partes.join(", ") : null;
}

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
    <div className="foto-vazia flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-faint">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  );
}

export default function ImoveisPage() {
  // Filtros: busca por endereço (debounced) + dois dropdowns, aplicados server-side.
  const [endereco, setEndereco] = useState("");
  const [status, setStatus] = useState<StatusImovel | "">("");
  const [finalidade, setFinalidade] = useState<Finalidade | "">("");
  const [tipo, setTipo] = useState<TipoImovel | "">("");
  const debouncedEndereco = useDebounce(endereco, 400);

  const fetchImoveis = useCallback(
    () =>
      imovelService.list({
        endereco: debouncedEndereco || undefined,
        status: status || undefined,
        finalidade: finalidade || undefined,
        tipo: tipo || undefined,
      }),
    [debouncedEndereco, status, finalidade, tipo],
  );
  const { data: imoveis, loading, error, reload } = useAsyncList(fetchImoveis);

  // Conta os filtros já digitados/selecionados (não espera o debounce) — o
  // botão "Limpar" e a mensagem de vazio reagem na hora.
  const activeFilterCount = [endereco, status, finalidade, tipo].filter(
    Boolean,
  ).length;

  function clearFilters() {
    setEndereco("");
    setStatus("");
    setFinalidade("");
    setTipo("");
  }

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
        tabs={
          <Tabs
            label="Filtrar por status"
            value={status}
            onChange={(v) => setStatus(v as StatusImovel | "")}
            options={[
              { value: "" as StatusImovel | "", label: "Todos" },
              ...STATUS_IMOVEL_OPTIONS.map((s) => ({
                value: s as StatusImovel | "",
                label: STATUS_IMOVEL_LABELS[s],
              })),
            ]}
          />
        }
        action={<Button size="sm" onClick={openCreate}>Cadastrar imóvel</Button>}
      />

      <FilterBar
        searchValue={endereco}
        onSearchChange={setEndereco}
        searchPlaceholder="Buscar por endereço..."
        activeCount={activeFilterCount}
        onClear={clearFilters}
      >
        <FilterSelect
          label="Tipo"
          value={tipo}
          onChange={(v) => setTipo(v as TipoImovel | "")}
          options={TIPO_IMOVEL_OPTIONS.map((t) => ({
            value: t,
            label: TIPO_IMOVEL_LABELS[t],
          }))}
          allLabel="Todos os tipos"
          className="w-[190px]"
        />
        <FilterSelect
          label="Finalidade"
          value={finalidade}
          onChange={(v) => setFinalidade(v as Finalidade | "")}
          options={FINALIDADE_OPTIONS.map((f) => ({
            value: f,
            label: FINALIDADE_LABELS[f],
          }))}
          allLabel="Todas as finalidades"
          className="w-[200px]"
        />
      </FilterBar>

      {loading ? (
        <Card className="vidro">
          <LoadingState label="Carregando imóveis..." />
        </Card>
      ) : error ? (
        <Card className="vidro">
          <ErrorState message={error} onRetry={reload} />
        </Card>
      ) : imoveis.length === 0 ? (
        <Card className="vidro">
          {activeFilterCount > 0 ? (
            <EmptyState
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              }
              title="Nenhum imóvel encontrado para esses filtros"
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-medium text-accent transition-colors duration-200 hover:text-[var(--accent-hover)]"
                >
                  Limpar filtros
                </button>
              }
            />
          ) : (
            <EmptyState
              title="Nenhum imóvel cadastrado"
              description="Comece cadastrando o primeiro imóvel da sua imobiliária."
              action={<Button size="sm" onClick={openCreate}>Cadastrar imóvel</Button>}
            />
          )}
        </Card>
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden md:block">
            <TableCard>
              <table className="w-full text-left">
                <thead className="border-b border-border bg-elevated">
                  <tr>
                    <th className={TH_CLASS}>Foto</th>
                    <th className={TH_CLASS}>Endereço</th>
                    <th className={TH_CLASS}>Tipo</th>
                    <th className={TH_CLASS}>Área</th>
                    <th className={TH_CLASS}>Valor</th>
                    <th className={TH_CLASS}>Finalidade</th>
                    <th className={TH_CLASS}>Status</th>
                    <th className={`${TH_CLASS} text-right`}>Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {imoveis.map((imovel) => (
                    <tr key={imovel.id} className="group linha-hover">
                      <td className={TD_CLASS}>
                        <FotoThumb imovel={imovel} />
                      </td>
                      <td className={TD_CLASS}>
                        {imovel.endereco}
                        <span className="block text-[13px] text-faint">
                          {/* Bairro/cidade quando houver; senão o CEP, como antes. */}
                          {localizacao(imovel) ?? imovel.CEP}
                        </span>
                      </td>
                      <td className={TD_CLASS}>
                        {imovel.tipoImovel ? (
                          <Badge>{TIPO_IMOVEL_LABELS[imovel.tipoImovel]}</Badge>
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                      </td>
                      <td className={TD_CLASS}>
                        {imovel.area_m2} m²
                      </td>
                      <td className={`${TD_CLASS} whitespace-nowrap`}>
                        {imovel.valor !== null ? (
                          formatCurrency(imovel.valor)
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                      </td>
                      <td className={TD_CLASS}>
                        {FINALIDADE_LABELS[imovel.finalidade]}
                      </td>
                      <td className={TD_CLASS}>
                        <Badge tone={STATUS_IMOVEL_TONE[imovel.statusImovel]}>
                          {STATUS_IMOVEL_LABELS[imovel.statusImovel]}
                        </Badge>
                      </td>
                      <td className={TD_CLASS}>
                        {/*
                         * Ações só aparecem no hover da linha — e no foco pelo
                         * teclado, senão sumiriam para quem navega sem mouse.
                         */}
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
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
            </TableCard>
            <TableFooter count={imoveis.length} singular="imóvel" plural="imóveis" />
          </div>

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
                      {localizacao(imovel) ?? imovel.CEP}
                    </p>
                    {imovel.valor !== null && (
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {formatCurrency(imovel.valor)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {imovel.tipoImovel && (
                    <Badge>{TIPO_IMOVEL_LABELS[imovel.tipoImovel]}</Badge>
                  )}
                  <span>{imovel.area_m2} m²</span>
                  <span aria-hidden className="text-faint">
                    ·
                  </span>
                  <span>{FINALIDADE_LABELS[imovel.finalidade]}</span>
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
