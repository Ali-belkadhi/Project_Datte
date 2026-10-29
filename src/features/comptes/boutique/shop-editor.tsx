"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { ShopHero } from "@/components/shared/shop-hero";
import { GOUVERNORAT_LABEL, SHOP_TINTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";
import { GOUVERNORATS } from "@/types/enums";
import type { Fournisseur, ShopTint } from "@/types/domain";
import { majBoutique } from "@/server/modules/comptes/actions";

/** Éditeur de boutique à gauche, aperçu en direct de la boutique publique à droite. */
export function ShopEditor({ boutique }: { boutique: Fournisseur }) {
  const [b, setB] = useState(boutique);
  const { run, pending } = useAction(majBoutique);
  const set = <K extends keyof Fournisseur>(k: K, v: Fournisseur[K]) => setB((x) => ({ ...x, [k]: v }));
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
      <form
        className="space-y-4 rounded-2xl border bg-card p-4 md:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void run({ nomBoutique: b.nomBoutique, description: b.description, couleur: b.couleur, region: b.region, delaiExpedition: b.delaiExpedition });
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
          <ImageDropzone compact max={1} titre="Logo" aide="Carré" items={[]} />
          <ImageDropzone compact max={1} titre="Bannière" aide="1600 × 400" items={[]} />
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
