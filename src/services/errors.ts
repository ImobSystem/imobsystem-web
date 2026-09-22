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
    const data = error.response.data as
      | { message?: string; erro?: string; error?: string }
      | undefined;

    /*
     * A mensagem do backend é mais específica que qualquer texto genérico, então
     * ela vem primeiro. Duas ressalvas:
     *
     *  - Acima de 500 ignoramos: o corpo padrão do Spring traz a exceção crua
     *    (com stack trace), que não é coisa de mostrar para o usuário.
     *  - Em 401/403 só confiamos quando vem ACESSO_NEGADO, do nosso
     *    GlobalExceptionHandler. O 403 de token expirado é gerado pelo Spring
     *    Security e traz message "Forbidden".
     */
    const confiaNaMensagem =
      status < 500 &&
      (status === 401 || status === 403
        ? data?.error === "ACESSO_NEGADO"
        : true);

    if (confiaNaMensagem) {
      if (data?.message) return data.message;
      if (data?.erro) return data.erro;
    }

    if (status === 401 || status === 403) {
      return "Sua sessão expirou. Entre novamente.";
    }
    if (status >= 500) {
      return "Erro no servidor. Tente novamente mais tarde.";
    }
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}
