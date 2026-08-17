"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { LogoSection } from "@/components/configuracoes/LogoSection";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Configurações da imobiliária — exclusiva do ADMIN.
 *
 * O item nem aparece no menu do CORRETOR, mas a URL é digitável: por isso
 * a tela também se protege, mandando quem não é ADMIN de volta ao dashboard.
 * (A API é a autoridade final — o PUT da logo já recusa outros perfis.)
 */
export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.perfil === "ADMIN";

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, isAdmin, router]);

  // Evita piscar o conteúdo restrito durante o redirecionamento.
  if (!isAdmin) return null;

  return (
    <>
      <PageHeader
        title="Configurações"
        subtitle="Personalize sua imobiliária"
      />
      <LogoSection />
    </>
  );
}
