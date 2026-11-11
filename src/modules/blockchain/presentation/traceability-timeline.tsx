import { CheckCircle2 } from "lucide-react";
import { TRACEABILITY_STEP_LABELS, type TraceabilityActor, type TraceabilityStep } from "../domain/traceability";

const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export function TraceabilityTimeline({ history, actors = [] }: { history: TraceabilityStep[]; actors?: TraceabilityActor[] }) {
  if (!history.length) {
    return <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Aucune étape supplémentaire enregistrée pour ce lot.</p>;
  }

  return (
    <ol className="space-y-3">
      {history.map((step, index) => {
        const actor = actors.find((item) => item.wallet.toLowerCase() === step.responsibleActor.toLowerCase());
        return (
          <li key={`${step.stepType}-${step.date}-${index}`} className="relative grid grid-cols-[28px_1fr] gap-3">
            <div className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand">
              <CheckCircle2 className="size-4" aria-hidden />
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{TRACEABILITY_STEP_LABELS[step.stepType] ?? `Étape ${step.stepType}`}</p>
                <time className="text-xs text-muted-foreground" dateTime={new Date(step.date * 1000).toISOString()}>
                  {new Date(step.date * 1000).toLocaleString("fr-FR")}
                </time>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{step.location}</p>
              <p className="mt-2 text-xs" title={step.responsibleActor}>
                Acteur : <span className="font-semibold">{actor?.shopName ?? shortAddress(step.responsibleActor)}</span>
                {actor && <span className="text-muted-foreground"> · {actor.shopType}</span>}
              </p>
              {step.documentHash && <p className="mt-1 break-all font-mono text-xs text-muted-foreground">Preuve : {step.documentHash}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
