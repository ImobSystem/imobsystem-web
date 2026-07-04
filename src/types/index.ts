/**
 * Tipos de domínio compartilhados por toda a aplicação.
 *
 * Mantemos aqui os contratos que espelham o que a API (Spring Boot) devolve,
 * para que services, contexts e componentes falem sempre a mesma "língua".
 */

/** Perfis de acesso suportados pelo backend. */
export type Perfil = "ADMIN" | "CORRETOR";

/** Usuário autenticado — o que guardamos em memória/contexto após o login. */
export interface Usuario {
  email: string;
  perfil: Perfil;
}

/** Corpo enviado no POST /auth/login. */
export interface LoginRequest {
  email: string;
  senha: string;
}

/** Resposta do POST /auth/login. */
export interface LoginResponse {
  token: string;
  email: string;
  perfil: Perfil;
}

/* ------------------------------------------------------------------ *
 * Entidades de negócio (placeholders para os próximos CRUDs).
 * Ainda não consumidas, mas já tipadas para acelerar as telas futuras.
 * ------------------------------------------------------------------ */

export interface Corretor {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  perfil: Perfil;
}

export interface Imovel {
  id: number;
  titulo: string;
  descricao?: string;
  tipo: string;
  preco: number;
  endereco: string;
  disponivel: boolean;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
}

export interface Negociacao {
  id: number;
  imovelId: number;
  clienteId: number;
  corretorId: number;
  status: string;
  valorProposta: number;
}
