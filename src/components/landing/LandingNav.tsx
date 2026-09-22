import Image from "next/image";
import Link from "next/link";

/**
 * Navbar fixa da landing. O fundo é o canvas da página com transparência +
 * blur, então o conteúdo passa por baixo sem sumir atrás de um bloco opaco.
 */
export function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--landing-borda)] bg-[color-mix(in_srgb,var(--ink-base)_70%,transparent)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-3.5 sm:px-8">
        {/*
         * Aqui vai só o símbolo + a palavra, não o lockup inteiro: numa barra
         * de 56px o lockup ficaria com ~28px de altura e a linha "GESTÃO
         * IMOBILIÁRIA" viraria uma mancha ilegível. O lockup completo aparece
         * no rodapé, onde tem espaço. `alt` vazio porque o nome vem ao lado.
         */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-marca.png"
            alt=""
            width={278}
            height={243}
            loading="eager"
            fetchPriority="high"
            className="h-8 w-auto"
          />
          <span className="text-[18px] font-bold tracking-tight text-[var(--ink-text)]">
            Kaza System
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded px-3 py-2 text-[13px] font-medium text-[var(--ink-text-secondary)] transition-colors duration-150 hover:text-[var(--ink-text)]"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className="rounded bg-[var(--ink-accent)] px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-[var(--ink-accent-soft)] hover:shadow-[0_0_24px_var(--landing-brilho)]"
          >
            Começar grátis
          </Link>
        </div>
      </nav>
    </header>
  );
}
