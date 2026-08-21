"use client";

import { useState, type ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ImobiliariaProvider } from "@/contexts/ImobiliariaContext";
import { PageActionProvider } from "@/contexts/PageActionContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

/**
 * Layout compartilhado por toda a área logada (route group `(app)`).
 *
 * A sidebar agora é `position: fixed` (rail de 64px que expande sobre o
 * conteúdo no hover) — por isso o wrapper do conteúdo não usa mais flexbox
 * lado a lado, só um `margin-left` do tamanho do rail colapsado.
 *
 * `mobileNavOpen` mora aqui porque tanto o Header (botão hambúrguer) quanto
 * a Sidebar (drawer) precisam dele.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ProtectedRoute>
      <ImobiliariaProvider>
        <PageActionProvider>
          <div className="min-h-screen bg-base transition-colors">
            <Sidebar
              mobileOpen={mobileNavOpen}
              onMobileClose={() => setMobileNavOpen(false)}
            />
            <div className="flex min-h-screen flex-col md:ml-16">
              <Header onMenuClick={() => setMobileNavOpen(true)} />
              <main className="flex-1 overflow-x-hidden px-4 py-8 sm:px-8">
                <div className="mx-auto max-w-[1200px]">{children}</div>
              </main>
            </div>
          </div>
        </PageActionProvider>
      </ImobiliariaProvider>
    </ProtectedRoute>
  );
}
