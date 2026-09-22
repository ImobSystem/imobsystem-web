"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { planoService } from "@/services/planoService";
import { getErrorMessage } from "@/services/errors";
import { formatDate } from "@/lib/format";
import {
  PLANO_LABELS,
  STATUS_ASSINATURA_LABELS,
  type PlanoStatus,
  type StatusAssinatura,
} from "@/types";

/** Tom do badge por situação da assinatura. */
const STATUS_TONE: Record<StatusAssinatura, BadgeTone> = {
  TRIAL: "blue",
  ATIVO: "green",
  INADIMPLENTE: "red",
  EXPIRADO: "red",
  CANCELADO: "gray",
};

/**
 * "Minha assinatura" nas Configurações — plano atual, situação e vencimento.
 *
 * Vive dentro de <AdminOnly> (a página inteira é), então aqui não há nova
 * checagem de perfil.
 */
export function AssinaturaSection() {
  const [status, setStatus] = useState<PlanoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStatus(await planoService.getStatus());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <Card className="mt-4 p-6">
      <h2 className="text-base font-semibold text-foreground">
        Minha assinatura
      </h2>
      <p className="mt-1 text-sm text-faint">
        Plano contratado, situação do pagamento e data de renovação.
      </p>

      {loading ? (
        <LoadingState label="Carregando assinatura..." />
      ) : error ? (
        <ErrorState message={error} onRetry={carregar} />
      ) : status ? (
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[13px] text-faint">Plano atual</dt>
              <dd className="mt-1.5">
                <Badge tone="violet">
                  {PLANO_LABELS[status.plano] ?? status.plano}
                </Badge>
              </dd>
            </div>

            <div>
              <dt className="text-[13px] text-faint">Situação</dt>
              <dd className="mt-1.5">
                <Badge tone={STATUS_TONE[status.statusPlano] ?? "gray"}>
                  {STATUS_ASSINATURA_LABELS[status.statusPlano] ??
                    status.statusPlano}
                </Badge>
              </dd>
            </div>

            <div>
              <dt className="text-[13px] text-faint">Vencimento</dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {formatDate(status.dataVencimento)}
              </dd>
            </div>

            <div>
              <dt className="text-[13px] text-faint">Dias restantes</dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {status.diasRestantes > 0
                  ? `${status.diasRestantes} dia${status.diasRestantes > 1 ? "s" : ""}`
                  : "Vencido"}
              </dd>
            </div>
          </dl>

          <Link
            href="/planos"
            className="inline-flex items-center justify-center rounded-lg border border-border-strong px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-hover hover:text-foreground"
          >
            Trocar plano
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
