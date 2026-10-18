"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { ProductCard } from "@/components/shared/product-card";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";
import type { Produit, ProduitAvecVendeur, VarieteSlug } from "@/types/domain";
import { creerProduit, majProduit } from "@/server/modules/catalogue/actions";
import { AiFillButton } from "../ia-fiche/ai-fill-button";
import { useFakeStream } from "../ia-fiche/use-fake-stream";
import { FormSection, InfoSection, Modele3DSection, PrixSection, TypeSection, VisibiliteSection } from "./product-form-sections";
import { useProductForm, type ChampIA } from "./use-product-form";

type FicheIA = { nom: string; variete: VarieteSlug | null; categorieQualite: string | null; presentation: string | null; maturite: string | null; description: string };

/** Formulaire produit vendeur (création / édition) — IA-B, aperçu en direct, checklist, barre d'actions collante. */
export function ProductForm({ produit, fiche }: { produit?: Produit | null; fiche: FicheIA }) {
  const router = useRouter();
  const { b, maj, suggerer, suggeres, checklist, entree } = useProductForm(produit);
  const [erreurs, setErreurs] = useState<Record<string, string[] | undefined>>({});
  const flux = useFakeStream<ChampIA>((champ, valeur) => suggerer(champ, valeur));
  const action = useAction(produit ? majProduit : creerProduit, { onSuccess: () => router.push("/vendeur/produits") });

  const enregistrer = async (statut: "BROUILLON" | "PUBLIE") => {
    maj("statut", statut);
    const r = await action.run({ ...entree, statut });
    setErreurs(!r.ok && r.error.code === "VALIDATION" ? ((r.error.details as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {}) : {});
  };

  const remplirIA = () =>
    flux.lancer([
      { champ: "nom", valeur: fiche.nom },
      { champ: "variete", valeur: fiche.variete ?? "deglet-nour" },
      { champ: "categorieQualite", valeur: fiche.categorieQualite ?? "EXTRA" },
      { champ: "presentation", valeur: fiche.presentation ?? "BRANCHEE" },
      { champ: "maturite", valeur: fiche.maturite ?? "TAMR" },
      { champ: "description", valeur: fiche.description, mots: true },
    ]);

  const apercu: ProduitAvecVendeur = {
    vendeur: { id: "f-ben-amor", slug: "palmeraie-ben-amor", nomBoutique: "Palmeraie Ben Amor", verifie: true, region: "TOZEUR", couleur: "amber" },
    produit:
      entree.typeProduit === "DATTE"
        ? { ...entree, id: "apercu", slug: "apercu", fournisseurId: "f-ben-amor", nom: b.nom || "Nom du produit", variete: entree.variete ?? "deglet-nour", noteMoyenne: 0, nombreAvis: 0, nombreVentes: 0, visuel: { type: b.presentation === "BRANCHEE" ? "branchee" : b.presentation === "CONDITIONNEE" ? "barquette" : "vrac" }, modele3D: produit?.modele3D ?? null, creeLe: "2026-10-18", statut: "PUBLIE" }
        : { ...entree, id: "apercu", slug: "apercu", fournisseurId: "f-ben-amor", nom: b.nom || "Nom du produit", noteMoyenne: 0, nombreAvis: 0, nombreVentes: 0, visuel: { type: b.uniteContenance === "ML" ? "bouteille" : "bocal" }, modele3D: produit?.modele3D ?? null, creeLe: "2026-10-18", statut: "PUBLIE" },
  };

  const photos = Array.from({ length: b.photos }, (_, i) => ({
    id: `ph-${i}`,
    label: `Photo ${i + 1}`,
    apercu: <ProductIllustration type={apercu.produit.visuel.type} variete={apercu.produit.variete} variante={i % 4} seed={`form-${i}`} />,
  }));

  return (
    <div className="grid gap-6 pb-28 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="space-y-4">
        <FormSection n={1} titre="Photos" description="4 angles sur fond uni : l'IA s'en sert pour pré-remplir la fiche.">
          <ImageDropzone items={photos} onAdd={() => maj("photos", Math.min(8, b.photos + 1))} onRemove={() => maj("photos", Math.max(0, b.photos - 1))} />
          <AiFillButton etat={flux.etat} onClick={remplirIA} disabled={b.photos === 0} />
          {b.photos === 0 && <p className="text-[13px] text-muted-foreground">Ajoutez au moins une photo pour utiliser « Remplir avec l&apos;IA ».</p>}
          {flux.etat === "termine" && (
            <p className="flex items-center gap-2 rounded-xl bg-brand-soft px-3 py-2.5 text-sm font-semibold text-accent-foreground">
              <Info className="size-4" aria-hidden /> Vérifiez les suggestions avant de publier.
            </p>
          )}
        </FormSection>
        <FormSection n={2} titre="Type de produit">
          <TypeSection b={b} maj={maj} />
        </FormSection>
        <FormSection n={3} titre="Informations">
          <InfoSection b={b} maj={maj} suggeres={suggeres} erreurs={erreurs} />
        </FormSection>
        <FormSection n={4} titre="Prix et stock" description={b.typeProduit === "DATTE" ? "Les dattes se vendent au kilo." : "Les dérivés se vendent à l'unité."}>
          <PrixSection b={b} maj={maj} erreurs={erreurs} />
        </FormSection>
        <FormSection n={5} titre="Modèle 3D">
          <Modele3DSection a3D={!!produit?.modele3D} />
        </FormSection>
        <FormSection n={6} titre="Visibilité">
          <VisibiliteSection b={b} maj={maj} />
        </FormSection>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">Aperçu en direct</p>
        <div inert className="mx-auto max-w-[260px] lg:max-w-none">
          <ProductCard item={apercu} />
        </div>
        <div className="space-y-2 rounded-2xl border bg-card p-4">
          <p className="font-semibold">Avant de publier</p>
          <ul className="space-y-1.5 text-sm">
            {checklist.map((c) => (
              <li key={c.label} className={cn("flex items-center gap-2", c.ok ? "text-success" : "text-muted-foreground")}>
                {c.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <Circle className="size-4" aria-hidden />} {c.label}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t bg-background/95 px-4 py-3 backdrop-blur-xl lg:bottom-0 lg:start-64">
        <div className="mx-auto flex max-w-6xl justify-end gap-2">
          <Button variant="outline" disabled={action.pending} onClick={() => enregistrer("BROUILLON")}>
            Enregistrer le brouillon
          </Button>
          <Button variant="brand" disabled={action.pending} onClick={() => enregistrer("PUBLIE")}>
            Publier
          </Button>
        </div>
      </div>
    </div>
  );
}
