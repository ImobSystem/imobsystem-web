"use client";

import { useImobiliaria } from "@/contexts/ImobiliariaContext";
import { LogoMark } from "@/components/layout/LogoMark";

/** Nome exibido quando ainda não sabemos o nome da imobiliária. */
const NOME_PADRAO = "ImobSystem";

/**
 * Marca no topo da sidebar: avatar (logo da imobiliária ou o ícone do
 * ImobSystem, como marca padrão) + nome.
 *
 * Vive dentro do `group/sidebar` do <Sidebar>: o nome fica com opacidade 0
 * (e a coluna pai com `overflow-hidden`) até a sidebar expandir — no hover
 * (desktop) ou quando `mobileOpen` força o estado expandido (drawer).
 */
export function Brand({ mobileOpen = false }: { mobileOpen?: boolean }) {
  const { imobiliaria } = useImobiliaria();

  const logo = imobiliaria?.logoBase64 ?? null;
  const nome = imobiliaria?.nome ?? NOME_PADRAO;

  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      {logo ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-white p-1">
          <img
            src={logo}
            alt={`Logo de ${nome}`}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        // Sem logo própria cadastrada: cai na marca do próprio ImobSystem.
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-subtle text-accent">
          <LogoMark className="h-5 w-5" />
        </div>
      )}

      <span
        className={
          "truncate whitespace-nowrap text-sm font-semibold text-foreground opacity-0 transition-opacity duration-150 md:group-hover/sidebar:opacity-100 " +
          (mobileOpen ? "opacity-100" : "")
        }
        title={nome}
      >
        {nome}
      </span>
    </div>
  );
}
