/**
 * Bloco cinza pulsante usado no lugar do conteúdo enquanto ele carrega.
 *
 * Preferido ao spinner quando já sabemos o formato do que vem (cabeçalho,
 * cards de métrica, linhas de tabela): a tela não "pula" quando os dados
 * chegam. `className` define tamanho e cantos.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-hover ${className}`}
      aria-hidden
    />
  );
}
