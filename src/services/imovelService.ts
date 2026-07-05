import api from "./api";
import type { Imovel, ImovelInput } from "@/types";

/**
 * Chamadas à API de Imóveis. Toda função usa o cliente axios central,
 * então o header Authorization já vai injetado pelo interceptor.
 */
export const imovelService = {
  list(): Promise<Imovel[]> {
    return api.get<Imovel[]>("/imoveis").then((r) => r.data);
  },
  getById(id: number): Promise<Imovel> {
    return api.get<Imovel>(`/imoveis/${id}`).then((r) => r.data);
  },
  create(payload: ImovelInput): Promise<Imovel> {
    return api.post<Imovel>("/imoveis", payload).then((r) => r.data);
  },
  update(id: number, payload: ImovelInput): Promise<Imovel> {
    return api.put<Imovel>(`/imoveis/${id}`, payload).then((r) => r.data);
  },
  remove(id: number): Promise<void> {
    return api.delete(`/imoveis/${id}`).then(() => undefined);
  },
};
