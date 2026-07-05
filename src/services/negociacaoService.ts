import api from "./api";
import type { Negociacao, NegociacaoInput, StatusNegocio } from "@/types";

/** Chamadas à API de Negociações. */
export const negociacaoService = {
  list(): Promise<Negociacao[]> {
    return api.get<Negociacao[]>("/negociacoes").then((r) => r.data);
  },
  getById(id: number): Promise<Negociacao> {
    return api.get<Negociacao>(`/negociacoes/${id}`).then((r) => r.data);
  },
  create(payload: NegociacaoInput): Promise<Negociacao> {
    return api.post<Negociacao>("/negociacoes", payload).then((r) => r.data);
  },
  /** Atualiza apenas o status (movimentação no funil). */
  updateStatus(id: number, statusNegocio: StatusNegocio): Promise<Negociacao> {
    return api
      .put<Negociacao>(`/negociacoes/${id}/status`, { statusNegocio })
      .then((r) => r.data);
  },
};
