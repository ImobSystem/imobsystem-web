"use client";

import { useImobiliaria } from "@/contexts/ImobiliariaContext";
import { LogoMark } from "@/components/layout/LogoMark";

/** Nome exibido quando ainda não sabemos o nome da imobiliária. */
const NOME_PADRAO = "ImobSystem";

/**
 * Identidade no topo da sidebar: avatar (logo da imobiliária ou o ícone do
 * ImobSystem, como marca padrão) + nome.
 *
 * Não é um seletor: o usuário pertence a uma única imobiliária, então aqui
 * não existe chevron nem menu — seria prometer uma troca que não existe.
 */
export function Brand() {
  const { imobiliaria } = useImobiliaria();

  const logo = imobiliaria?.logoBase64 ?? null;
  const nome = imobiliaria?.nome ?? NOME_PADRAO;

  return (
    <div className="flex w-full min-w-0 items-center gap-2.5 px-2">
      {logo ? (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white p-0.5">
          <img
            src={logo}
            alt={`Logo de ${nome}`}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        // Sem logo própria cadastrada: cai na marca do próprio ImobSystem.
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent">
          <LogoMark className="h-4 w-4" />
        </div>
      )}

      <span
        className="truncate text-sm font-semibold text-foreground"
        title={nome}
      >
        {nome}
      </span>
    </div>
  );
}
