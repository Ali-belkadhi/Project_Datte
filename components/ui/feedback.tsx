import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const STYLES = {
  succes: "border-forest/25 bg-forest/8 text-forest",
  erreur: "border-destructive/30 bg-destructive/8 text-destructive",
  info: "border-gold/35 bg-gold/10 text-gold-dark",
} as const;

const ICONS = { succes: CheckCircle2, erreur: AlertCircle, info: Info } as const;

export function Alerte({
  type,
  children,
  className,
}: {
  type: keyof typeof STYLES;
  children: React.ReactNode;
  className?: string;
}) {
  const Icone = ICONS[type];
  return (
    <div
      role={type === "erreur" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm leading-relaxed",
        STYLES[type],
        className,
      )}
    >
      <Icone className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}
