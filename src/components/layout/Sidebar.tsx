"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Brand } from "@/components/layout/Brand";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

/* Ícones inline (sem dependências externas). */
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

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Configurações é exclusiva do ADMIN — o CORRETOR nem vê o item no menu.
  const navItems =
    user?.perfil === "ADMIN" ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-surface transition-colors md:flex dark:border-slate-800">
      {/* Marca (logo da imobiliária, com fallback para o "I" roxo) */}
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <Brand />
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          // Ativo quando a rota atual é o item ou uma subrota dele.
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition " +
                (active
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white")
              }
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
