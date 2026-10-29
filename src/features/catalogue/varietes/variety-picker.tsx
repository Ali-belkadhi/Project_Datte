"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { VARIETY_ORDER, VARIETY_PRESETS } from "@/components/three/presets";
import type { VarieteSlug } from "@/types/domain";

/** Sélecteur de variété avec glyphes (formulaire produit, admin). */
export function VarietyPicker({ value, onChange, id, placeholder = "Choisir une variété" }: { value?: VarieteSlug; onChange: (v: VarieteSlug) => void; id?: string; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as VarieteSlug)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {VARIETY_ORDER.map((v) => (
          <SelectItem key={v} value={v}>
            <VarietyGlyph variete={v} className="size-5" />
            {VARIETY_PRESETS[v].nom}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
