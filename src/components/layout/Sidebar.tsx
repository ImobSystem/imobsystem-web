"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Brand } from "@/components/layout/Brand";
import { PERFIL_LABELS } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  /** Restrito ao ADMIN — some da sidebar do CORRETOR. */
  adminOnly?: boolean;
}

/* Ícones inline (sem dependências externas), 18px — traço fino, como na referência. */
const icon = (path: ReactNode) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {path}
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: icon(
      <>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </>,
    ),
  },
  {
    href: "/imoveis",
    label: "Imóveis",
    icon: icon(
      <>
        <path d="M3 9.5 12 3l9 6.5" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>,
    ),
  },
  {
    href: "/corretores",
    label: "Corretores",
    adminOnly: true,
    icon: icon(
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a6 6 0 0 1 12 0v2" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
        <path d="M22 21v-2a6 6 0 0 0-4-5.6" />
      </>,
    ),
  },
  {
    href: "/clientes",
    label: "Clientes",
    icon: icon(
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
      </>,
    ),
  },
  {
    href: "/negociacoes",
    label: "Negociações",
    icon: icon(
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-6" />
      </>,
    ),
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    adminOnly: true,
    icon: icon(
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>,
    ),
  },
];

const SUN_ICON = icon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>,
);

const MOON_ICON = icon(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />);

interface Props {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/**
 * Sidebar fixa de 248px (drawer no mobile), no formato da referência:
 * identidade da imobiliária no topo, navegação com rótulo sempre visível e
 * a conta do usuário ancorada no rodapé — é de lá que saem o tema e o logout.
 */
export function Sidebar({ mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Corretores e Configurações são exclusivos do ADMIN — o CORRETOR nem vê
  // os itens no menu (a proteção real das rotas é o <AdminOnly> na página).
  const isAdmin = user?.perfil === "ADMIN";
  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  // Fecha o menu da conta no clique fora ou no ESC.
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
    <>
      {/* Backdrop do drawer mobile — clicar fora fecha. */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-border bg-canvas " +
          "transition-transform duration-200 ease-out md:translate-x-0 " +
          (mobileOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* Topo: identidade da imobiliária */}
        <div className="flex h-14 shrink-0 items-center px-3">
          <Brand />
        </div>

        {/* Navegação */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            // Ativo quando a rota atual é o item ou uma subrota dele.
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                aria-current={active ? "page" : undefined}
                className={
                  "flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors duration-150 " +
                  (active
                    ? "bg-hover font-medium text-foreground"
                    : "text-muted-foreground hover:bg-hover/60 hover:text-foreground")
                }
              >
                <span
                  className={
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center " +
                    (active ? "text-accent" : "text-faint")
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé: conta do usuário (tema e logout saem daqui) */}
        <div className="relative shrink-0 border-t border-border p-3" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Menu da conta"
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 hover:bg-hover"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-accent">
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-foreground">
                {user?.email ?? "Conta"}
              </span>
              {user?.perfil && (
                <span className="block text-[11px] text-faint">
                  {PERFIL_LABELS[user.perfil]}
                </span>
              )}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-faint"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="animate-scale-in absolute bottom-[calc(100%-4px)] left-3 right-3 rounded-xl border border-border bg-elevated p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  toggleTheme();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors duration-150 hover:bg-hover hover:text-foreground"
              >
                <span className="text-faint">{isDark ? SUN_ICON : MOON_ICON}</span>
                {isDark ? "Modo claro" : "Modo escuro"}
              </button>
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors duration-150 hover:bg-hover hover:text-danger"
              >
                <span className="text-faint">
                  {icon(
                    <>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <path d="m16 17 5-5-5-5M21 12H9" />
                    </>,
                  )}
                </span>
                Sair
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
