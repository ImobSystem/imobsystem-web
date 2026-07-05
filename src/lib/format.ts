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

export const STATUS_IMOVEL_TONE: Record<StatusImovel, BadgeTone> = {
  DISPONIVEL: "green",
  NEGOCIANDO: "amber",
  FECHADO: "gray",
};

export const TIPO_CLIENTE_TONE: Record<TipoCliente, BadgeTone> = {
  COMPRADOR: "blue",
  LOCATARIO: "violet",
  PROPRIETARIO: "green",
};

export const STATUS_NEGOCIO_TONE: Record<StatusNegocio, BadgeTone> = {
  OPORTUNIDADE: "gray",
  EM_ATENDIMENTO: "blue",
  VISITA_AGENDADA: "violet",
  PROPOSTA: "amber",
  GANHO: "green",
  PERDIDO: "red",
};
