"use client";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { useAction } from "@/hooks/use-action";
import type { Variete } from "@/types/domain";
import { creerVariete } from "@/server/modules/catalogue/actions";

function VarietySheet({ v, trigger }: { v?: Variete; trigger: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [f, setF] = useState({ nom: v?.nom ?? "", nomArabe: v?.nomArabe ?? "", slug: v?.slug ?? "", origine: v?.origine ?? "", description: v?.description ?? "", active: true });
  const { run, pending } = useAction(creerVariete, { onSuccess: () => setOuvert(false) });
  const set = (k: keyof typeof f, val: string | boolean) => setF((x) => ({ ...x, [k]: val }));
  return (
    <Sheet open={ouvert} onOpenChange={setOuvert}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{v ? `Modifier ${v.nom}` : "Nouvelle variété"}</SheetTitle>
          <SheetDescription>Référentiel des variétés proposé aux vendeurs.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4">
          {(["nom", "nomArabe", "slug", "origine"] as const).map((k) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={`va-${k}`}>{{ nom: "Nom", nomArabe: "Nom arabe", slug: "Identifiant (slug)", origine: "Origine" }[k]}</Label>
              <Input id={`va-${k}`} value={f[k]} onChange={(e) => set(k, e.target.value)} dir={k === "nomArabe" ? "rtl" : undefined} />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="va-desc">Description</Label>
            <Textarea id="va-desc" value={f.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="flex min-h-11 items-center justify-between">
            <Label htmlFor="va-act">Active</Label>
            <Switch id="va-act" checked={f.active} onCheckedChange={(c) => set("active", c)} />
          </div>
        </div>
        <SheetFooter>
          <Button variant="brand" disabled={pending} onClick={() => run({ ...f, moisDebutRecolte: 10, moisFinRecolte: 12 })}>Enregistrer</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** Admin : tableau des variétés + formulaire en Sheet. */
export function VarietyAdmin({ varietes }: { varietes: Variete[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <VarietySheet trigger={<Button variant="brand"><Plus aria-hidden /> Nouvelle variété</Button>} />
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-4">Variété</TableHead>
              <TableHead className="hidden md:table-cell">Origine</TableHead>
              <TableHead className="hidden md:table-cell">Saison</TableHead>
              <TableHead className="pe-4 text-end"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {varietes.map((v) => (
              <TableRow key={v.slug}>
                <TableCell className="ps-4">
                  <span className="flex items-center gap-3">
                    <VarietyGlyph variete={v.slug} className="size-8" />
                    <span>
                      <span className="block font-semibold">{v.nom}</span>
                      <span className="block text-[12px] text-muted-foreground" lang="ar">{v.nomArabe}</span>
                    </span>
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">{v.origine}</TableCell>
                <TableCell className="hidden md:table-cell">{v.saison}</TableCell>
                <TableCell className="pe-4 text-end">
                  <VarietySheet v={v} trigger={<Button variant="ghost" size="icon-sm" aria-label={`Modifier ${v.nom}`}><Pencil /></Button>} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
