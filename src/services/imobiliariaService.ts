import api from "./api";
import type { AtualizarLogoRequest, Imobiliaria } from "@/types";

/** Chamadas à API da Imobiliária (dados da própria imobiliária do usuário logado). */
export const imobiliariaService = {
  /** Dados da imobiliária do usuário logado — inclui a logo personalizada. */
  getMinhaImobiliaria(): Promise<Imobiliaria> {
    return api.get<Imobiliaria>("/imobiliarias/minha").then((r) => r.data);
  },

  /**
   * Atualiza a logo da imobiliária. Só ADMIN é autorizado pela API.
   *
   * Ignoramos o corpo da resposta de propósito: já temos em mãos o Base64 que
   * acabamos de enviar, então quem chama atualiza o estado local com ele em vez
   * de refazer o GET.
   *
   * @param logoBase64 data URL da imagem (`data:image/png;base64,...`).
   */
  atualizarLogo(logoBase64: string): Promise<void> {
    const payload: AtualizarLogoRequest = { logoBase64 };
    return api.put("/imobiliarias/logo", payload).then(() => undefined);
  },
};
