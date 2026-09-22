"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { LogoSection } from "@/components/configuracoes/LogoSection";
import { AdminOnly } from "@/components/AdminOnly";

/**
 * Configurações da imobiliária — exclusiva do ADMIN.
 *
 * O item nem aparece no menu do CORRETOR, mas a URL é digitável: por isso
 * a tela também se protege via <AdminOnly>, mandando quem não é ADMIN de
 * volta ao dashboard. (A API é a autoridade final — o PUT da logo já recusa
 * outros perfis.)
 */
export default function ConfiguracoesPage() {
  return (
    <AdminOnly>
      <PageHeader
        title="Configurações"
        subtitle="Personalize sua imobiliária"
      />
      <LogoSection />
    </AdminOnly>
  );
}
