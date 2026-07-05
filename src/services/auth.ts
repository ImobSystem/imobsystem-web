import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  RegistroResponse,
} from "@/types";

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

  /** Cadastra imobiliária + ADMIN. Rota pública; já devolve o token. */
  async registro(payload: RegistroRequest): Promise<RegistroResponse> {
    const { data } = await api.post<RegistroResponse>(
      "/auth/registro",
      payload,
    );
    return data;
  },
};
