import api from "./api";
import type {
  Captacao,
  Cliente,
  Corretor,
  CorretorInput,
  CorretorMetricas,
  Imovel,
} from "@/types";

/**
 * Chamadas à API de Corretores.
 * Obs.: o cadastro usa o caminho /corretores/cadastrar e, diferente dos
 * outros recursos, ainda exige `imobiliariaId` no corpo (preenchido com o
 * do ADMIN logado — ver AuthContext/JWT).
 */
export const corretorService = {
  list(): Promise<Corretor[]> {
    return api.get<Corretor[]>("/corretores").then((r) => r.data);
  },
  create(payload: CorretorInput): Promise<Corretor> {
    return api
      .post<Corretor>("/corretores/cadastrar", payload)
      .then((r) => r.data);
  },
  /** Captações por corretor — só ADMIN (backend valida). */
  listarCaptacoes(): Promise<Captacao[]> {
    return api
      .get<Captacao[]>("/corretores/captacoes")
      .then((r) => r.data);
  },

  /*
   * Perfil de um corretor — as quatro chamadas da tela /corretores/{id}.
   * Todas são restritas ao ADMIN; o backend recusa os demais perfis.
   */

  buscarPorId(id: number): Promise<Corretor> {
    return api.get<Corretor>(`/corretores/${id}`).then((r) => r.data);
  },

  buscarMetricas(id: number): Promise<CorretorMetricas> {
    return api
      .get<CorretorMetricas>(`/corretores/${id}/metricas`)
      .then((r) => r.data);
  },

  listarImoveisDoCorretor(id: number): Promise<Imovel[]> {
    return api.get<Imovel[]>(`/corretores/${id}/imoveis`).then((r) => r.data);
  },

  listarClientesDoCorretor(id: number): Promise<Cliente[]> {
    return api.get<Cliente[]>(`/corretores/${id}/clientes`).then((r) => r.data);
  },
};
