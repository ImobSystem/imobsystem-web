"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      {/* Marca compacta (aparece no mobile, onde a sidebar some). */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
          I
        </div>
        <span className="font-semibold text-slate-900">ImobSystem</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{user?.email}</p>
          {user?.perfil && (
            <p className="text-xs text-slate-500">
              {PERFIL_LABELS[user.perfil]}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
          {initial}
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
