import type { ReactNode } from "react";

export type BadgeTone =
  | "gray"
  | "green"
  | "amber"
  | "blue"
  | "red"
  | "violet";

/* Sempre fundo semi-transparente + texto colorido — nunca pill sólida. */
const TONE_CLASSES: Record<BadgeTone, string> = {
  gray: "bg-elevated text-muted-foreground",
  green: "bg-success-bg text-success",
  amber: "bg-warning-bg text-warning",
  blue: "bg-info-bg text-info",
  red: "bg-danger-bg text-danger",
  violet: "bg-accent-subtle text-accent",
};

/** Etiqueta colorida para status/tipos. */
export function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
