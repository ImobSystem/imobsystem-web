import api from "./api";
import type { Captacao, Corretor, CorretorInput } from "@/types";

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
};
