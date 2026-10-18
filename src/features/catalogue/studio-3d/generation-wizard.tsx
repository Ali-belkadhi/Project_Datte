"use client";
import { useEffect, useState } from "react";
import { Check, Loader2, RefreshCw, Send, Sun, Target, Rotate3d, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { Stepper } from "@/components/shared/stepper";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { StudioPreview } from "@/components/three";
import { useAction } from "@/hooks/use-action";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { Modele3DVendeur } from "@/types/domain";
import { lancerGeneration3D, publierModele3D } from "@/server/modules/catalogue/actions";

const ETAPES_GEN = ["Analyse des photos", "Reconstruction du volume", "Application des textures", "Optimisation pour mobile"];
const CONSEILS = [
  { icon: Square, t: "Fond uni", d: "Nappe claire ou mur blanc, sans motif." },
  { icon: Target, t: "Produit centré", d: "Le produit occupe la moitié du cadre." },
  { icon: Rotate3d, t: "4 angles", d: "Face, profil, dessus et trois-quarts." },
  { icon: Sun, t: "Lumière douce", d: "Près d'une fenêtre, sans reflet direct." },
];

/** Assistant de génération 3D en 3 étapes : photos → génération (~8 s simulées) → revue. */
export function GenerationWizard({ modele, solde }: { modele: Modele3DVendeur; solde: number }) {
  const pret = modele.statut === "PRET" || modele.statut === "PUBLIE";
  const [etape, setEtape] = useState(pret ? 2 : 0);
  const [photos, setPhotos] = useState(pret ? 4 : 0);
  const [pct, setPct] = useState(pret ? 100 : 0);
  const reduit = useReducedMotion();
  const lancer = useAction(lancerGeneration3D, { silencieux: true });
  const publier = useAction(publierModele3D);
  const cout = photos > 1 ? 2 : 1;

  useEffect(() => {
    if (etape !== 1) return;
    const debut = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - debut) / 8000) * 100));
      setPct(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setEtape(2), 400);
      }
    }, reduit ? 400 : 80);
    return () => clearInterval(id);
  }, [etape, reduit]);

  const source = modele.source ?? { kind: "procedural-date" as const, variete: modele.variete ?? "deglet-nour", arrangement: "pile" as const };

  return (
    <div className="space-y-6">
      <Stepper etapes={["Choisir les photos", "Génération", "Revue"]} courante={etape} />
      {etape === 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4 rounded-2xl border bg-card p-4 md:p-5">
            <ImageDropzone
              max={4}
              titre="Ajoutez 1 à 4 photos du produit"
              items={Array.from({ length: photos }, (_, i) => ({ id: `p${i}`, label: `Angle ${i + 1}`, apercu: <ProductIllustration type={modele.visuel} variete={modele.variete} variante={i} seed={modele.produitId} /> }))}
              onAdd={() => setPhotos((n) => Math.min(4, n + 1))}
              onRemove={() => setPhotos((n) => Math.max(0, n - 1))}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Coût : <strong className="text-foreground">{cout} crédit{cout > 1 ? "s" : ""}</strong> · solde {solde}
              </p>
              <Button
                variant="brand"
                disabled={photos === 0 || lancer.pending}
                onClick={async () => {
                  await lancer.run({ produitId: modele.produitId, photoIds: Array.from({ length: photos }, (_, i) => `p${i}`) });
                  setEtape(1);
                }}
              >
                Lancer la génération
              </Button>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {CONSEILS.map((c) => (
              <li key={c.t} className="flex gap-3 rounded-2xl border bg-card p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-accent-foreground">
                  <c.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{c.t}</span>
                  <span className="block text-[12px] text-muted-foreground">{c.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {etape === 1 && (
        <div className="mx-auto max-w-xl space-y-6 rounded-2xl border bg-card p-6 text-center">
          <p className="font-display text-5xl font-semibold tabular-nums">{pct} %</p>
          <Progress value={pct} className="h-2" aria-label="Progression" />
          <ol className="space-y-2 text-start">
            {ETAPES_GEN.map((e, i) => {
              const seuil = (i + 1) * 25;
              const fait = pct >= seuil;
              const enCours = !fait && pct >= i * 25;
              return (
                <li key={e} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm", enCours && "bg-brand-soft font-semibold", fait && "text-success")}>
                  {fait ? <Check className="size-4" aria-hidden /> : enCours ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <span className="size-4 rounded-full border-2" aria-hidden />}
                  {e}
                </li>
              );
            })}
          </ol>
          <p className="text-[13px] text-muted-foreground">Génération simulée — vous serez notifié quand le modèle sera prêt.</p>
        </div>
      )}
      {etape === 2 && (
        <div className="space-y-4">
          <StudioPreview source={source} nom={modele.produitNom} polycount={modele.polycount ?? 31800} fallback={<ProductIllustration type={modele.visuel} variete={modele.variete} />} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => (setPct(0), setEtape(1))}>
              <RefreshCw aria-hidden /> Régénérer (2 crédits)
            </Button>
            <Button variant="brand" disabled={publier.pending} onClick={() => publier.run({ modeleId: modele.id })}>
              <Send aria-hidden /> Publier sur la fiche produit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
