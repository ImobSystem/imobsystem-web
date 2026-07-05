import type { ReactNode } from "react";

export type BadgeTone =
  | "gray"
  | "green"
  | "amber"
  | "blue"
  | "red"
  | "violet";

const TONE_CLASSES: Record<BadgeTone, string> = {
  gray: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  green:
    "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  violet:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
