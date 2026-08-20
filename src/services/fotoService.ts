import api from "./api";
import type { FotoImovel } from "@/types";

/**
 * Chamadas à API de Fotos de Imóvel. A URL enviada já veio do Cloudinary
 * (ver `cloudinaryService`) — aqui só persistimos a referência no backend.
 */
export const fotoService = {
  listar(imovelId: number): Promise<FotoImovel[]> {
    return api
      .get<FotoImovel[]>(`/imoveis/${imovelId}/fotos`)
      .then((r) => r.data);
  },
  adicionar(imovelId: number, url: string): Promise<FotoImovel> {
    return api
      .post<FotoImovel>(`/imoveis/${imovelId}/fotos`, { url })
      .then((r) => r.data);
  },
  remover(imovelId: number, fotoId: number): Promise<void> {
    return api
      .delete(`/imoveis/${imovelId}/fotos/${fotoId}`)
      .then(() => undefined);
  },
};
