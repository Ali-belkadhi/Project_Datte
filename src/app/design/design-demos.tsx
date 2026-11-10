"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/shared/filter-chips";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { SearchBar } from "@/components/shared/search-bar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { WeightPicker } from "@/components/shared/weight-picker";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { LazyDateLineup, LazyScene } from "@/components/three";

/** Démonstrations interactives du styleguide. */
export function InteractiveDemos() {
  const [g, setG] = useState(1000);
  const [q, setQ] = useState(2);
  const [chip, setChip] = useState("tous");
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl border bg-card p-4">
        <p className="text-sm font-semibold">WeightPicker</p>
        <WeightPicker value={g} onChange={setG} prixParKg={25500} />
      </div>
      <div className="space-y-4 rounded-2xl border bg-card p-4">
        <p className="text-sm font-semibold">QuantityStepper · FilterChips · SearchBar · ThemeToggle</p>
        <div className="flex flex-wrap gap-3">
          <QuantityStepper value={q} onChange={setQ} />
          <QuantityStepper value={q} onChange={setQ} size="compact" />
        </div>
        <FilterChips value={chip} onChange={setChip} chips={[{ value: "tous", label: "Tous", count: 24 }, { value: "dattes", label: "Dattes", count: 16 }, { value: "derives", label: "Dérivés", count: 8 }]} />
        <SearchBar onOpen={() => toast("La palette ⌘K s'ouvre depuis l'en-tête acheteur")} />
        <ThemeToggle showLabels />
      </div>
      <div className="space-y-3 rounded-2xl border bg-card p-4">
        <p className="text-sm font-semibold">ImageDropzone</p>
        <ImageDropzone compact items={[]} />
      </div>
      <div className="space-y-3 rounded-2xl border bg-card p-4">
        <p className="text-sm font-semibold">Toasts</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="brand" onClick={() => toast.success("Enregistré (démo)")}>Succès</Button>
          <Button variant="outline" onClick={() => toast.error("Certains champs sont à corriger.")}>Erreur</Button>
          <Button variant="ghost" onClick={() => toast("Ajouté au panier", { description: "Deglet Nour Extra · 2 kg" })}>Info</Button>
        </div>
      </div>
    </div>
  );
}

/** Les 8 dattes en 3D côte à côte. */
export function DatesLineupDemo() {
  return (
    <LazyScene className="h-64 overflow-hidden rounded-3xl border bg-card sm:h-auto sm:aspect-[16/7]" fallback={<p className="p-6 text-muted-foreground">WebGL indisponible.</p>}>
      <LazyDateLineup interactif />
    </LazyScene>
  );
}
