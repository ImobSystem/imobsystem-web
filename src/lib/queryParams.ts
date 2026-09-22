/**
 * Monta uma query string a partir de um objeto de filtros, ignorando campos
 * vazios/undefined — é assim que "filtro não enviado = sem filtro" fica
 * garantido em todo lugar que filtra uma listagem.
 *
 * @returns string pronta pra concatenar na URL (`""` ou `"?a=1&b=2"`).
 */
export function buildQueryString(
  filtros: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filtros)) {
    if (value) params.append(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
