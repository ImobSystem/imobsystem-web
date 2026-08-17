"use client";

import { useImobiliaria } from "@/contexts/ImobiliariaContext";

/** Nome exibido quando ainda não sabemos o nome da imobiliária. */
const NOME_PADRAO = "ImobSystem";

/**
 * Marca da área logada: logo da imobiliária + nome.
 *
 * Usada na sidebar (desktop) e no header (mobile) para as duas nunca saírem
 * de sincronia. Sem logo cadastrada, cai no quadrado roxo com "I".
 */
export function Brand() {
  const { imobiliaria } = useImobiliaria();

  const logo = imobiliaria?.logoBase64 ?? null;
  // Enquanto carrega (ou se a busca falhar), o nome do produto segura o lugar.
  const nome = imobiliaria?.nome ?? NOME_PADRAO;

  return (
    <div className="flex min-w-0 items-center gap-2">
      {logo ? (
        /*
         * Container de tamanho FIXO com a imagem em object-contain: a logo
         * cabe inteira sem distorcer, seja ela quadrada, larga ou alta.
         * O fundo claro é proposital — logos com fundo transparente e traço
         * escuro sumiriam no tema escuro.
         */
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700">
          <img
            src={logo}
            alt={`Logo de ${nome}`}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
          I
        </div>
      )}

      {/* `truncate` + `min-w-0` no pai evitam que nomes longos estourem a sidebar. */}
      <span
        className="truncate font-semibold text-slate-900 dark:text-white"
        title={nome}
      >
        {nome}
      </span>
    </div>
  );
}
