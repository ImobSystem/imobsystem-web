"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePageActionContext } from "@/contexts/PageActionContext";
import { PERFIL_LABELS } from "@/types";

/** Rótulo do breadcrumb por rota — só o nível atual, sem repetir o título da página. */
const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/imoveis": "Imóveis",
  "/corretores": "Corretores",
  "/clientes": "Clientes",
  "/negociacoes": "Negociações",
  "/configuracoes": "Configurações",
};

function useBreadcrumb(): string {
  const pathname = usePathname();
  const base = "/" + pathname.split("/")[1];
  return ROUTE_LABELS[base] ?? "";
}

interface Props {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: Props) {
  const { user, logout } = useAuth();
  const { action } = usePageActionContext();
  const router = useRouter();
  const breadcrumb = useBreadcrumb();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  // Fecha o dropdown do avatar no clique fora ou no ESC.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initial = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-base px-8 transition-colors duration-200">
      <div className="flex min-w-0 items-center gap-4">
        {/* Hambúrguer — só no mobile, abre a sidebar como drawer. */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded text-faint transition-colors duration-150 hover:bg-hover hover:text-muted-foreground md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb contextual — não repete o título da página. */}
        <p className="truncate text-[13px] font-medium text-faint">{breadcrumb}</p>
      </div>

      <div className="flex items-center gap-3">
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="rounded bg-accent px-3.5 py-1.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_0_1px_var(--accent-glow-inner),0_0_16px_var(--accent-glow-outer)] active:scale-[0.97]"
          >
            {action.label}
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu do usuário"
            aria-expanded={menuOpen}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-accent transition-transform duration-150 active:scale-95"
          >
            {initial}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="animate-scale-in absolute right-0 top-[calc(100%+8px)] w-56 rounded-xl border border-border bg-surface p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            >
              <div className="px-2.5 py-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.email}
                </p>
                {user?.perfil && (
                  <p className="text-xs text-faint">{PERFIL_LABELS[user.perfil]}</p>
                )}
              </div>
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                onClick={handleLogout}
                role="menuitem"
                className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-hover hover:text-danger"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
