"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** Desaceleração no fim — o número "assenta" em vez de parar seco. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/*
 * Roda antes da pintura no cliente e cai em useEffect no servidor (onde
 * useLayoutEffect avisaria no console). Sem isso o browser chega a pintar o
 * número final antes de a contagem começar do zero — um "flash" do resultado.
 */
const useLayoutEffectIsomorfico =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Conta de 0 até `alvo` no carregamento (e a cada vez que `alvo` muda).
 *
 * Usa requestAnimationFrame em vez de setInterval para acompanhar o refresh
 * da tela e parar sozinho quando a aba vai para segundo plano.
 *
 * `null` passa direto (é o "—" de métrica que não carregou), e quem pediu
 * `prefers-reduced-motion` recebe o valor final de imediato.
 */
export function useCountUp(alvo: number | null, duracaoMs = 900): number | null {
  const [valor, setValor] = useState<number | null>(alvo);
  const frameRef = useRef(0);

  useLayoutEffectIsomorfico(() => {
    if (alvo === null) {
      setValor(null);
      return;
    }

    const semMovimento =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (semMovimento || alvo === 0) {
      setValor(alvo);
      return;
    }

    const inicio = performance.now();

    function passo(agora: number) {
      const progresso = Math.min(1, (agora - inicio) / duracaoMs);
      setValor(Math.round(easeOut(progresso) * (alvo as number)));
      if (progresso < 1) {
        frameRef.current = requestAnimationFrame(passo);
      }
    }

    frameRef.current = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(frameRef.current);
  }, [alvo, duracaoMs]);

  return valor;
}
