"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Brand } from "@/components/layout/Brand";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PERFIL_LABELS } from "@/types";

/**
 * Header do topo da área logada: identidade do usuário + logout.
 * O título da página fica a cargo de cada tela (mantém o header enxuto).
 */
export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  // Iniciais para o avatar (primeira letra do email).
  const initial = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-surface px-6 py-3 transition-colors dark:border-slate-800">
      {/* Marca compacta (aparece no mobile, onde a sidebar some). */}
      <div className="min-w-0 md:hidden">
        <Brand />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {user?.email}
          </p>
          {user?.perfil && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {PERFIL_LABELS[user.perfil]}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
          {initial}
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
