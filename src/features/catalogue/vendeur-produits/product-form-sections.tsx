"use client";
import Link from "next/link";
import { Box, Grape, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { CATEGORIE_QUALITE, MATURITE, PRESENTATION, STATUT_3D, TYPE_DERIVE } from "@/lib/constants";
import { formatPoids } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AiSuggestedField } from "../ia-fiche/ai-fill-button";
import { VarietyPicker } from "../varietes/variety-picker";
import type { ChampIA, ProduitBrouillon } from "./use-product-form";

type SectionProps = {
  b: ProduitBrouillon;
  maj: <K extends keyof ProduitBrouillon>(k: K, v: ProduitBrouillon[K]) => void;
  suggeres: Set<ChampIA>;
  erreurs: Record<string, string[] | undefined>;
};

export function FormSection({ n, titre, description, children }: { n: number; titre: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4 md:p-5" aria-labelledby={`sec-${n}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground">{n}</span>
        <div>
          <h2 id={`sec-${n}`} className="font-sans text-base font-semibold">
            {titre}
          </h2>
          {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

const Err = ({ e }: { e?: string[] }) => (e?.[0] ? <p className="text-[13px] text-danger">{e[0]}</p> : null);

export function TypeSection({ b, maj }: Pick<SectionProps, "b" | "maj">) {
  return (
    <div role="radiogroup" aria-label="Type de produit" className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
      {[
        { v: "DATTE" as const, l: "Datte (au kilo)", icon: Grape },
        { v: "DERIVE" as const, l: "Produit dérivé", icon: Package },
      ].map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={b.typeProduit === o.v}
          onClick={() => maj("typeProduit", o.v)}
          className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold", b.typeProduit === o.v ? "bg-card shadow-soft" : "text-muted-foreground")}
        >
          <o.icon className="size-4" aria-hidden /> {o.l}
        </button>
      ))}
    </div>
  );
}

export function InfoSection({ b, maj, suggeres, erreurs }: SectionProps) {
  const datte = b.typeProduit === "DATTE";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="pf-nom">Nom du produit</Label>
        <AiSuggestedField visible={suggeres.has("nom")}>
          <Input id="pf-nom" value={b.nom} onChange={(e) => maj("nom", e.target.value)} placeholder="Deglet Nour Extra branchée" aria-invalid={!!erreurs.nom} />
        </AiSuggestedField>
        <Err e={erreurs.nom} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="pf-desc">Description</Label>
        <AiSuggestedField visible={suggeres.has("description")}>
          <Textarea id="pf-desc" value={b.description} onChange={(e) => maj("description", e.target.value)} className="min-h-32" placeholder="Origine, goût, texture, conseils de dégustation…" aria-invalid={!!erreurs.description} />
        </AiSuggestedField>
        <Err e={erreurs.description} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pf-var">Variété{datte ? "" : " (facultatif)"}</Label>
        <AiSuggestedField visible={suggeres.has("variete")}>
          <VarietyPicker id="pf-var" value={b.variete} onChange={(v) => maj("variete", v)} />
        </AiSuggestedField>
        <Err e={erreurs.variete} />
      </div>
      {datte ? (
        <>
          <Choix id="pf-cat" label="Catégorie qualité" value={b.categorieQualite} options={CATEGORIE_QUALITE} onChange={(v) => maj("categorieQualite", v as never)} ia={suggeres.has("categorieQualite")} />
          <Choix id="pf-pres" label="Présentation" value={b.presentation} options={PRESENTATION} onChange={(v) => maj("presentation", v as never)} ia={suggeres.has("presentation")} />
          <Choix
            id="pf-mat"
            label="Maturité"
            value={b.maturite}
            options={Object.fromEntries(Object.entries(MATURITE).map(([k, m]) => [k, `${m.label} (${m.detail})`]))}
            onChange={(v) => maj("maturite", v as never)}
            ia={suggeres.has("maturite")}
          />
          <div className="space-y-1.5">
            <Label htmlFor="pf-rec">Année de récolte</Label>
            <Input id="pf-rec" type="number" value={b.anneeRecolte} onChange={(e) => maj("anneeRecolte", Number(e.target.value))} />
          </div>
        </>
      ) : (
        <Choix id="pf-tder" label="Type de dérivé" value={b.typeDerive} options={TYPE_DERIVE} onChange={(v) => maj("typeDerive", v as never)} />
      )}
      <div className="flex min-h-11 items-center justify-between rounded-xl border px-3 sm:col-span-2">
        <Label htmlFor="pf-bio">Agriculture biologique certifiée</Label>
        <Switch id="pf-bio" checked={b.bio} onCheckedChange={(v) => maj("bio", v)} />
      </div>
    </div>
  );
}

function Choix({ id, label, value, options, onChange, ia = false }: { id: string; label: string; value: string; options: Record<string, string>; onChange: (v: string) => void; ia?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <AiSuggestedField visible={ia}>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(options).map(([k, l]) => (
              <SelectItem key={k} value={k}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AiSuggestedField>
    </div>
  );
}

export function PrixSection({ b, maj, erreurs }: Omit<SectionProps, "suggeres">) {
  const datte = b.typeProduit === "DATTE";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="pf-prix">{datte ? "Prix au kilo (DT)" : "Prix unitaire (DT)"}</Label>
        <div className="relative">
          <Input id="pf-prix" inputMode="decimal" value={b.prixDT} onChange={(e) => maj("prixDT", e.target.value)} placeholder="18,500" className="pe-16 tabular-nums" aria-invalid={!!(erreurs.prixParKg || erreurs.prixUnitaire)} />
          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">{datte ? "DT /kg" : "DT"}</span>
        </div>
        <Err e={erreurs.prixParKg ?? erreurs.prixUnitaire} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pf-stock">{datte ? "Stock (kg)" : "Stock (unités)"}</Label>
        <Input id="pf-stock" inputMode="decimal" value={b.stockQte} onChange={(e) => maj("stockQte", e.target.value)} placeholder={datte ? "48" : "120"} className="tabular-nums" />
      </div>
      {datte ? (
        <fieldset className="space-y-2 sm:col-span-2">
          <legend className="text-sm font-medium">Poids proposés à l&apos;acheteur</legend>
          <div className="flex flex-wrap gap-2">
            {[250, 500, 1000, 2000, 5000, 10000].map((g) => {
              const on = b.optionsPoids.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={on}
                  onClick={() => maj("optionsPoids", on ? b.optionsPoids.filter((x) => x !== g) : [...b.optionsPoids, g].sort((x, y) => x - y))}
                  className={cn("h-10 rounded-full border px-4 text-sm font-semibold", on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}
                >
                  {formatPoids(g)}
                </button>
              );
            })}
          </div>
          <Err e={erreurs.optionsPoids} />
        </fieldset>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="pf-cont">Contenance</Label>
            <div className="flex gap-2">
              <Input id="pf-cont" inputMode="numeric" value={b.contenance} onChange={(e) => maj("contenance", e.target.value)} className="tabular-nums" />
              <Select value={b.uniteContenance} onValueChange={(v) => maj("uniteContenance", v as "ML" | "G")}>
                <SelectTrigger className="w-24" aria-label="Unité">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G">g</SelectItem>
                  <SelectItem value="ML">ml</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-ing">Ingrédients</Label>
            <Input id="pf-ing" value={b.ingredients} onChange={(e) => maj("ingredients", e.target.value)} placeholder="Dattes (100 %)" />
          </div>
        </>
      )}
    </div>
  );
}

export function Modele3DSection({ a3D }: { a3D: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-sand p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-card text-accent-foreground">
          <Box className="size-5" aria-hidden />
        </span>
        <div>
          <StatusBadge status={a3D ? STATUT_3D.PUBLIE : { label: "Aucun modèle", tone: "neutral" }} />
          <p className="mt-1 text-[13px] text-muted-foreground">{a3D ? "Votre modèle 3D est visible sur la fiche." : "Montrez vos dattes sous tous les angles : créez votre premier modèle 3D."}</p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="bg-card">
        <Link href="/vendeur/studio-3d/nouveau">Créer dans le Studio 3D</Link>
      </Button>
    </div>
  );
}

export function VisibiliteSection({ b, maj }: Pick<SectionProps, "b" | "maj">) {
  return (
    <div role="radiogroup" aria-label="Visibilité" className="grid gap-2 sm:grid-cols-2">
      {[
        { v: "BROUILLON" as const, t: "Brouillon", d: "Invisible des acheteurs, modifiable à tout moment." },
        { v: "PUBLIE" as const, t: "Publié", d: "Visible dans le catalogue et la recherche." },
      ].map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={b.statut === o.v}
          onClick={() => maj("statut", o.v)}
          className={cn("rounded-xl border-2 p-3 text-start", b.statut === o.v ? "border-brand-fill bg-brand-soft/40" : "border-border")}
        >
          <span className="block font-semibold">{o.t}</span>
          <span className="block text-[13px] text-muted-foreground">{o.d}</span>
        </button>
      ))}
    </div>
  );
}
