/**
 * Decodificação (client-side) do payload de um JWT.
 *
 * IMPORTANTE: isto NÃO valida a assinatura — apenas lê os claims públicos do
 * payload para uso na UI (ex.: obter o `imobiliariaId` do usuário logado, que
 * não vem no corpo da resposta de login, apenas dentro do token).
 * A validação de verdade é responsabilidade do backend a cada requisição.
 */

/** Claims que nos interessam. Deixamos aberto porque o backend pode incluir mais. */
interface JwtPayload {
  sub?: string;
  exp?: number;
  [claim: string]: unknown;
}

/** Decodifica o payload de um JWT (base64url) para objeto. Retorna null se inválido. */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    // base64url -> base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Tenta extrair o `imobiliariaId` do token.
 *
 * Como o nome exato do claim depende do backend, testamos as variações mais
 * prováveis. Se nenhuma existir, retorna null (a UI degrada com aviso claro).
 */
export function getImobiliariaIdFromToken(token: string): number | null {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const candidateKeys = [
    "imobiliariaId",
    "imobiliaria_id",
    "imobiliaria",
    "idImobiliaria",
  ];

  for (const key of candidateKeys) {
    const value = payload[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return null;
}
