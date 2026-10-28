import { Check, Home, Briefcase, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GOUVERNORAT_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Adresse } from "@/types/domain";

const ICONES: Record<string, typeof Home> = { Maison: Home, Bureau: Briefcase };

/** Carte d'adresse (« Maison », « Bureau »…). `selectionnee` pour le checkout. */
export function AddressCard({ adresse: a, selectionnee, actions, className }: { adresse: Adresse; selectionnee?: boolean; actions?: React.ReactNode; className?: string }) {
  const Icone = ICONES[a.libelle] ?? MapPin;
  return (
    <div className={cn("relative flex h-full flex-col gap-3 rounded-2xl border-2 bg-card p-4 transition-colors", selectionnee ? "border-brand-fill" : "border-border", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-accent-foreground">
            <Icone className="size-[18px]" aria-hidden />
          </span>
          {a.libelle}
        </p>
        {a.parDefaut && <Badge variant="brand">Par défaut</Badge>}
        {selectionnee && (
          <span className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full bg-brand-fill text-brand-foreground">
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
          </span>
        )}
      </div>
      <address className="text-[14px] leading-relaxed text-muted-foreground not-italic">
        <span className="font-medium text-foreground">{a.destinataire}</span>
        <br />
        {a.ligne1}
        {a.ligne2 && (
          <>
            <br />
            {a.ligne2}
          </>
        )}
        <br />
        {a.codePostal} {a.ville}, {GOUVERNORAT_LABEL[a.gouvernorat]}
      </address>
      <p className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <Phone className="size-3.5" aria-hidden /> {a.telephone}
      </p>
      {actions && <div className="mt-auto flex gap-2 pt-1">{actions}</div>}
    </div>
  );
}
