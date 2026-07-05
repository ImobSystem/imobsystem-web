"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Envolve páginas que exigem autenticação.
 *
 * Fluxo:
 *  - Enquanto o contexto restaura a sessão (`loading`), mostramos um spinner
 *    para não decidir cedo demais e redirecionar um usuário que, na verdade,
 *    está logado (token ainda sendo lido do localStorage).
 *  - Terminada a restauração, se não houver sessão, mandamos para /login.
 *  - Só renderizamos o conteúdo protegido quando há sessão confirmada.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-500"
          role="status"
          aria-label="Carregando"
        />
      </div>
    );
  }

  return <>{children}</>;
}
