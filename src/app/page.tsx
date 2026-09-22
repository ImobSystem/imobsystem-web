"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingImo } from "@/components/landing/LandingImo";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

/**
 * Rota raiz ("/"): a vitrine pública do Kaza System.
 *
 * Quem já tem sessão não precisa dela — vai direto pro dashboard. O redirect
 * roda depois da pintura de propósito: segurar a página até o AuthContext
 * reidratar o localStorage atrasaria a landing para TODO visitante anônimo,
 * que é justamente quem ela existe para atender.
 *
 * A página não acompanha o tema claro/escuro (ver `.landing` no globals.css).
 */
export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="landing min-h-screen overflow-x-hidden">
      <LandingNav />

      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingImo />
        <CtaFinal />
      </main>

      <footer className="border-t border-[var(--landing-borda)] px-5 py-10 text-center sm:px-8">
        {/* Assinatura da marca: aqui o lockup completo cabe e fica legível. */}
        <Image
          src="/logo-kazasystem.png"
          alt="Kaza System — Gestão Imobiliária"
          width={631}
          height={240}
          className="mx-auto mb-5 h-auto w-[180px] opacity-70"
        />
        <p className="text-[13px] text-[var(--ink-text-muted)]">
          © {new Date().getFullYear()} Kaza System. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

function CtaFinal() {
  const blocoRef = useRevealOnScroll<HTMLDivElement>();

  return (
    <section className="px-5 pb-[120px] pt-4 sm:px-8">
      <div ref={blocoRef} className="landing-reveal mx-auto max-w-[620px] text-center">
        <h2 className="text-[26px] font-bold leading-tight tracking-tight text-[var(--ink-text)] sm:text-[32px]">
          Pronto pra <span className="landing-gradiente">transformar</span> sua
          gestão?
        </h2>

        <p className="mt-3 text-sm text-[var(--ink-text-secondary)] sm:text-base">
          Comece agora — é grátis pra testar.
        </p>

        <Link
          href="/registro"
          className="mt-8 inline-block rounded bg-[var(--ink-accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_var(--landing-brilho)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_44px_var(--landing-brilho-forte)]"
        >
          Criar minha conta
        </Link>
      </div>
    </section>
  );
}
