"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Clock, Lightbulb, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Stepper } from "@/components/shared/stepper";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { DocumentIllustration } from "@/components/illustrations/scenes";
import { VerificationIllustration } from "@/components/illustrations/empty-illustrations";
import { toast } from "sonner";
import { GOUVERNORAT_LABEL, TYPE_DOCUMENT, TYPE_FOURNISSEUR } from "@/lib/constants";
import { useAction } from "@/hooks/use-action";
import { GOUVERNORATS, type TypeDocument } from "@/types/enums";
import { soumettreOnboarding } from "@/server/modules/comptes/actions";

const DOCS: TypeDocument[] = ["CIN", "RNE", "PATENTE", "ATTESTATION_BIO"];
type DocDepose = { type: TypeDocument; fichierUrl: string; nomFichier: string };

/** Onboarding vendeur en 4 étapes, puis écran « Dossier en cours d'examen ». */
export function OnboardingStepper({ boutique, motifRefus }: { boutique?: { nomBoutique: string; type: string; region: string; ville: string; description: string }; motifRefus?: string }) {
  const [etape, setEtape] = useState(0);
  const [soumis, setSoumis] = useState(false);
  const [f, setF] = useState({
    nomBoutique: boutique?.nomBoutique ?? "",
    type: boutique?.type ?? "PRODUCTEUR",
    region: boutique?.region ?? "TOZEUR",
    adresseExploitation: boutique?.ville ?? "",
    description: boutique?.description ?? "",
    rib: "",
  });
  const [docs, setDocs] = useState<DocDepose[]>([]);
  const [envoi, setEnvoi] = useState<TypeDocument | null>(null);
  const { run, pending } = useAction(soumettreOnboarding, { onSuccess: () => setSoumis(true) });
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  const envoyerDocument = async (type: TypeDocument, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("purpose", "document");
    fd.append("type", type);
    setEnvoi(type);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Échec de l'envoi");
      setDocs((x) => [...x.filter((d) => d.type !== type), { type, fichierUrl: json.url!, nomFichier: file.name }]);
      toast.success("Document envoyé.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi impossible");
    } finally {
      setEnvoi(null);
    }
  };

  if (soumis) return <VerificationStatus />;

  return (
    <div className="space-y-6">
      <Stepper etapes={["Boutique", "Documents", "Coordonnées bancaires", "Vérification"]} courante={etape} />
      {motifRefus && (
        <p className="flex items-start gap-2 rounded-2xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">Dossier précédent refusé.</strong> {motifRefus}
          </span>
        </p>
      )}
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
              <Label htmlFor="ob-adresse">Adresse d&apos;exploitation</Label>
              <Input id="ob-adresse" value={f.adresseExploitation} onChange={(e) => set("adresseExploitation", e.target.value)} placeholder="Route de Tozeur, km 4…" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ob-desc">Description</Label>
              <Textarea id="ob-desc" value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Votre palmeraie, vos variétés, votre savoir-faire…" />
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
                const depose = docs.find((x) => x.type === d);
                return (
                  <li key={d} className="space-y-2 rounded-2xl border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{TYPE_DOCUMENT[d]}{d === "ATTESTATION_BIO" && <span className="font-normal text-muted-foreground"> (facultatif)</span>}</p>
                      <StatusBadge status={depose ? { label: "Ajouté", tone: "palm" } : { label: "À ajouter", tone: "amber" }} />
                    </div>
                    {depose ? (
                      <div className="space-y-2">
                        {/\.(png|jpe?g|webp)$/i.test(depose.fichierUrl) ? (
                          <img src={depose.fichierUrl} alt={`Document ${TYPE_DOCUMENT[d]}`} className="aspect-[16/10] w-full rounded-xl border object-cover" />
                        ) : (
                          <div className="aspect-[16/10] overflow-hidden rounded-xl border">
                            <DocumentIllustration type={d} nom={depose.nomFichier} />
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[12px] text-muted-foreground">{depose.nomFichier}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setDocs((x) => x.filter((y) => y.type !== d))}>
                            Remplacer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed bg-sand/60 px-3 py-6 text-center text-sm hover:border-ring/60">
                        <span className="font-semibold">{envoi === d ? "Envoi…" : "Déposer le document"}</span>
                        <span className="text-[12px] text-muted-foreground">JPG, PNG ou PDF · 5 Mo max</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="sr-only"
                          disabled={envoi !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void envoyerDocument(d, file);
                          }}
                        />
                      </label>
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
              ["Documents", docs.length ? docs.map((d) => TYPE_DOCUMENT[d.type]).join(", ") : "Aucun"],
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
          <Button variant="brand" disabled={pending} onClick={() => run({ ...f, documents: docs })}>
            Soumettre mon dossier
          </Button>
        )}
      </div>
    </div>
  );
}

/** Écran statut de vérification (état réel du dossier, pas de date factice). */
export function VerificationStatus({
  statut = "EN_ATTENTE",
  soumisLe,
  verifieLe,
}: {
  statut?: "EN_ATTENTE" | "VERIFIE";
  soumisLe?: string;
  verifieLe?: string;
}) {
  const verifie = statut === "VERIFIE";
  const dateSoumission = soumisLe ?? new Date().toISOString();
  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-2xl border bg-card p-6 text-center">
      <div className="mx-auto w-40">
        <VerificationIllustration />
      </div>
      <h2 className="font-display text-2xl font-semibold">{verifie ? "Boutique vérifiée" : "Dossier en cours d'examen"}</h2>
      <p className="text-muted-foreground">
        {verifie
          ? "Votre boutique est validée : elle est désormais visible dans le catalogue DEGLA."
          : "Notre équipe vérifie vos documents. Vous serez notifié dès la validation de votre boutique."}
      </p>
      <Timeline
        orientation="horizontal"
        etapes={[
          { cle: "s", libelle: "Soumis", etat: "terminee", date: dateSoumission },
          { cle: "e", libelle: "En examen", etat: verifie ? "terminee" : "en-cours", date: verifie ? dateSoumission : undefined },
          { cle: "v", libelle: "Vérifié", etat: verifie ? "terminee" : "a-venir", date: verifie ? (verifieLe ?? dateSoumission) : undefined },
        ]}
      />
      <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4" aria-hidden /> {verifie ? "Validation confirmée par l'équipe DEGLA" : "Délai indicatif : 24 à 48 h ouvrées"}
      </p>
      <Button asChild variant={verifie ? "brand" : "outline"}>
        <Link href="/vendeur">{verifie ? "Accéder à mon tableau de bord" : "Retour au tableau de bord"}</Link>
      </Button>
    </div>
  );
}
