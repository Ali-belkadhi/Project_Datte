"use client";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { VARIETY_ORDER, VARIETY_PRESETS } from "@/components/three/presets";
import { CATEGORIE_QUALITE, GOUVERNORAT_LABEL, MATURITE, PRESENTATION, REGIONS_PRODUCTRICES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CatalogueFiltersApi } from "./use-catalogue-filters";

const PRIX_MAX = 50000;

function Coche({ id, label, checked, onChange, icon }: { id: string; label: string; checked: boolean; onChange: () => void; icon?: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </Label>
    </div>
  );
}

/** Panneau de filtres (sidebar collante desktop, contenu du Drawer mobile). */
export function FilterPanel({ api, idPrefix = "f" }: { api: CatalogueFiltersApi; idPrefix?: string }) {
  const { filtres: f, basculerListe, basculerBool, definir, definirPrix } = api;
  const [prix, setPrix] = useState<[number, number]>([f.prixMin ?? 0, f.prixMax ?? PRIX_MAX]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold">Type</p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {[
            { v: undefined, l: "Tout" },
            { v: "DATTE", l: "Dattes" },
            { v: "DERIVE", l: "Dérivés" },
          ].map((o) => (
            <button
              key={o.l}
              type="button"
              onClick={() => definir("type", o.v)}
              className={cn("h-9 rounded-lg text-[13px] font-semibold transition-colors", f.type === o.v ? "bg-card shadow-soft" : "text-muted-foreground hover:text-foreground")}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["variete", "prix", "region"]} className="space-y-1">
        <AccordionItem value="variete">
          <AccordionTrigger className="text-sm font-semibold">Variété</AccordionTrigger>
          <AccordionContent className="space-y-0.5">
            {VARIETY_ORDER.map((v) => (
              <Coche
                key={v}
                id={`${idPrefix}-v-${v}`}
                label={VARIETY_PRESETS[v].nom}
                checked={!!f.varietes?.includes(v)}
                onChange={() => basculerListe("varietes", v)}
                icon={<VarietyGlyph variete={v} className="size-5" />}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="prix">
          <AccordionTrigger className="text-sm font-semibold">Prix</AccordionTrigger>
          <AccordionContent className="space-y-3 px-1 pt-2">
            <Slider
              min={0}
              max={PRIX_MAX}
              step={500}
              value={prix}
              onValueChange={(v) => setPrix([v[0], v[1]] as [number, number])}
              onValueCommit={(v) => definirPrix(v[0] || undefined, v[1] < PRIX_MAX ? v[1] : undefined)}
              aria-label="Fourchette de prix"
            />
            <p className="flex justify-between text-[13px] text-muted-foreground tabular-nums">
              <span>{(prix[0] / 1000).toLocaleString("fr-FR")} DT</span>
              <span>{prix[1] >= PRIX_MAX ? "50 DT et +" : `${(prix[1] / 1000).toLocaleString("fr-FR")} DT`}</span>
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="region">
          <AccordionTrigger className="text-sm font-semibold">Région</AccordionTrigger>
          <AccordionContent className="space-y-0.5">
            {REGIONS_PRODUCTRICES.map((r) => (
              <Coche key={r} id={`${idPrefix}-r-${r}`} label={GOUVERNORAT_LABEL[r]} checked={!!f.regions?.includes(r)} onChange={() => basculerListe("regions", r)} />
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="presentation">
          <AccordionTrigger className="text-sm font-semibold">Présentation</AccordionTrigger>
          <AccordionContent className="space-y-0.5">
            {Object.entries(PRESENTATION).map(([k, l]) => (
              <Coche key={k} id={`${idPrefix}-p-${k}`} label={l} checked={!!f.presentations?.includes(k as never)} onChange={() => basculerListe("presentations", k)} />
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="maturite">
          <AccordionTrigger className="text-sm font-semibold">Maturité</AccordionTrigger>
          <AccordionContent className="space-y-0.5">
            {Object.entries(MATURITE).map(([k, m]) => (
              <Coche key={k} id={`${idPrefix}-m-${k}`} label={`${m.label} (${m.detail})`} checked={!!f.maturites?.includes(k as never)} onChange={() => basculerListe("maturites", k)} />
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="categorie">
          <AccordionTrigger className="text-sm font-semibold">Catégorie</AccordionTrigger>
          <AccordionContent className="space-y-0.5">
            {Object.entries(CATEGORIE_QUALITE).map(([k, l]) => (
              <Coche key={k} id={`${idPrefix}-c-${k}`} label={l} checked={!!f.categories?.includes(k as never)} onChange={() => basculerListe("categories", k)} />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-1 border-t pt-4">
        {[
          { k: "bio" as const, l: "Bio" },
          { k: "avec3D" as const, l: "Disponible en 3D" },
          { k: "vendeurVerifie" as const, l: "Vendeur vérifié" },
        ].map((o) => (
          <div key={o.k} className="flex min-h-11 items-center justify-between">
            <Label htmlFor={`${idPrefix}-${o.k}`} className="text-sm font-semibold">
              {o.l}
            </Label>
            <Switch id={`${idPrefix}-${o.k}`} checked={!!f[o.k]} onCheckedChange={() => basculerBool(o.k)} />
          </div>
        ))}
      </div>
    </div>
  );
}
