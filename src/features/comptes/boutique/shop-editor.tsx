"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShopHero } from "@/components/shared/shop-hero";
import { GOUVERNORAT_LABEL, SHOP_TINTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { GOUVERNORATS } from "@/types/enums";
import type { Fournisseur, ShopTint } from "@/types/domain";
import { majBoutique } from "@/server/modules/comptes/actions";

/** Téléverse un média de boutique et renvoie son URL publique. */
function useEnvoiMedia() {
  const [envoi, setEnvoi] = useState<"logo" | "banniere" | null>(null);
  const envoyer = async (file: File, quoi: "logo" | "banniere") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("purpose", "image");
    setEnvoi(quoi);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Échec de l'envoi");
      return json.url;
    } finally {
      setEnvoi(null);
    }
  };
  return { envoi, envoyer };
}

/** Éditeur de boutique à gauche, aperçu en direct de la boutique publique à droite. */
export function ShopEditor({ boutique }: { boutique: Fournisseur }) {
  const [b, setB] = useState(boutique);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(boutique.logoUrl);
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(boutique.bannerUrl);
  const { envoi, envoyer } = useEnvoiMedia();
  const { run, pending } = useAction(majBoutique, { onSuccess: () => toast.success("Boutique mise à jour.") });
  const set = <K extends keyof Fournisseur>(k: K, v: Fournisseur[K]) => setB((x) => ({ ...x, [k]: v }));
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
      <form
        className="space-y-4 rounded-2xl border bg-card p-4 md:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run({ nomBoutique: b.nomBoutique, description: b.description, couleur: b.couleur, region: b.region, delaiExpedition: b.delaiExpedition, logoUrl, bannerUrl });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="se-nom">Nom</Label>
          <Input id="se-nom" value={b.nomBoutique} onChange={(e) => set("nomBoutique", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="se-desc">Description</Label>
          <Textarea id="se-desc" value={b.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed bg-sand/60 px-3 py-4 text-center text-sm hover:border-ring/60">
            <span className="font-semibold">{envoi === "logo" ? "Envoi…" : "Logo"}</span>
            <span className="text-[12px] text-muted-foreground">Carré · PNG ou JPG</span>
            {logoUrl && <img src={logoUrl} alt="Logo de la boutique" className="mt-2 size-16 rounded-full object-cover" />}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={envoi !== null}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setLogoUrl(await envoyer(file, "logo"));
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Envoi impossible");
                }
              }}
            />
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed bg-sand/60 px-3 py-4 text-center text-sm hover:border-ring/60">
            <span className="font-semibold">{envoi === "banniere" ? "Envoi…" : "Bannière"}</span>
            <span className="text-[12px] text-muted-foreground">1600 × 400 · PNG ou JPG</span>
            {bannerUrl && <img src={bannerUrl} alt="Bannière de la boutique" className="mt-2 h-12 w-full rounded-lg object-cover" />}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={envoi !== null}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setBannerUrl(await envoyer(file, "banniere"));
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Envoi impossible");
                }
              }}
            />
          </label>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Couleur d&apos;accent</legend>
          <div className="flex gap-2">
            {(Object.keys(SHOP_TINTS) as ShopTint[]).map((t) => (
              <button key={t} type="button" aria-pressed={b.couleur === t} aria-label={SHOP_TINTS[t].label} onClick={() => set("couleur", t)} className={cn("grid size-11 place-items-center rounded-full ring-offset-2 ring-offset-card", SHOP_TINTS[t].bg, b.couleur === t && "ring-2 ring-ring")}>
                {b.couleur === t && <Check className="size-4 text-cream" aria-hidden />}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="se-reg">Région</Label>
            <Select value={b.region} onValueChange={(v) => set("region", v as Fournisseur["region"])}>
              <SelectTrigger id="se-reg" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOUVERNORATS.map((g) => (
                  <SelectItem key={g} value={g}>{GOUVERNORAT_LABEL[g]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="se-exp">Horaires d&apos;expédition</Label>
            <Input id="se-exp" value={b.delaiExpedition} onChange={(e) => set("delaiExpedition", e.target.value)} />
          </div>
        </div>
        <Button type="submit" variant="brand" disabled={pending}>
          Enregistrer
        </Button>
      </form>
      <div className="space-y-2 lg:sticky lg:top-24">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">Aperçu en direct</p>
        <ShopHero boutique={b} apercu />
        <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">{b.description}</p>
      </div>
    </div>
  );
}
