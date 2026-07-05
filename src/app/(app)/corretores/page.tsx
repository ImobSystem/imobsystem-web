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
import { corretorService } from "@/services/corretorService";
import { PERFIL_LABELS } from "@/types";

export default function CorretoresPage() {
  const { data: corretores, loading, error, reload } = useAsyncList(
    corretorService.list,
  );
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Corretores"
        subtitle="Equipe da imobiliária"
        action={
          <Button onClick={() => setFormOpen(true)}>Cadastrar corretor</Button>
        }
      />

      <Card className="overflow-hidden">
        {loading ? (
          <LoadingState label="Carregando corretores..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : corretores.length === 0 ? (
          <EmptyState
            title="Nenhum corretor cadastrado"
            description="Cadastre corretores para dar acesso à sua equipe."
            action={
              <Button onClick={() => setFormOpen(true)}>
                Cadastrar corretor
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">E-mail</th>
                  <th className="px-5 py-3 font-medium">CRECI</th>
                  <th className="px-5 py-3 font-medium">Perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {corretores.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {c.nome}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {c.email}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {c.creci}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={c.perfil === "ADMIN" ? "violet" : "blue"}>
                        {PERFIL_LABELS[c.perfil]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
