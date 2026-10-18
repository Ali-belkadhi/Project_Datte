"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Lightbulb, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { Stepper } from "@/components/shared/stepper";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { DocumentIllustration } from "@/components/illustrations/scenes";
import { VerificationIllustration } from "@/components/illustrations/empty-illustrations";
import { GOUVERNORAT_LABEL, TYPE_DOCUMENT, TYPE_FOURNISSEUR } from "@/lib/constants";
import { useAction } from "@/hooks/use-action";
import { GOUVERNORATS, type TypeDocument } from "@/types/enums";
import { soumettreOnboarding } from "@/server/modules/comptes/actions";

const DOCS: TypeDocument[] = ["CIN", "RNE", "PATENTE", "ATTESTATION_BIO"];

/** Onboarding vendeur en 4 étapes, puis écran « Dossier en cours d'examen ». */
export function OnboardingStepper() {
  const [etape, setEtape] = useState(0);
  const [soumis, setSoumis] = useState(false);
  const [f, setF] = useState({ nomBoutique: "Palmeraie Ben Amor", type: "PRODUCTEUR", region: "TOZEUR", description: "", rib: "" });
  const [docs, setDocs] = useState<TypeDocument[]>([]);
  const { run, pending } = useAction(soumettreOnboarding, { onSuccess: () => setSoumis(true) });
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  if (soumis) return <VerificationStatus />;

  return (
    <div className="space-y-6">
      <Stepper etapes={["Boutique", "Documents", "Coordonnées bancaires", "Vérification"]} courante={etape} />
      <div className="rounded-2xl border bg-card p-4 md:p-6">
        {etape === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ob-nom">Nom de la boutique</Label>
              <Input id="ob-nom" value={f.nomBoutique} onChange={(e) => set("nomBoutique", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ob-type">Type</Label>
              <Select value={f.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger id="ob-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_FOURNISSEUR).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ob-reg">Région</Label>
              <Select value={f.region} onValueChange={(v) => set("region", v)}>
                <SelectTrigger id="ob-reg" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOUVERNORATS.map((g) => (
                    <SelectItem key={g} value={g}>{GOUVERNORAT_LABEL[g]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ob-desc">Description</Label>
              <Textarea id="ob-desc" value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Votre palmeraie, vos variétés, votre savoir-faire…" />
            </div>
            <div className="sm:col-span-2">
              <ImageDropzone compact max={1} titre="Logo de la boutique" aide="PNG carré, 512 px minimum" items={[]} />
            </div>
          </div>
        )}
        {etape === 1 && (
          <div className="space-y-4">
            <p className="flex items-start gap-2 rounded-xl bg-brand-soft p-3 text-sm text-accent-foreground">
              <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden /> Photo nette, document entier, sans reflet. Notre IA pré-vérifie la lisibilité ; un membre de l&apos;équipe valide.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {DOCS.map((d) => {
                const ok = docs.includes(d);
                return (
                  <li key={d} className="space-y-2 rounded-2xl border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{TYPE_DOCUMENT[d]}{d === "ATTESTATION_BIO" && <span className="font-normal text-muted-foreground"> (facultatif)</span>}</p>
                      <StatusBadge status={ok ? { label: "Ajouté", tone: "palm" } : { label: "À ajouter", tone: "amber" }} />
                    </div>
                    {ok ? (
                      <div className="aspect-[16/10] overflow-hidden rounded-xl border">
                        <DocumentIllustration type={d} nom="Hédi Ben Amor" />
                      </div>
                    ) : (
                      <ImageDropzone compact max={1} titre="Déposer le document" aide="JPG ou PDF" items={[]} onAdd={() => setDocs((x) => [...x, d])} />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {etape === 2 && (
          <div className="max-w-md space-y-3">
            <Label htmlFor="ob-rib">RIB (20 chiffres)</Label>
            <Input id="ob-rib" type="password" inputMode="numeric" autoComplete="off" value={f.rib} onChange={(e) => set("rib", e.target.value.replace(/\D/g, "").slice(0, 20))} placeholder="•••• •••• •••• •••• ••••" className="font-mono tracking-widest" />
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Lock className="size-3.5" aria-hidden /> Masqué et chiffré. Vos versements arrivent tous les quinze jours.
            </p>
          </div>
        )}
        {etape === 3 && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Boutique", f.nomBoutique],
              ["Type", TYPE_FOURNISSEUR[f.type as keyof typeof TYPE_FOURNISSEUR]],
              ["Région", GOUVERNORAT_LABEL[f.region as keyof typeof GOUVERNORAT_LABEL]],
              ["Documents", docs.length ? docs.map((d) => TYPE_DOCUMENT[d]).join(", ") : "Aucun"],
              ["RIB", f.rib ? `•••• ${f.rib.slice(-4)}` : "Non renseigné"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-sand p-3">
                <dt className="text-[12px] text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="flex justify-between gap-2">
        <Button variant="outline" disabled={etape === 0} onClick={() => setEtape(etape - 1)}>
          <ArrowLeft className="rtl:rotate-180" aria-hidden /> Retour
        </Button>
        {etape < 3 ? (
          <Button variant="brand" onClick={() => setEtape(etape + 1)}>
            Continuer <ArrowRight className="rtl:rotate-180" aria-hidden />
          </Button>
        ) : (
          <Button variant="brand" disabled={pending} onClick={() => run({ ...f, documents: docs.filter((d) => d !== "ATTESTATION_BIO") })}>
            Soumettre mon dossier
          </Button>
        )}
      </div>
    </div>
  );
}

/** Écran statut de vérification. */
export function VerificationStatus() {
  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-2xl border bg-card p-6 text-center">
      <div className="mx-auto w-40">
        <VerificationIllustration />
      </div>
      <h2 className="font-display text-2xl font-semibold">Dossier en cours d&apos;examen</h2>
      <p className="text-muted-foreground">Notre équipe vérifie vos documents. Vous serez notifié dès la validation de votre boutique.</p>
      <Timeline
        orientation="horizontal"
        etapes={[
          { cle: "s", libelle: "Soumis", etat: "terminee", date: "2026-10-18T10:00:00+01:00" },
          { cle: "e", libelle: "En examen", etat: "en-cours" },
          { cle: "v", libelle: "Vérifié", etat: "a-venir" },
        ]}
      />
      <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4" aria-hidden /> Délai indicatif : 24 à 48 h ouvrées
      </p>
      <Button asChild variant="outline">
        <Link href="/vendeur">Retour au tableau de bord</Link>
      </Button>
    </div>
  );
}
