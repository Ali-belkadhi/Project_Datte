"use client";
import { useState } from "react";
import { AlertTriangle, CircleCheck, CircleX, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiBadge } from "@/components/shared/ai-badge";
import { TYPE_DOCUMENT } from "@/lib/constants";
import { formatDateHeure } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";
import type { AnalyseIA, ChampAnalyseIA } from "@/types/domain";
import { analyserDocuments } from "@/server/modules/comptes/actions";

/** Jauge circulaire du score de confiance. */
function Jauge({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const ton = score >= 80 ? "text-success" : score >= 60 ? "text-brand-fill" : "text-danger";
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} className={cn("transition-all duration-500", ton)} />
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="text-center">
          <span className="block font-display text-2xl font-semibold tabular-nums">{score} %</span>
          <span className="block text-[10px] text-muted-foreground">confiance</span>
        </span>
      </span>
    </div>
  );
}

/** Ligne champ : valeur saisie / valeur lue + statut. */
export function FieldCheckRow({ c }: { c: ChampAnalyseIA }) {
  const Icone = c.statut === "OK" ? CircleCheck : c.statut === "DIFFERENCE" ? TriangleAlert : CircleX;
  const ton = c.statut === "OK" ? "text-success" : c.statut === "DIFFERENCE" ? "text-accent-foreground" : "text-danger";
  const libelle = c.statut === "OK" ? "Correspond" : c.statut === "DIFFERENCE" ? "Différence" : "Illisible";
  return (
    <li className={cn("grid gap-1 rounded-xl p-3 text-sm sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-3", c.statut !== "OK" ? "bg-brand-soft/50" : "bg-sand/60")}>
      <span>
        <span className="block font-semibold">{c.champ}</span>
        <span className="block text-[12px] text-muted-foreground">{TYPE_DOCUMENT[c.document]}</span>
      </span>
      <span className="text-[13px]">
        <span className="text-muted-foreground">Saisi :</span> {c.valeurSaisie}
        <br />
        <span className="text-muted-foreground">Lu :</span> {c.valeurLue ?? "—"}
      </span>
      <span className={cn("inline-flex items-center gap-1 font-semibold", ton)}>
        <Icone className="size-4" aria-hidden /> {libelle}
      </span>
    </li>
  );
}

/** Carte « Analyse IA » (IA-A) — indicative, la décision revient à l'administrateur. */
export function AiDocumentAnalysisCard({ analyse }: { analyse: AnalyseIA }) {
  const [a, setA] = useState(analyse);
  const { run, pending } = useAction(analyserDocuments, { onSuccess: (d) => d && setA({ ...d, analyseLe: new Date().toISOString() }) });
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4 md:p-5" aria-label="Analyse IA des documents">
      <header className="flex items-center gap-4">
        {pending ? <div className="bg-shimmer animate-shimmer size-24 shrink-0 rounded-full bg-muted" /> : <Jauge score={a.scoreConfiance} />}
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            Analyse IA <AiBadge />
          </h2>
          <p className="text-[13px] text-muted-foreground">Analysée le {formatDateHeure(a.analyseLe)}</p>
          <Button variant="outline" size="sm" disabled={pending} onClick={() => run({ fournisseurId: a.fournisseurId })}>
            <RefreshCw className={cn(pending && "animate-spin")} aria-hidden /> {pending ? "Analyse en cours…" : "Relancer l'analyse"}
          </Button>
        </div>
      </header>
      <ul className={cn("space-y-2", pending && "opacity-50")}>
        {a.champs.map((c) => (
          <FieldCheckRow key={c.champ} c={c} />
        ))}
      </ul>
      {a.alertes.length > 0 && (
        <ul className="space-y-1.5">
          {a.alertes.map((al) => (
            <li key={al} className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {al}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[12px] text-muted-foreground">L&apos;analyse est indicative ; la décision vous revient.</p>
    </section>
  );
}
