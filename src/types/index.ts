/**
 * Tipos de domínio compartilhados por toda a aplicação.
 *
 * Espelham o contrato da API (Spring Boot). Para cada recurso mantemos:
 *  - a entidade (o que o GET devolve, com `id` e `imobiliariaId`);
 *  - o *Input (o que o POST/PUT recebe — sem campos derivados do token).
 *
 * Os enums são unions de string + arrays `*_OPTIONS` (para popular selects)
 * + mapas `*_LABELS` (para exibição amigável).
 */

/* ============================ Auth ============================ */

/** Perfis de acesso suportados pelo backend. */
export type Perfil = "ADMIN" | "CORRETOR";

/**
 * Usuário autenticado guardado no contexto/localStorage.
 * `imobiliariaId` é extraído do JWT (não vem no corpo do login).
 */
export interface Usuario {
  email: string;
  perfil: Perfil;
  imobiliariaId: number | null;
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

/** Corpo enviado no POST /auth/registro (cria imobiliária + usuário ADMIN). */
export interface RegistroRequest {
  nomeImobiliaria: string;
  cnpj: string;
  emailImobiliaria: string;
  telefone: string;
  nomeAdmin: string;
  emailAdmin: string;
  senha: string;
  creci: string;
}

/**
 * Resposta do POST /auth/registro. Diferente do login, já traz o
 * `imobiliariaId` explicitamente (não precisamos extrair do token).
 */
export interface RegistroResponse {
  token: string;
  email: string;
  perfil: Perfil;
  imobiliariaId: number;
}

/* ============================ Imobiliária ============================ */

/**
 * Dados da imobiliária do usuário logado (GET /imobiliarias/minha).
 *
 * `logoBase64` é a logo personalizada já no formato de data URL
 * (`data:image/png;base64,...`), pronta para ir direto no `src` de um <img>.
 * Vem `null` enquanto a imobiliária não subiu nenhuma logo.
 */
export interface Imobiliaria {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  /** Enums de billing do backend; ainda não exibidos na UI, por isso `string`. */
  statusPlano: string;
  plano: string;
  dataVencimento: string | null; // YYYY-MM-DD
  logoBase64: string | null;
}

/** Corpo do PUT /imobiliarias/logo (somente ADMIN). */
export interface AtualizarLogoRequest {
  logoBase64: string;
}

/* ============================ Imóveis ============================ */

export type Finalidade = "ALUGUEL" | "VENDA";
export type StatusImovel = "DISPONIVEL" | "NEGOCIANDO" | "FECHADO";

export interface Imovel {
  id: number;
  endereco: string;
  CEP: string;
  area_m2: number;
  finalidade: Finalidade;
  statusImovel: StatusImovel;
  imobiliariaId: number;
  /** URLs das fotos do imóvel (Cloudinary), na ordem cadastrada. */
  fotos: string[];
}

/** Corpo de POST/PUT /imoveis (sem imobiliariaId/corretor — vêm do token). */
export interface ImovelInput {
  endereco: string;
  CEP: string;
  area_m2: number;
  finalidade: Finalidade;
  statusImovel: StatusImovel;
}

/**
 * Foto de um imóvel. A URL já aponta pro Cloudinary — o backend só guarda
 * a referência (upload é feito direto do front pro Cloudinary).
 */
export interface FotoImovel {
  id: number;
  url: string;
  imovelId: number;
}

/* ============================ Corretores ============================ */

export interface Corretor {
  id: number;
  nome: string;
  email: string;
  creci: string;
  perfil: Perfil;
  imobiliariaId: number;
}

/** Corpo de POST /corretores/cadastrar (ainda exige imobiliariaId no body). */
export interface CorretorInput {
  nome: string;
  email: string;
  senha: string;
  creci: string;
  perfil: Perfil;
  imobiliariaId: number;
}

/* ============================ Clientes ============================ */

export type TipoCliente = "COMPRADOR" | "LOCATARIO" | "PROPRIETARIO";

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  tipoCliente: TipoCliente;
  imobiliariaId: number;
}

/** Corpo de POST/PUT /clientes (sem imobiliariaId/corretor — vêm do token). */
export interface ClienteInput {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  tipoCliente: TipoCliente;
}

/* ============================ Negociações ============================ */

export type StatusNegocio =
  | "OPORTUNIDADE"
  | "EM_ATENDIMENTO"
  | "VISITA_AGENDADA"
  | "PROPOSTA"
  | "GANHO"
  | "PERDIDO";

export interface Negociacao {
  id: number;
  finalidade: Finalidade;
  statusNegocio: StatusNegocio;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string | null;
  valor: number;
  motivoPerda: string | null;
  dataUltimaInteracao: string | null;
  imovelId: number;
  clienteId: number;
  corretorId: number;
}

/** Corpo de POST /negociacoes (corretor vem do token). */
export interface NegociacaoInput {
  finalidade: Finalidade;
  statusNegocio: StatusNegocio;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string | null;
  valor: number;
  imovelId: number;
  clienteId: number;
}

/* ============================ Metadados de enums ============================ *
 * Centralizados para reuso em selects (OPTIONS) e exibição (LABELS).
 * ------------------------------------------------------------------------- */

export const FINALIDADE_OPTIONS: Finalidade[] = ["ALUGUEL", "VENDA"];
export const FINALIDADE_LABELS: Record<Finalidade, string> = {
  ALUGUEL: "Aluguel",
  VENDA: "Venda",
};

export const STATUS_IMOVEL_OPTIONS: StatusImovel[] = [
  "DISPONIVEL",
  "NEGOCIANDO",
  "FECHADO",
];
export const STATUS_IMOVEL_LABELS: Record<StatusImovel, string> = {
  DISPONIVEL: "Disponível",
  NEGOCIANDO: "Negociando",
  FECHADO: "Fechado",
};

export const TIPO_CLIENTE_OPTIONS: TipoCliente[] = [
  "COMPRADOR",
  "LOCATARIO",
  "PROPRIETARIO",
];
export const TIPO_CLIENTE_LABELS: Record<TipoCliente, string> = {
  COMPRADOR: "Comprador",
  LOCATARIO: "Locatário",
  PROPRIETARIO: "Proprietário",
};

export const PERFIL_OPTIONS: Perfil[] = ["ADMIN", "CORRETOR"];
export const PERFIL_LABELS: Record<Perfil, string> = {
  ADMIN: "Administrador",
  CORRETOR: "Corretor",
};

/** Ordem das colunas do funil (kanban) de negociações. */
export const STATUS_NEGOCIO_OPTIONS: StatusNegocio[] = [
  "OPORTUNIDADE",
  "EM_ATENDIMENTO",
  "VISITA_AGENDADA",
  "PROPOSTA",
  "GANHO",
  "PERDIDO",
];
export const STATUS_NEGOCIO_LABELS: Record<StatusNegocio, string> = {
  OPORTUNIDADE: "Oportunidade",
  EM_ATENDIMENTO: "Em atendimento",
  VISITA_AGENDADA: "Visita agendada",
  PROPOSTA: "Proposta",
  GANHO: "Ganho",
  PERDIDO: "Perdido",
};
