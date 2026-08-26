"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Restringe o conteúdo ao perfil ADMIN.
 *
 * Usado em páginas cujo item de menu já some para o CORRETOR (ver Sidebar),
 * mas cuja URL ainda é digitável direto — a proteção real é sempre da API;
 * isto só evita que o CORRETOR veja a tela restrita antes do redirecionamento.
 */
export function AdminOnly({ children }: { children: ReactNode }) {
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

  return <>{children}</>;
}
