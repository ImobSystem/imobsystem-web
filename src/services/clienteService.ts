import api from "./api";
import type { Cliente, ClienteInput } from "@/types";

/** Chamadas à API de Clientes. */
export const clienteService = {
  list(): Promise<Cliente[]> {
    return api.get<Cliente[]>("/clientes").then((r) => r.data);
  },
  getById(id: number): Promise<Cliente> {
    return api.get<Cliente>(`/clientes/${id}`).then((r) => r.data);
  },
  create(payload: ClienteInput): Promise<Cliente> {
    return api.post<Cliente>("/clientes", payload).then((r) => r.data);
  },
  update(id: number, payload: ClienteInput): Promise<Cliente> {
    return api.put<Cliente>(`/clientes/${id}`, payload).then((r) => r.data);
  },
  remove(id: number): Promise<void> {
    return api.delete(`/clientes/${id}`).then(() => undefined);
  },
};
