"use client";

import { useState, type ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ImobiliariaProvider } from "@/contexts/ImobiliariaContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PlanoBanner } from "@/components/layout/PlanoBanner";
import { ChatWidget } from "@/components/chat/ChatWidget";

/**
 * Layout compartilhado por toda a área logada (route group `(app)`).
 *
 * A sidebar é `position: fixed` com 248px sempre visíveis no desktop (vira
 * drawer no mobile) — por isso o wrapper do conteúdo não usa flexbox lado a
 * lado, só um `margin-left` do tamanho dela.
 *
 * `mobileNavOpen` mora aqui porque tanto o Header (botão hambúrguer) quanto
 * a Sidebar (drawer) precisam dele.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ProtectedRoute>
      <ImobiliariaProvider>
        <div className="min-h-screen bg-canvas transition-colors">
          <Sidebar
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
          />

          {/*
           * O chat vem ANTES do conteúdo de propósito. Ele e os modais estão
           * ambos em z-50, então quem decide a ordem de pintura é a posição
           * no DOM — assim um modal aberto cobre o chat, e não o contrário.
           */}
          <ChatWidget />

          <div className="flex min-h-screen flex-col md:ml-[248px]">
            {/*
             * O aviso fica dentro da coluna de conteúdo (e não `fixed` no
             * topo da janela) para não passar por cima da sidebar, que é
             * fixa à esquerda.
             */}
            <PlanoBanner />
            <Header onMenuClick={() => setMobileNavOpen(true)} />
            <main className="flex-1 overflow-x-hidden px-4 py-8 sm:px-8">
              <div className="mx-auto max-w-[1160px]">{children}</div>
            </main>
          </div>
        </div>
      </ImobiliariaProvider>
    </ProtectedRoute>
  );
}
