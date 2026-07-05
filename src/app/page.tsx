"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Rota raiz ("/"): apenas encaminha o usuário conforme o estado da sessão.
 *  - autenticado  -> /dashboard
 *  - anônimo      -> /login
 */
export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [loading, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-500"
        role="status"
        aria-label="Carregando"
      />
    </div>
  );
}
