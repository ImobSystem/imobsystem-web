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
import { CorretorFormModal } from "@/components/corretores/CorretorFormModal";
import { useAsyncList } from "@/hooks/useAsyncList";
import { usePageAction } from "@/contexts/PageActionContext";
import { corretorService } from "@/services/corretorService";
import { PERFIL_LABELS } from "@/types";

export default function CorretoresPage() {
  const { data: corretores, loading, error, reload } = useAsyncList(
    corretorService.list,
  );
  const [formOpen, setFormOpen] = useState(false);

  usePageAction({
    label: "Cadastrar corretor",
    onClick: () => setFormOpen(true),
  });

  return (
    <>
      <PageHeader
        title="Corretores"
        subtitle="Equipe da imobiliária"
        action={
          <Button size="sm" onClick={() => setFormOpen(true)}>Cadastrar corretor</Button>
        }
      />

      {loading ? (
        <Card>
          <LoadingState label="Carregando corretores..." />
        </Card>
      ) : error ? (
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      ) : corretores.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum corretor cadastrado"
            description="Cadastre corretores para dar acesso à sua equipe."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                Cadastrar corretor
              </Button>
            }
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
                    <th className="px-4 py-3">E-mail</th>
                    <th className="px-4 py-3">CRECI</th>
                    <th className="px-4 py-3">Perfil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {corretores.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors duration-150 hover:bg-hover"
                    >
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {c.nome}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {c.email}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {c.creci}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={c.perfil === "ADMIN" ? "violet" : "blue"}>
                          {PERFIL_LABELS[c.perfil]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile: cards empilhados */}
          <div className="flex flex-col gap-2 md:hidden">
            {corretores.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-foreground">
                    {c.nome}
                  </p>
                  <Badge tone={c.perfil === "ADMIN" ? "violet" : "blue"}>
                    {PERFIL_LABELS[c.perfil]}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-[13px] text-faint">
                  {c.email}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  CRECI {c.creci}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <CorretorFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          reload();
        }}
      />
    </>
  );
}
