import api from "./api";
import type { ChatResposta } from "@/types";

/**
 * Conversa com o Imo (assistente).
 *
 * Passa pelo axios central como todo o resto: baseURL, JWT e tratamento de
 * sessão expirada vêm de graça. O backend é quem decide se a mensagem vira
 * uma ação (cadastro de imóvel/cliente) — o front só exibe o resultado.
 */
export const chatService = {
  enviarMensagem(mensagem: string): Promise<ChatResposta> {
    return api.post<ChatResposta>("/chat", { mensagem }).then((r) => r.data);
  },
};
