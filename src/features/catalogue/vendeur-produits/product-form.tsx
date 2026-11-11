"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Info } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-card";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";
import { produitMajSchema, produitSchema } from "@/lib/validation/catalogue";
import type { Produit, ProduitAvecVendeur, VarieteSlug } from "@/types/domain";
import { creerProduit, majProduit } from "@/server/modules/catalogue/actions";
import { AiFillButton } from "../ia-fiche/ai-fill-button";
import { useFakeStream } from "../ia-fiche/use-fake-stream";
import { Modele3DSection, PhotosSection } from "./media-sections";
import { FormSection, InfoSection, PrixSection, TypeSection, VisibiliteSection } from "./product-form-sections";
import { useProductForm, type ChampIA } from "./use-product-form";

type FicheIA = { nom: string; variete: VarieteSlug | null; categorieQualite: string | null; presentation: string | null; maturite: string | null; description: string };

const VENDEUR_DEFAUT = {
  id: "f-ben-amor",
  slug: "palmeraie-ben-amor",
  nomBoutique: "Palmeraie Ben Amor",
  verifie: true,
  region: "TOZEUR" as const,
  couleur: "amber" as const,
};

const CHAMPS_FORMULAIRE: Record<string, { id: string; label: string }> = {
  nom: { id: "pf-nom", label: "Nom du produit" },
  description: { id: "pf-desc", label: "Description" },
  variete: { id: "pf-var", label: "Variété" },
  categorieQualite: { id: "pf-cat", label: "Catégorie qualité" },
  presentation: { id: "pf-pres", label: "Présentation" },
  maturite: { id: "pf-mat", label: "Maturité" },
  anneeRecolte: { id: "pf-rec", label: "Année de récolte" },
  typeDerive: { id: "pf-tder", label: "Type de dérivé" },
  prixParKg: { id: "pf-prix", label: "Prix au kilo" },
  prixUnitaire: { id: "pf-prix", label: "Prix unitaire" },
  stockGrammes: { id: "pf-stock", label: "Stock" },
  stockUnites: { id: "pf-stock", label: "Stock" },
  optionsPoids: { id: "pf-poids", label: "Poids proposés" },
  contenance: { id: "pf-cont", label: "Contenance" },
  uniteContenance: { id: "pf-unite", label: "Unité" },
  ingredients: { id: "pf-ing", label: "Ingrédients" },
  photos: { id: "sec-1", label: "Photos" },
  modele3DUrl: { id: "sec-5", label: "Modèle 3D" },
};

function montrerErreur(champs: Record<string, string[] | undefined>, fallback?: string) {
  const premier = Object.entries(champs).find(([, messages]) => messages?.length);
  const champ = premier ? CHAMPS_FORMULAIRE[premier[0]] : undefined;
  const message = premier?.[1]?.[0] ?? fallback ?? "Vérifiez les champs du formulaire.";
  toast.error(champ ? `${champ.label} : ${message}` : message);
  if (champ) requestAnimationFrame(() => {
    const element = document.getElementById(champ.id);
    element?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    element?.focus({ preventScroll: true });
  });
}

/** Formulaire produit fournisseur (création / édition) — persistance MongoDB, photos et 3D réelles, aperçu en direct, checklist, barre d'actions collante. */
export function ProductForm({
  produit,
  fiche,
  vendeur = VENDEUR_DEFAUT,
}: {
  produit?: Produit | null;
  fiche: FicheIA;
  vendeur?: ProduitAvecVendeur["vendeur"];
}) {
  const router = useRouter();
  const { b, maj, suggerer, suggeres, checklist, entree } = useProductForm(produit);
  const [erreurs, setErreurs] = useState<Record<string, string[] | undefined>>({});
  const [occupe, setOccupe] = useState(false); // envoi de photo ou génération 3D en cours
  const flux = useFakeStream<ChampIA>((champ, valeur) => suggerer(champ, valeur));
  const action = useAction(produit ? majProduit : creerProduit, {
    onSuccess: () => {
      router.push("/fournisseur/produits");
      router.refresh();
    },
  });

  const enregistrer = async (statut: "BROUILLON" | "PUBLIE") => {
    maj("statut", statut);
    const input = { ...entree, statut, ...(produit ? { id: produit.id } : {}) };
    const validation = (produit ? produitMajSchema : produitSchema).safeParse(input);
    if (!validation.success) {
      const details = z.flattenError(validation.error);
      setErreurs(details.fieldErrors);
      montrerErreur(details.fieldErrors, details.formErrors[0]);
      return;
    }
    setErreurs({});
    const r = await action.run(validation.data);
    if (!r.ok && r.error.code === "VALIDATION") {
      const champs = (r.error.details as { fieldErrors?: Record<string, string[]> })?.fieldErrors ?? {};
      setErreurs(champs);
      montrerErreur(champs);
    }
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

  const modele3D = b.modele3DUrl ? ({ kind: "glb", url: b.modele3DUrl } as const) : null;
  const apercu: ProduitAvecVendeur = {
    vendeur,
    produit:
      entree.typeProduit === "DATTE"
        ? { ...entree, id: "apercu", slug: "apercu", fournisseurId: vendeur.id, nom: b.nom || "Nom du produit", variete: entree.variete ?? "deglet-nour", noteMoyenne: 0, nombreAvis: 0, nombreVentes: 0, visuel: { type: b.presentation === "BRANCHEE" ? "branchee" : b.presentation === "CONDITIONNEE" ? "barquette" : "vrac" }, modele3D, creeLe: "2026-10-18", statut: "PUBLIE" }
        : { ...entree, id: "apercu", slug: "apercu", fournisseurId: vendeur.id, nom: b.nom || "Nom du produit", noteMoyenne: 0, nombreAvis: 0, nombreVentes: 0, visuel: { type: b.uniteContenance === "ML" ? "bouteille" : "bocal" }, modele3D, creeLe: "2026-10-18", statut: "PUBLIE" },
  };

  return (
    <div className="grid gap-6 pb-28 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="space-y-4">
        <FormSection n={1} titre="Photos" description="Photo principale en premier · fond uni, produit centré : l'IA s'en sert pour pré-remplir la fiche.">
          <PhotosSection b={b} maj={maj} enRoute={setOccupe} />
          {erreurs.photos?.[0] && <p role="alert" className="text-[13px] text-danger">{erreurs.photos[0]}</p>}
          <AiFillButton etat={flux.etat} onClick={remplirIA} disabled={b.photos.length === 0} />
          {b.photos.length === 0 && <p className="text-[13px] text-muted-foreground">Ajoutez au moins une photo pour utiliser « Remplir avec l&apos;IA ».</p>}
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
          <Modele3DSection b={b} maj={maj} enRoute={setOccupe} />
          {erreurs.modele3DUrl?.[0] && <p role="alert" className="text-[13px] text-danger">{erreurs.modele3DUrl[0]}</p>}
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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-2">
          {occupe && <span className="me-auto text-[13px] text-muted-foreground">Envoi ou génération 3D en cours…</span>}
          <Button asChild variant="ghost" disabled={action.pending}>
            <Link href="/fournisseur/produits">Annuler</Link>
          </Button>
          <Button variant="outline" disabled={action.pending || occupe} onClick={() => enregistrer("BROUILLON")}>
            Enregistrer en brouillon
          </Button>
          <Button variant="brand" disabled={action.pending || occupe} onClick={() => enregistrer("PUBLIE")}>
            {action.pending ? "Enregistrement…" : "Enregistrer et publier"}
          </Button>
        </div>
      </div>
    </div>
  );
}
