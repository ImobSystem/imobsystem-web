import type { BadgeTone } from "@/components/ui/Badge";
import type { StatusImovel, StatusNegocio, TipoCliente } from "@/types";

/** Formata número como moeda BRL. */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Formata "YYYY-MM-DD" (ou ISO) como dd/mm/aaaa, sem depender de timezone. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [datePart] = iso.split("T");
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

/* Mapas de cor (tom do Badge) por status. Mantidos aqui para reuso e
 * consistência visual entre listagens, dashboard e kanban. */

/*
 * Nota: o tom "violet" do Badge usa a cor accent (laranja ember) — reservada
 * SÓ para o badge de perfil ADMIN (ver CorretorFormModal/página de
 * corretores), em linha com a regra de "uma cor, um destaque" do design.
 * Nenhum outro mapeamento abaixo usa "violet".
 */

export const STATUS_IMOVEL_TONE: Record<StatusImovel, BadgeTone> = {
  DISPONIVEL: "green",
  NEGOCIANDO: "amber",
  FECHADO: "blue",
};

export const TIPO_CLIENTE_TONE: Record<TipoCliente, BadgeTone> = {
  COMPRADOR: "blue",
  LOCATARIO: "gray",
  PROPRIETARIO: "green",
};

export const STATUS_NEGOCIO_TONE: Record<StatusNegocio, BadgeTone> = {
  OPORTUNIDADE: "gray",
  EM_ATENDIMENTO: "blue",
  VISITA_AGENDADA: "blue",
  PROPOSTA: "amber",
  GANHO: "green",
  PERDIDO: "red",
};

/**
 * Cor da bolinha indicadora por status (kanban de negociações + lista de
 * atividade do dashboard) — espelha `STATUS_NEGOCIO_TONE`, nunca usa o accent.
 */
export const STATUS_NEGOCIO_DOT: Record<StatusNegocio, string> = {
  OPORTUNIDADE: "bg-faint",
  EM_ATENDIMENTO: "bg-info",
  VISITA_AGENDADA: "bg-info",
  PROPOSTA: "bg-warning",
  GANHO: "bg-success",
  PERDIDO: "bg-danger",
};
