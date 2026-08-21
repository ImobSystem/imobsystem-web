"use client";

import type { ReactNode } from "react";

interface Props {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  icon: ReactNode;
}

/**
 * Botão de ação só com ícone (Editar, Excluir...) + tooltip estilizado no
 * hover/foco — nunca texto solto ("Editar"/"Excluir") ao lado do ícone.
 */
export function IconAction({ label, onClick, variant = "default", icon }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        "group/item relative flex h-8 w-8 items-center justify-center rounded-md text-faint " +
        "transition-colors duration-150 hover:bg-hover " +
        (variant === "danger" ? "hover:text-danger" : "hover:text-foreground")
      }
    >
      {icon}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-elevated px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover/item:opacity-100 group-focus-visible/item:opacity-100">
        {label}
      </span>
    </button>
  );
}
