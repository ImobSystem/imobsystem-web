import { AxiosError } from "axios";

/**
 * Traduz um erro (normalmente do axios) em uma mensagem curta e amigável
 * para exibir na UI, sem vazar detalhes técnicos.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Sem resposta = servidor fora do ar / CORS / rede.
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Tente novamente em instantes.";
    }

    const status = error.response.status;
    if (status === 401 || status === 403) {
      return "E-mail ou senha inválidos.";
    }
    if (status >= 500) {
      return "Erro no servidor. Tente novamente mais tarde.";
    }

    // Se o backend mandar uma mensagem própria, aproveitamos.
    const data = error.response.data as { message?: string; erro?: string } | undefined;
    if (data?.message) return data.message;
    if (data?.erro) return data.erro;
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}
