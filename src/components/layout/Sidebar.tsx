"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Brand } from "@/components/layout/Brand";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

/* Ícones inline (sem dependências externas), 20px conforme o redesign. */
const icon = (path: ReactNode) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {path}
  </svg>
);

const SUN_ICON = icon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>,
);

const MOON_ICON = icon(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />);

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: icon(
      <>
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
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
];

/** Itens restritos ao ADMIN (não aparecem para o CORRETOR). */
const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>,
    ),
  },
];

/**
 * Classes compartilhadas por qualquer "item de rail" (nav link ou o toggle de
 * tema no rodapé): 40px colapsado, cresce pra preencher a largura quando a
 * sidebar expande (hover no desktop, ou `mobileOpen` força o drawer aberto).
 */
function railItemClass(active: boolean, mobileOpen: boolean) {
  return (
    "group/item relative flex h-10 shrink-0 items-center gap-3 overflow-hidden rounded-[10px] px-[10px] " +
    "transition-colors duration-150 " +
    (mobileOpen ? "w-full" : "w-10 md:group-hover/sidebar:w-full") +
    " " +
    (active
      ? "bg-accent-subtle text-accent"
      : "text-faint hover:bg-hover hover:text-muted-foreground")
  );
}

function railLabelClass(mobileOpen: boolean) {
  return (
    "whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 md:group-hover/sidebar:opacity-100 " +
    (mobileOpen ? "opacity-100" : "")
  );
}

/** Tooltip do item — só existe no desktop, e só aparece no foco (o hover já expande a sidebar). */
const TOOLTIP_CLASS =
  "pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap " +
  "rounded-md border border-border bg-elevated px-2 py-1 text-xs font-medium text-muted-foreground shadow-lg " +
  "opacity-0 transition-opacity duration-150 group-focus-within/item:opacity-100 md:block";

interface Props {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Configurações é exclusiva do ADMIN — o CORRETOR nem vê o item no menu.
  const navItems =
    user?.perfil === "ADMIN" ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

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
          "group/sidebar fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-border bg-base " +
          "transition-[width,background-color,box-shadow,transform] duration-200 ease-out " +
          "md:translate-x-0 md:hover:w-60 md:hover:bg-surface md:hover:shadow-[4px_0_24px_rgba(0,0,0,0.3)] " +
          (mobileOpen
            ? "w-60 translate-x-0 bg-surface shadow-[4px_0_24px_rgba(0,0,0,0.3)]"
            : "-translate-x-full")
        }
      >
        {/* Topo: marca */}
        <div className="flex h-14 shrink-0 items-center overflow-hidden px-3">
          <Brand mobileOpen={mobileOpen} />
        </div>

        {/* Navegação */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {navItems.map((item) => {
            // Ativo quando a rota atual é o item ou uma subrota dele.
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={railItemClass(active, mobileOpen)}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {item.icon}
                </span>
                <span className={railLabelClass(mobileOpen)}>{item.label}</span>
                <span className={TOOLTIP_CLASS}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé: toggle de tema */}
        <div className="shrink-0 px-3 pb-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            className={railItemClass(false, mobileOpen)}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              {isDark ? MOON_ICON : SUN_ICON}
            </span>
            <span className={railLabelClass(mobileOpen)}>
              {isDark ? "Modo claro" : "Modo escuro"}
            </span>
            <span className={TOOLTIP_CLASS}>
              {isDark ? "Modo claro" : "Modo escuro"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
