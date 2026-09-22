import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { clearSession, tokenStorage } from "./storage";

/**
 * Cliente axios central da aplicação.
 *
 * Toda chamada HTTP deve passar por aqui para herdar automaticamente:
 *  1. A baseURL vinda da env (NEXT_PUBLIC_API_URL).
 *  2. A injeção do token JWT (request interceptor).
 *  3. O tratamento global de sessão expirada (response interceptor).
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ------------------------------------------------------------------ *
 * REQUEST INTERCEPTOR
 * ------------------------------------------------------------------ *
 * Antes de cada requisição sair, lemos o token JWT do localStorage e,
 * se existir, anexamos o header `Authorization: Bearer <token>`.
 *
 * Assim NENHUMA tela precisa montar esse header manualmente — basta
 * chamar `api.get(...)`, `api.post(...)`, etc.
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

/* ------------------------------------------------------------------ *
 * RESPONSE INTERCEPTOR
 * ------------------------------------------------------------------ *
 * Se a API responder 401 (não autenticado) ou 403 (proibido), o token
 * provavelmente expirou ou é inválido. Nesse caso limpamos a sessão e
 * mandamos o usuário de volta para /login.
 *
 * Exceção: a própria rota de login pode devolver 401/403 quando as
 * credenciais estão erradas. Aí NÃO redirecionamos — deixamos o erro
 * subir para a tela de login exibir a mensagem amigável.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isAuthRoute = url.includes("/auth/login");

    /*
     * 402 = PlanoInterceptor do backend recusando por assinatura vencida.
     * Vem ANTES do 401/403 e NÃO limpa a sessão: o usuário continua logado —
     * ele precisa estar para conseguir assinar.
     *
     * As telas de assinatura ficam de fora do redirecionamento: `/planos`
     * chama a própria API de plano, e mandar o usuário embora no meio da
     * escolha do plano o prenderia num vai-e-vem.
     */
    if (status === 402 && typeof window !== "undefined") {
      const telasDeAssinatura = ["/plano-expirado", "/planos"];
      if (!telasDeAssinatura.includes(window.location.pathname)) {
        window.location.href = "/plano-expirado";
      }
      return Promise.reject(error);
    }

    /*
     * 403 com código ACESSO_NEGADO vem do GlobalExceptionHandler do backend:
     * o usuário está logado, só não tem permissão para AQUELA ação (ex: um
     * CORRETOR tentando trocar o plano). Deslogar aqui seria errado — a tela
     * precisa receber o erro para mostrar a mensagem.
     *
     * O 403 de token expirado é gerado pelo Spring Security e não traz esse código.
     */
    const data = error.response?.data as { error?: string } | undefined;
    if (status === 403 && data?.error === "ACESSO_NEGADO") {
      return Promise.reject(error);
    }

    if ((status === 401 || status === 403) && !isAuthRoute) {
      clearSession();

      // Redireciona apenas no browser e apenas se ainda não estivermos no login,
      // evitando um loop de reload na própria página de login.
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
