import api from "./api";
import type { LoginRequest, LoginResponse } from "@/types";

/**
 * Funções de API relacionadas à autenticação.
 *
 * Ficam isoladas do AuthContext para manter a regra "um lugar por
 * responsabilidade": aqui é só o transporte HTTP; o estado/sessão vive
 * no contexto.
 */
export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return data;
  },
};
