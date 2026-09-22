"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** Conteúdo do corpo (rola independente se passar de `max-h`). */
  children: ReactNode;
  /** Ações do rodapé (Cancelar/Salvar). Sem isso, o modal não tem rodapé. */
  footer?: ReactNode;
  /** Largura máxima do card (default: 520px, conforme o redesign). */
  maxWidthClass?: string;
}

/**
 * Modal genérico: header (título + subtítulo + fechar), body rolável,
 * footer opcional com borda separando as ações.
 * - Fecha no ESC e no clique do backdrop.
 * - Trava o scroll do body enquanto aberto.
 * - Backdrop com blur forte (8px) — o card "flutua" de verdade.
 * - Não renderiza nada quando fechado (evita nós ocultos no DOM).
 */
export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidthClass = "max-w-[520px]",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Trava o scroll do fundo enquanto o modal está aberto.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[8px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        // Impede que cliques dentro do card fechem o modal.
        onClick={(e) => e.stopPropagation()}
        className={`animate-scale-in w-full ${maxWidthClass} rounded-2xl border border-border bg-surface`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-[13px] text-faint">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded p-1.5 text-faint transition-colors duration-150 hover:text-muted-foreground"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
