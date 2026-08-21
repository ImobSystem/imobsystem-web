"use client";

import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useImobiliaria } from "@/contexts/ImobiliariaContext";
import { imobiliariaService } from "@/services/imobiliariaService";
import { getErrorMessage } from "@/services/errors";
import {
  LOGO_FORMATOS_LABEL,
  LOGO_MAX_LABEL,
  lerComoDataUrl,
  validarArquivoLogo,
  validarDataUrlLogo,
} from "@/lib/logo";

/**
 * Quadro de preview de tamanho fixo.
 *
 * O tamanho fixo + `object-contain` garantem que qualquer proporção de imagem
 * caiba inteira, sem esticar nem cortar. Sem imagem, um ícone neutro — nunca
 * um placeholder colorido genérico.
 */
function LogoPreview({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-border bg-elevated text-faint">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2">
      <img src={src} alt={alt} className="h-full w-full object-contain" />
    </div>
  );
}

/** Rótulo pequeno acima de cada preview. */
function PreviewLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
      {children}
    </p>
  );
}

/**
 * Seção "Logo da imobiliária": preview da logo atual, upload de uma nova
 * (com validação e preview antes de salvar) e envio para a API.
 */
export function LogoSection() {
  const { imobiliaria, loading, error, reload, aplicarLogo } = useImobiliaria();

  /** data URL da imagem escolhida e ainda NÃO salva (null = nada pendente). */
  const [novaLogo, setNovaLogo] = useState<string | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function limparSelecao() {
    setNovaLogo(null);
    setNomeArquivo(null);
    setMensagemErro(null);
  }

  async function handleArquivo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Zera o input logo após pegar o arquivo: sem isso, escolher o MESMO
    // arquivo de novo (depois de um erro) não dispararia o onChange.
    event.target.value = "";
    if (!file) return;

    setSucesso(false);

    const erroArquivo = validarArquivoLogo(file);
    if (erroArquivo) {
      setNovaLogo(null);
      setNomeArquivo(null);
      setMensagemErro(erroArquivo);
      return;
    }

    try {
      const dataUrl = await lerComoDataUrl(file);

      // Segunda checagem: o Base64 é ~33% maior que o arquivo original.
      const erroCodificado = validarDataUrlLogo(dataUrl);
      if (erroCodificado) {
        setNovaLogo(null);
        setNomeArquivo(null);
        setMensagemErro(erroCodificado);
        return;
      }

      setNovaLogo(dataUrl);
      setNomeArquivo(file.name);
      setMensagemErro(null);
    } catch (err) {
      setNovaLogo(null);
      setNomeArquivo(null);
      setMensagemErro(getErrorMessage(err));
    }
  }

  async function salvar() {
    if (!novaLogo) return;

    setSalvando(true);
    setMensagemErro(null);
    setSucesso(false);
    try {
      await imobiliariaService.atualizarLogo(novaLogo);
      // Atualiza o contexto: a sidebar e o header trocam a logo na hora.
      aplicarLogo(novaLogo);
      setNovaLogo(null);
      setNomeArquivo(null);
      setSucesso(true);
    } catch (err) {
      setMensagemErro(getErrorMessage(err));
    } finally {
      setSalvando(false);
    }
  }

  const logoAtual = imobiliaria?.logoBase64 ?? null;
  const nomeImobiliaria = imobiliaria?.nome ?? "sua imobiliária";

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold text-foreground">
        Logo da imobiliária
      </h2>
      <p className="mt-1 text-sm text-faint">
        A logo aparece no topo do menu lateral para todos os usuários da
        imobiliária.
      </p>

      {loading ? (
        <LoadingState label="Carregando dados da imobiliária..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="mt-6 space-y-6">
          {/* Previews: a atual e, quando houver, a escolhida ainda não salva. */}
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <PreviewLabel>Logo atual</PreviewLabel>
              <LogoPreview
                src={logoAtual}
                alt={`Logo atual de ${nomeImobiliaria}`}
              />
              {!logoAtual && (
                <p className="mt-2 max-w-[10rem] text-[13px] text-faint">
                  Nenhuma logo enviada — usando o padrão.
                </p>
              )}
            </div>

            {novaLogo && (
              <>
                <div className="pb-8 text-faint" aria-hidden>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </div>

                <div>
                  <PreviewLabel>Nova logo</PreviewLabel>
                  <LogoPreview src={novaLogo} alt="Pré-visualização da nova logo" />
                  <p className="mt-2 max-w-[10rem] truncate text-[13px] text-faint">
                    {nomeArquivo}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Upload: o input cru fica escondido; o <label> é o botão visível. */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              id="logo-input"
              type="file"
              accept="image/*"
              className="peer sr-only"
              onChange={handleArquivo}
              disabled={salvando}
            />
            <label
              htmlFor="logo-input"
              className={
                "inline-flex cursor-pointer items-center gap-2 rounded border border-border-strong " +
                "bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 " +
                "hover:bg-hover " +
                "active:scale-[0.98] " +
                // O input é sr-only, então o anel de foco é espelhado no label.
                "peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 " +
                (salvando ? "pointer-events-none opacity-60" : "")
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 9 5-5 5 5" />
                <path d="M12 4v12" />
              </svg>
              Escolher imagem
            </label>

            {novaLogo && (
              <button
                type="button"
                onClick={limparSelecao}
                disabled={salvando}
                className="rounded px-3 py-2 text-sm font-medium text-faint transition-colors duration-150 hover:bg-hover hover:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                Descartar seleção
              </button>
            )}

            <p className="text-[13px] text-faint">
              {LOGO_FORMATOS_LABEL} · até {LOGO_MAX_LABEL}
            </p>
          </div>

          {/* Feedback anunciado por leitores de tela (alert = erro, status = ok). */}
          {mensagemErro && (
            <p role="alert" className="rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger">
              {mensagemErro}
            </p>
          )}
          {sucesso && (
            <p role="status" className="rounded-lg bg-success-bg px-4 py-3 text-sm text-success">
              Logo atualizada!
            </p>
          )}

          <div>
            <Button onClick={salvar} loading={salvando} disabled={!novaLogo}>
              Salvar logo
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
