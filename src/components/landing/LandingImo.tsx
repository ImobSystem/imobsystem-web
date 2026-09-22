"use client";

import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const CAPACIDADES = [
  "Cadastra imóveis e clientes a partir de uma frase",
  "Responde perguntas sobre a sua base de dados",
  "Resume a carteira e aponta o que precisa de atenção",
];

/**
 * Seção de destaque do assistente.
 *
 * A demonstração de chat é 100% CSS: um ciclo de 6s em que a pergunta
 * aparece, os três pontos pulsam e a resposta entra. Os pontos e o balão do
 * Imo dividem a MESMA célula do grid — assim a troca entre os dois não muda
 * a altura do card, que ficaria "pulando" a cada volta do loop.
 */
export function LandingImo() {
  const secaoRef = useRevealOnScroll<HTMLDivElement>();

  return (
    <section className="px-5 pb-[100px] sm:px-8">
      <div
        ref={secaoRef}
        className="landing-reveal relative mx-auto max-w-[900px] overflow-hidden rounded-[20px] border border-[var(--landing-borda)] bg-[var(--landing-vidro)] p-8 backdrop-blur-[8px] sm:p-12"
      >
        {/* Brilho decorativo no canto */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(238,95,18,0.16) 0%, transparent 70%)",
          }}
        />

        <div className="relative flex flex-col gap-10 md:flex-row md:items-center">
          {/* Texto */}
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--ink-accent)_16%,transparent)] px-3 py-1 text-[12px] font-semibold text-[var(--ink-accent)]">
              Inteligência Artificial
            </span>

            <h2 className="mt-4 text-[28px] font-bold tracking-tight text-[var(--ink-text)]">
              Conheça o Imo
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-text-secondary)]">
              O assistente que entende o jeito que você fala. Em vez de abrir
              formulário, você descreve o imóvel — e ele cadastra.
            </p>

            <ul className="mt-5 space-y-2.5">
              {CAPACIDADES.map((capacidade) => (
                <li
                  key={capacidade}
                  className="flex items-start gap-2.5 text-sm text-[var(--ink-text-secondary)]"
                >
                  <span className="mt-0.5 shrink-0 text-[var(--status-success)]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
                    </svg>
                  </span>
                  {capacidade}
                </li>
              ))}
            </ul>
          </div>

          {/* Demonstração */}
          <div className="w-full shrink-0 md:w-[300px]">
            <div className="landing-vidro rounded-2xl p-4">
              <div className="flex items-center gap-2 border-b border-[var(--landing-borda)] pb-3">
                <span className="text-[var(--ink-accent)]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8z" />
                    <path d="M18.5 15.5 19.2 17.3 21 18l-1.8.7-.7 1.8-.7-1.8L16 18l1.8-.7z" />
                  </svg>
                </span>
                <span className="text-[13px] font-semibold text-[var(--ink-text)]">
                  Imo
                </span>
              </div>

              <div className="space-y-2.5 pt-3">
                <div className="flex justify-end">
                  <p className="landing-chat-user max-w-[88%] rounded-[12px_12px_2px_12px] bg-[var(--ink-accent)] px-3 py-2 text-[12px] leading-snug text-white">
                    Cadastra um apto de 90m² na Av. Boa Viagem, pra venda
                  </p>
                </div>

                {/* Pontos e resposta empilhados na mesma célula. */}
                <div className="grid justify-items-start">
                  <div
                    className="landing-chat-dots flex items-center gap-1.5 rounded-[12px_12px_12px_2px] bg-[var(--landing-vidro-forte)] px-3 py-3"
                    style={{ gridArea: "1 / 1" }}
                  >
                    <span className="chat-dot" />
                    <span className="chat-dot" style={{ animationDelay: "0.15s" }} />
                    <span className="chat-dot" style={{ animationDelay: "0.3s" }} />
                  </div>

                  <div
                    className="landing-chat-imo max-w-[92%] rounded-[12px_12px_12px_2px] bg-[var(--landing-vidro-forte)] px-3 py-2"
                    style={{ gridArea: "1 / 1" }}
                  >
                    <p className="text-[12px] font-medium leading-snug text-[var(--status-success)]">
                      Imóvel cadastrado!
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-[var(--ink-text-secondary)]">
                      Av. Boa Viagem · 90m² · Venda
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
