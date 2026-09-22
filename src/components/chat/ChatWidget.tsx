"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { chatService } from "@/services/chatService";
import type { ChatAcao } from "@/types";

/** Uma linha da conversa. `acao`/`dados` só existem quando o Imo criou algo. */
interface Mensagem {
  id: number;
  autor: "usuario" | "imo";
  texto: ReactNode;
  acao?: ChatAcao;
  dados?: Record<string, unknown> | null;
}

const BOAS_VINDAS: ReactNode = (
  <>
    Olá! Eu sou o{" "}
    <strong className="font-semibold text-foreground">Imo</strong>, o assistente
    do Kaza System. Posso cadastrar imóveis e clientes, responder perguntas
    sobre seus dados e dar insights. Como posso ajudar?
  </>
);

const SUGESTOES = [
  "Cadastrar imóvel",
  "Cadastrar cliente",
  "Meus imóveis",
  "Resumo geral",
];

const ERRO_REDE = "Desculpe, ocorreu um erro. Tente novamente.";

const ACAO_TITULO: Record<ChatAcao, string> = {
  IMOVEL_CRIADO: "Imóvel cadastrado!",
  CLIENTE_CRIADO: "Cliente cadastrado!",
};

/**
 * Campos que sabemos rotular no card de confirmação. O que não estiver aqui
 * (id, imobiliariaId, fotos...) fica de fora do resumo.
 */
const CAMPO_LABEL: Record<string, string> = {
  endereco: "Endereço",
  CEP: "CEP",
  area_m2: "Área",
  finalidade: "Finalidade",
  statusImovel: "Status",
  nome: "Nome",
  cpf: "CPF",
  email: "E-mail",
  telefone: "Telefone",
  tipoCliente: "Tipo",
};

interface CampoResumo {
  label: string;
  valor: string;
}

/**
 * Extrai do registro criado os poucos campos legíveis do resumo.
 *
 * Só aceita string/number: o objeto vem cru do backend e pode trazer listas
 * ou objetos aninhados, que virariam "[object Object]" na tela.
 */
function resumirDados(dados: Record<string, unknown>): CampoResumo[] {
  const campos: CampoResumo[] = [];

  for (const [chave, valor] of Object.entries(dados)) {
    const label = CAMPO_LABEL[chave];
    if (!label) continue;
    if (typeof valor !== "string" && typeof valor !== "number") continue;
    if (valor === "") continue;

    campos.push({
      label,
      valor: chave === "area_m2" ? `${valor} m²` : String(valor),
    });
    if (campos.length === 4) break;
  }

  return campos;
}

/* --------------------------- Ícones (inline) --------------------------- */

const traco = (path: ReactNode, size = 18) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {path}
  </svg>
);

const ICONE_CHAT = traco(
  <path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z" />,
  24,
);

const ICONE_SPARKLES = traco(
  <>
    <path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8z" />
    <path d="M18.5 15.5 19.2 17.3 21 18l-1.8.7-.7 1.8-.7-1.8L16 18l1.8-.7z" />
  </>,
);

const ICONE_FECHAR = traco(<path d="M18 6 6 18M6 6l12 12" />, 16);

const ICONE_ENVIAR = traco(
  <>
    <path d="M21.5 2.5 11 13" />
    <path d="M21.5 2.5 15 21l-4-8-8-4z" />
  </>,
  16,
);

const ICONE_CHECK = traco(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </>,
  15,
);

/* ------------------------------ Componente ------------------------------ */

/**
 * Chat do Imo: botão flutuante que abre um painel de conversa.
 *
 * Mora no layout da área logada, então acompanha o usuário em todas as
 * telas. O histórico vive só em memória — recarregar a página recomeça a
 * conversa (o backend é stateless do ponto de vista do front).
 */
export function ChatWidget() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { id: 0, autor: "imo", texto: BOAS_VINDAS },
  ]);
  const [rascunho, setRascunho] = useState("");
  const [enviando, setEnviando] = useState(false);

  const proximoId = useRef(1);
  const fimDaListaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // As sugestões são um empurrão inicial: somem assim que a conversa começa.
  const mostrarSugestoes = mensagens.length === 1 && !enviando;

  // Toda mensagem nova (e o "digitando") rola a lista até o fim.
  useEffect(() => {
    if (!aberto) return;
    fimDaListaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens, enviando, aberto]);

  useEffect(() => {
    if (aberto) inputRef.current?.focus();
  }, [aberto]);

  // ESC fecha o painel, como nos outros overlays do sistema.
  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberto]);

  async function enviar(texto: string) {
    const conteudo = texto.trim();
    if (!conteudo || enviando) return;

    setMensagens((atuais) => [
      ...atuais,
      { id: proximoId.current++, autor: "usuario", texto: conteudo },
    ]);
    setRascunho("");
    setEnviando(true);

    try {
      const resposta = await chatService.enviarMensagem(conteudo);
      setMensagens((atuais) => [
        ...atuais,
        {
          id: proximoId.current++,
          autor: "imo",
          texto: resposta.resposta,
          acao: resposta.acao ?? undefined,
          dados: resposta.dadosCriados,
        },
      ]);
    } catch {
      setMensagens((atuais) => [
        ...atuais,
        { id: proximoId.current++, autor: "imo", texto: ERRO_REDE },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    enviar(rascunho);
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Falar com o Imo"
        className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_0_1px_var(--accent-glow-inner),0_0_24px_6px_var(--accent-glow-outer)] active:scale-100"
      >
        {ICONE_CHAT}
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-elevated px-2.5 py-1.5 text-xs font-medium text-muted-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          Falar com o Imo
        </span>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Chat com o Imo"
      className="animate-slide-up fixed bottom-6 right-6 z-50 flex h-[500px] max-h-[70vh] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]"
    >
      {/* Cabeçalho */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="text-accent">{ICONE_SPARKLES}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-foreground">
            Imo
          </p>
          <p className="text-xs leading-tight text-faint">
            Assistente imobiliário
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAberto(false)}
          aria-label="Fechar chat"
          className="flex h-7 w-7 items-center justify-center rounded-md text-faint transition-colors duration-150 hover:bg-hover hover:text-foreground"
        >
          {ICONE_FECHAR}
        </button>
      </div>

      {/* Conversa */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {mensagens.map((mensagem) => (
          <Balao key={mensagem.id} mensagem={mensagem} />
        ))}

        {mostrarSugestoes && (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {SUGESTOES.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => enviar(sugestao)}
                className="rounded-lg border border-border-strong px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors duration-150 hover:bg-hover hover:text-foreground"
              >
                {sugestao}
              </button>
            ))}
          </div>
        )}

        {enviando && (
          <div className="flex justify-start">
            <div
              className="flex items-center gap-1.5 rounded-[12px_12px_12px_2px] bg-elevated px-3.5 py-3.5"
              role="status"
              aria-label="Imo está digitando"
            >
              <span className="chat-dot" />
              <span className="chat-dot" style={{ animationDelay: "0.15s" }} />
              <span className="chat-dot" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}

        <div ref={fimDaListaRef} />
      </div>

      {/* Escrita */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-t border-border p-3"
      >
        <input
          ref={inputRef}
          value={rascunho}
          onChange={(e) => setRascunho(e.target.value)}
          placeholder="Escreva sua mensagem..."
          aria-label="Mensagem para o Imo"
          disabled={enviando}
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-elevated px-3 text-[13px] text-foreground outline-none transition-colors duration-150 placeholder:text-faint focus:border-accent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!rascunho.trim() || enviando}
          aria-label="Enviar mensagem"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-colors duration-200 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ICONE_ENVIAR}
        </button>
      </form>
    </div>
  );
}

/** Balão de uma mensagem — o do Imo pode trazer o card da ação executada. */
function Balao({ mensagem }: { mensagem: Mensagem }) {
  const doUsuario = mensagem.autor === "usuario";
  const campos =
    mensagem.acao && mensagem.dados ? resumirDados(mensagem.dados) : [];

  return (
    <div className={doUsuario ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          "max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed " +
          (doUsuario
            ? "rounded-[12px_12px_2px_12px] bg-accent text-white"
            : "rounded-[12px_12px_12px_2px] bg-elevated text-muted-foreground")
        }
      >
        {mensagem.texto}

        {mensagem.acao && (
          <div className="mt-2.5 rounded-lg border border-border bg-surface p-3">
            <p className="flex items-center gap-1.5 font-medium text-success">
              {ICONE_CHECK}
              {ACAO_TITULO[mensagem.acao]}
            </p>

            {campos.length > 0 && (
              <dl className="mt-2 space-y-1">
                {campos.map((campo) => (
                  <div key={campo.label} className="flex gap-3 text-xs">
                    <dt className="shrink-0 text-faint">{campo.label}</dt>
                    <dd className="min-w-0 flex-1 truncate text-right text-muted-foreground">
                      {campo.valor}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
