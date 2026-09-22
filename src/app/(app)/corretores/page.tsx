"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TableCard, TableFooter, TH_CLASS, TD_CLASS } from "@/components/ui/Table";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/States";
import { CorretorFormModal } from "@/components/corretores/CorretorFormModal";
import { AdminOnly } from "@/components/AdminOnly";
import { useAsyncList } from "@/hooks/useAsyncList";
import { useAuth } from "@/contexts/AuthContext";
import { corretorService } from "@/services/corretorService";
import { PERFIL_LABELS, type Corretor } from "@/types";

/** Nome do corretor: leva ao perfil dele. Sublinha só no hover. */
const NOME_LINK =
  "font-medium text-foreground no-underline transition-colors duration-150 " +
  "hover:text-accent hover:underline";

/**
 * Gestão da equipe — exclusiva do ADMIN. O item nem aparece no menu do
 * CORRETOR, mas a URL é digitável: por isso a tela também se protege via
 * <AdminOnly>. (A API é a autoridade final — o backend já recusa o cadastro
 * de corretor por outros perfis.)
 *
 * `isAdmin` também guarda o fetch e o atalho "Cadastrar corretor" do Header:
 * <AdminOnly> só esconde o conteúdo renderizado, mas os hooks da página
 * rodam antes disso — sem essa checagem, o CORRETOR chegaria a chamar
 * GET /corretores e a ver o botão piscar no Header antes do redirect.
 */
export default function CorretoresPage() {
  const { user } = useAuth();
  const isAdmin = user?.perfil === "ADMIN";

  const fetchCorretores = useCallback(
    () => (isAdmin ? corretorService.list() : Promise.resolve<Corretor[]>([])),
    [isAdmin],
  );
  const { data: corretores, loading, error, reload } =
    useAsyncList(fetchCorretores);
  const [formOpen, setFormOpen] = useState(false);


  return (
    <AdminOnly>
      <PageHeader
        title="Corretores"
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
          <div className="hidden md:block">
            <TableCard>
              <table className="w-full text-left">
                <thead className="border-b border-border bg-elevated">
                  <tr>
                    <th className={TH_CLASS}>Nome</th>
                    <th className={TH_CLASS}>E-mail</th>
                    <th className={TH_CLASS}>CRECI</th>
                    <th className={TH_CLASS}>Perfil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {corretores.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors duration-150 hover:bg-hover"
                    >
                      <td className={TD_CLASS}>
                        <Link href={`/corretores/${c.id}`} className={NOME_LINK}>
                          {c.nome}
                        </Link>
                      </td>
                      <td className={TD_CLASS}>
                        {c.email}
                      </td>
                      <td className={TD_CLASS}>
                        {c.creci}
                      </td>
                      <td className={TD_CLASS}>
                        <Badge tone={c.perfil === "ADMIN" ? "violet" : "blue"}>
                          {PERFIL_LABELS[c.perfil]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
            <TableFooter count={corretores.length} singular="corretor" plural="corretores" />
          </div>

          {/* Mobile: cards empilhados */}
          <div className="flex flex-col gap-2 md:hidden">
            {corretores.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/corretores/${c.id}`}
                    className={`truncate text-sm font-medium ${NOME_LINK}`}
                  >
                    {c.nome}
                  </Link>
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
    </AdminOnly>
  );
}
