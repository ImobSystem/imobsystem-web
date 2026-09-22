"use client";

import { useEffect, useRef } from "react";

/**
 * Revela elementos quando eles entram no viewport, adicionando a classe
 * `.animate-in` (ver `.landing-reveal` no globals.css).
 *
 * Devolve uma ref para o CONTAINER. Com `staggerMs > 0`, quem é observado
 * são os filhos diretos, cada um com um atraso progressivo — é o efeito
 * cascata do grid de features.
 *
 * Quem pediu `prefers-reduced-motion` (ou está num browser sem
 * IntersectionObserver) recebe tudo já revelado: o conteúdo nunca fica preso
 * em `opacity: 0`.
 */
export function useRevealOnScroll<T extends HTMLElement>(staggerMs = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const alvos: Element[] =
      staggerMs > 0 ? Array.from(container.children) : [container];

    const semMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (semMovimento || typeof IntersectionObserver === "undefined") {
      alvos.forEach((alvo) => alvo.classList.add("animate-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;

          const posicao = alvos.indexOf(entrada.target);
          const elemento = entrada.target as HTMLElement;
          if (posicao > 0) {
            elemento.style.transitionDelay = `${posicao * staggerMs}ms`;
          }
          elemento.classList.add("animate-in");

          // Revelar é uma via só: para de observar quem já apareceu.
          observer.unobserve(entrada.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    alvos.forEach((alvo) => observer.observe(alvo));
    return () => observer.disconnect();
  }, [staggerMs]);

  return ref;
}
