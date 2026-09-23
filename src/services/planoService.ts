import api from "./api";
import type { AssinarPlanoResposta, Plano, PlanoStatus } from "@/types";

/**
 * Assinatura da imobiliária.
 *
 * O pagamento em si não acontece aqui: `assinar` devolve um `linkPagamento`
 * do Asaas, e é para lá que mandamos o usuário. Quem confirma o pagamento
 * de volta para o backend é o webhook do Asaas — o front só relê o status.
 */
export const planoService = {
  getStatus(): Promise<PlanoStatus> {
    return api.get<PlanoStatus>("/imobiliarias/plano").then((r) => r.data);
  },

  assinar(plano: Plano): Promise<AssinarPlanoResposta> {
    return api
      .post<AssinarPlanoResposta>("/imobiliarias/plano", { plano })
      .then((r) => r.data);
  },
};
