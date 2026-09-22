/**
 * Símbolo da marca Kaza System — recorte real do logo (public/logo-marca.png,
 * fundo transparente), não um redesenho. `className` controla o tamanho;
 * `object-contain` evita distorcer a proporção (a casa não é quadrada).
 */
export function LogoMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <img
      src="/logo-marca.png"
      alt=""
      className={`object-contain ${className}`}
    />
  );
}
