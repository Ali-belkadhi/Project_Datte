"use client";
import { useEffect, useState } from "react";
import { Box, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProductPhoto } from "@/components/illustrations/product-photo";
import { LazyProductViewer, LazyScene } from "@/components/three";
import { STATUT_3D } from "@/lib/constants";
import type { ProduitBrouillon } from "./use-product-form";

type Maj = <K extends keyof ProduitBrouillon>(k: K, v: ProduitBrouillon[K]) => void;
type Props = { b: ProduitBrouillon; maj: Maj };

const TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_OCTETS = 10 * 1024 * 1024;

/** Envoi réel des photos vers /api/vendeur/medias (stockage local du module B). */
export function PhotosSection({ b, maj, enRoute }: Props & { enRoute?: (b: boolean) => void }) {
  const [envoi, setEnvoi] = useState(false);

  const ajouter = async (fichiers: File[]) => {
    const libres = 8 - b.photos.length;
    const valides = fichiers.filter((f) => {
      if (!TYPES.includes(f.type)) return toast.error(`« ${f.name} » : format accepté PNG, JPG ou WEBP.`), false;
      if (f.size > MAX_OCTETS) return toast.error(`« ${f.name} » : image trop lourde (10 Mo max).`), false;
      return true;
    });
    if (!valides.length) return;
    if (valides.length > libres) toast.message(`8 photos maximum : ${valides.length - libres} fichier(s) ignoré(s).`);
    setEnvoi(true);
    enRoute?.(true);
    const urls: string[] = [];
    for (const f of valides.slice(0, libres)) {
      try {
        const body = new FormData();
        body.append("image", f);
        body.append("skip3d", "1");
        const res = await fetch("/api/vendeur/medias", { method: "POST", body });
        const data = (await res.json()) as { imageUrl?: string; error?: string };
        if (!res.ok || !data.imageUrl) throw new Error(data.error ?? "Envoi impossible");
        urls.push(data.imageUrl);
      } catch (e) {
        toast.error(`« ${f.name} » : ${e instanceof Error ? e.message : "envoi impossible"}`);
      }
    }
    if (urls.length) maj("photos", [...b.photos, ...urls]);
    setEnvoi(false);
    enRoute?.(false);
  };

  const principale = (url: string) => maj("photos", [url, ...b.photos.filter((u) => u !== url)]);
  const retirer = (url: string) => maj("photos", b.photos.filter((u) => u !== url));

  return (
    <ImageDropzone
      items={b.photos.map((u, i) => ({
        id: u,
        label: `Photo ${i + 1}`,
        apercu: <ProductPhoto src={u} alt={`Photo ${i + 1}`} fallback={<div className="grid size-full place-items-center bg-sand text-xs text-muted-foreground">Image indisponible</div>} />,
      }))}
      onFiles={ajouter}
      envoiEnCours={envoi}
      onRemove={retirer}
      onMakePrimary={principale}
      aide="JPG, PNG ou WEBP, jusqu'à 10 Mo · fond uni, produit centré"
    />
  );
}

/** Génération 3D réelle (TRELLIS, Hugging Face) à partir de la photo principale. Aucune 3D n'est simulée. */
export function Modele3DSection({ b, maj, enRoute }: Props & { enRoute?: (b: boolean) => void }) {
  const [etat, setEtat] = useState<"repos" | "en-cours" | "erreur">("repos");
  const [erreur, setErreur] = useState("");
  const [ecoule, setEcoule] = useState(0);
  const a3D = b.modele3DUrl !== "";

  useEffect(() => {
    if (etat !== "en-cours") return;
    setEcoule(0);
    const t = setInterval(() => setEcoule((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [etat]);

  const generer = async () => {
    const source = b.photos[0];
    if (!source) return;
    setEtat("en-cours");
    setErreur("");
    enRoute?.(true);
    try {
      const blob = await fetch(source).then((r) => {
        if (!r.ok) throw new Error("Photo principale inaccessible.");
        return r.blob();
      });
      const body = new FormData();
      body.append("image", new File([blob], "photo", { type: blob.type || "image/jpeg" }));
      body.append("onlyModel", "1");
      const res = await fetch("/api/vendeur/medias", { method: "POST", body });
      const data = (await res.json()) as { modelUrl?: string; error?: string };
      if (!res.ok || !data.modelUrl) throw new Error(data.error ?? "Conversion 3D échouée.");
      maj("modele3DUrl", data.modelUrl);
      setEtat("repos");
      toast.success("Modèle 3D prêt : enregistrez le produit pour le publier.");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
      setEtat("erreur");
    } finally {
      enRoute?.(false);
    }
  };

  const etape = ecoule < 15 ? "Suppression de l'arrière-plan…" : ecoule < 45 ? "Génération de la structure 3D…" : ecoule < 90 ? "Création de la texture et du maillage…" : "Finalisation du modèle (file d'attente GPU possible)…";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl bg-sand p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-card text-accent-foreground">
            <Box className="size-5" aria-hidden />
          </span>
          <div>
            <StatusBadge status={a3D ? STATUT_3D.PUBLIE : { label: "Aucun modèle", tone: "neutral" }} />
            <p className="mt-1 text-[13px] text-muted-foreground">
              {etat === "en-cours"
                ? `Conversion en cours… ${Math.floor(ecoule / 60)}:${String(ecoule % 60).padStart(2, "0")} — ${etape}`
                : a3D
                  ? "Le modèle 3D sera visible sur la fiche (bouton « Voir en 3D »)."
                  : b.photos.length
                    ? "Générez un modèle 3D depuis votre photo principale (IA TRELLIS, 1 à 3 minutes)."
                    : "Ajoutez d'abord une photo : elle sert de base à la génération 3D."}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {a3D && (
            <Button type="button" variant="outline" size="sm" className="bg-card" onClick={() => maj("modele3DUrl", "")} disabled={etat === "en-cours"}>
              <Trash2 aria-hidden /> Retirer
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" className="bg-card" onClick={generer} disabled={etat === "en-cours" || b.photos.length === 0}>
            <RefreshCw className={etat === "en-cours" ? "animate-spin" : undefined} aria-hidden /> {a3D ? "Régénérer" : "Générer la 3D"}
          </Button>
        </div>
      </div>
      {etat === "erreur" && (
        <p role="alert" className="text-[13px] text-danger">
          {erreur} Vous pouvez enregistrer le produit sans 3D ou réessayer.
        </p>
      )}
      {a3D && (
        <LazyScene className="aspect-[4/3] max-h-80 w-full overflow-hidden rounded-2xl border bg-sand" eager fallback={<div className="size-full bg-sand" />}>
          <LazyProductViewer source={{ kind: "glb", url: b.modele3DUrl }} label="Aperçu du modèle 3D" />
        </LazyScene>
      )}
    </div>
  );
}
