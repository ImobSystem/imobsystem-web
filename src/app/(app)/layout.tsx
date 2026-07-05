import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

/**
 * Layout compartilhado por toda a área logada (route group `(app)`).
 *
 * `(app)` é um route group: não aparece na URL, mas permite que todas as
 * telas internas (/dashboard, /imoveis, ...) herdem sidebar + header e a
 * proteção de autenticação de uma só vez.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background transition-colors">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-x-hidden px-6 py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
