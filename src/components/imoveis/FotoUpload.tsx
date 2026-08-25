"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingState } from "@/components/ui/States";
import { cloudinaryService } from "@/services/cloudinaryService";
import { fotoService } from "@/services/fotoService";
import { getErrorMessage } from "@/services/errors";
import {
  FOTO_FORMATOS_LABEL,
  FOTO_MAX_LABEL,
  FOTO_MAX_QUANTIDADE,
  buildThumbUrl,
  validarArquivoFoto,
} from "@/lib/foto";
import type { FotoImovel } from "@/types";

interface Props {
  imovelId: number;
}

/** Uma foto selecionada pelo usuário, ainda não enviada (ou em envio). */
interface PendingFoto {
  /** Id local só pra key/controle da UI — nada a ver com o id do backend. */
  clientId: string;
  file: File;
  previewUrl: string;
  status: "pendente" | "enviando" | "erro";
  erro?: string;
}

let pendingSeq = 0;

/**
 * Galeria + upload de fotos de um imóvel já existente.
 *
 * Fluxo por foto: (1) upload pro Cloudinary, (2) POST da URL recebida pro
 * backend. Mostra preview antes de enviar, progresso durante o envio, e
 * permite remover fotos já salvas (com confirmação) e ampliar qualquer foto
 * num lightbox simples.
 */
export function FotoUpload({ imovelId }: Props) {
  const [fotos, setFotos] = useState<FotoImovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [pendentes, setPendentes] = useState<PendingFoto[]>([]);
  const [selecaoErro, setSelecaoErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [paraRemover, setParaRemover] = useState<FotoImovel | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [removerErro, setRemoverErro] = useState<string | null>(null);

  const [ampliada, setAmpliada] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setLoadError(null);
    fotoService
      .listar(imovelId)
      .then((data) => {
        if (!cancelado) setFotos(data);
      })
      .catch((err) => {
        if (!cancelado) setLoadError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [imovelId]);

  // Libera as object URLs de preview quando o componente desmonta, evitando
  // vazamento de memória.
  useEffect(() => {
    return () => {
      setPendentes((atuais) => {
        atuais.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        return atuais;
      });
    };
  }, []);

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    // Zera o input: sem isso, escolher o MESMO arquivo de novo não dispara onChange.
    event.target.value = "";
    if (files.length === 0) return;

    setSelecaoErro(null);

    const totalAtual = fotos.length + pendentes.length;
    if (totalAtual + files.length > FOTO_MAX_QUANTIDADE) {
      setSelecaoErro(
        `Este imóvel pode ter no máximo ${FOTO_MAX_QUANTIDADE} fotos (já são ${totalAtual}).`,
      );
      return;
    }

    const novas: PendingFoto[] = [];
    for (const file of files) {
      const erro = validarArquivoFoto(file);
      if (erro) {
        setSelecaoErro(erro);
        return;
      }
      novas.push({
        clientId: `p${++pendingSeq}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "pendente",
      });
    }

    setPendentes((prev) => [...prev, ...novas]);
  }

  function removerPendente(clientId: string) {
    setPendentes((prev) => {
      const alvo = prev.find((p) => p.clientId === clientId);
      if (alvo) URL.revokeObjectURL(alvo.previewUrl);
      return prev.filter((p) => p.clientId !== clientId);
    });
  }

  async function enviarPendentes() {
    if (pendentes.length === 0) return;
    setEnviando(true);

    // Sequencial (não paralelo): evita estourar rate limit do Cloudinary e
    // deixa o progresso foto-a-foto fácil de acompanhar na UI.
    for (const pendente of pendentes) {
      setPendentes((prev) =>
        prev.map((p) =>
          p.clientId === pendente.clientId
            ? { ...p, status: "enviando", erro: undefined }
            : p,
        ),
      );
      try {
        const url = await cloudinaryService.upload(pendente.file);
        const foto = await fotoService.adicionar(imovelId, url);
        setFotos((prev) => [...prev, foto]);
        URL.revokeObjectURL(pendente.previewUrl);
        setPendentes((prev) => prev.filter((p) => p.clientId !== pendente.clientId));
      } catch (err) {
        setPendentes((prev) =>
          prev.map((p) =>
            p.clientId === pendente.clientId
              ? { ...p, status: "erro", erro: getErrorMessage(err) }
              : p,
          ),
        );
      }
    }

    setEnviando(false);
  }

  async function confirmarRemocao() {
    if (!paraRemover) return;
    setRemovendo(true);
    setRemoverErro(null);
    try {
      await fotoService.remover(imovelId, paraRemover.id);
      setFotos((prev) => prev.filter((f) => f.id !== paraRemover.id));
      setParaRemover(null);
    } catch (err) {
      setRemoverErro(getErrorMessage(err));
    } finally {
      setRemovendo(false);
    }
  }

  const totalFotos = fotos.length + pendentes.length;
  const limiteAtingido = totalFotos >= FOTO_MAX_QUANTIDADE;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          Fotos do imóvel
        </h3>
        <span className="text-[13px] text-faint">
          {totalFotos}/{FOTO_MAX_QUANTIDADE}
        </span>
      </div>

      {loading ? (
        <LoadingState label="Carregando fotos..." />
      ) : loadError ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {loadError}
        </p>
      ) : (
        <>
          {totalFotos === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhuma foto cadastrada ainda.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {fotos.map((foto) => (
                <div
                  key={foto.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border"
                >
                  <button
                    type="button"
                    onClick={() => setAmpliada(foto.url)}
                    className="block h-full w-full"
                    aria-label="Ver foto em tamanho maior"
                  >
                    <img
                      src={buildThumbUrl(foto.url)}
                      alt="Foto do imóvel"
                      className="h-full w-full object-cover transition group-hover:brightness-90"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRemoverErro(null);
                      setParaRemover(foto);
                    }}
                    aria-label="Remover foto"
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-danger"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              ))}

              {pendentes.map((p) => (
                <div
                  key={p.clientId}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-dashed border-border"
                >
                  <img
                    src={p.previewUrl}
                    alt="Pré-visualização"
                    className={`h-full w-full object-cover ${p.status === "enviando" ? "opacity-50" : ""}`}
                  />
                  {p.status === "enviando" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    </div>
                  )}
                  {p.status === "erro" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-danger/80 p-1 text-center text-[10px] leading-tight text-white">
                      {p.erro ?? "Falha no envio"}
                    </div>
                  )}
                  {p.status !== "enviando" && (
                    <button
                      type="button"
                      onClick={() => removerPendente(p.clientId)}
                      aria-label="Remover seleção"
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white hover:bg-danger"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              id={`foto-input-${imovelId}`}
              type="file"
              accept="image/*"
              multiple
              className="peer sr-only"
              onChange={handleFiles}
              disabled={enviando || limiteAtingido}
            />
            <label
              htmlFor={`foto-input-${imovelId}`}
              className={
                "inline-flex cursor-pointer items-center gap-2 rounded border border-border-strong " +
                "bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 " +
                "hover:bg-hover " +
                "active:scale-[0.98] " +
                "peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 " +
                (enviando || limiteAtingido ? "pointer-events-none opacity-60" : "")
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 9 5-5 5 5" />
                <path d="M12 4v12" />
              </svg>
              Adicionar fotos
            </label>

            {pendentes.length > 0 && (
              <Button onClick={enviarPendentes} loading={enviando}>
                Enviar {pendentes.length} foto{pendentes.length > 1 ? "s" : ""}
              </Button>
            )}

            <p className="text-[13px] text-faint">
              {FOTO_FORMATOS_LABEL} · até {FOTO_MAX_LABEL} cada · máx. {FOTO_MAX_QUANTIDADE} fotos
            </p>
          </div>

          {selecaoErro && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {selecaoErro}
            </p>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(paraRemover)}
        title="Remover foto"
        message={
          removerErro ??
          "Tem certeza que deseja remover esta foto? Esta ação não pode ser desfeita."
        }
        confirmLabel="Remover"
        loading={removendo}
        onConfirm={confirmarRemocao}
        onCancel={() => setParaRemover(null)}
      />

      {/* Lightbox simples: clique fora ou no X pra fechar. */}
      {ampliada && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
          onClick={() => setAmpliada(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Foto em tamanho maior"
        >
          <button
            type="button"
            onClick={() => setAmpliada(null)}
            aria-label="Fechar"
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <img
            src={ampliada}
            alt="Foto do imóvel em tamanho maior"
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
