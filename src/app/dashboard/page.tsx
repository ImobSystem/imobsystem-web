"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Barra superior */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              I
            </div>
            <span className="font-semibold text-slate-900">ImobSystem</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {user?.perfil}
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">
            Bem-vindo, {user?.email}
          </h1>
          <p className="mt-2 text-slate-500">
            Você está autenticado. Este é um placeholder — em breve aqui virão
            os módulos de Imóveis, Clientes e Negociações.
          </p>

          <div className="mt-6">
            <Button onClick={handleLogout}>Fazer logout</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
