"use client";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { useAction } from "@/hooks/use-action";
import type { Variete } from "@/types/domain";
import { creerVariete, majVariete, supprimerVariete } from "@/server/modules/catalogue/actions";

function VarietySheet({ v, trigger }: { v?: Variete; trigger: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [f, setF] = useState({
    nom: v?.nom ?? "",
    nomArabe: v?.nomArabe ?? "",
    slug: v?.slug ?? "",
    origine: v?.origine ?? "",
    description: v?.description ?? "",
    active: v ? v.active !== false : true,
  });

  const creer = useAction(creerVariete, { onSuccess: () => setOuvert(false) });
  const maj = useAction(majVariete, { onSuccess: () => setOuvert(false) });

  const set = (k: keyof typeof f, val: string | boolean) => setF((x) => ({ ...x, [k]: val }));
  const pending = creer.pending || maj.pending;

  return (
    <Sheet open={ouvert} onOpenChange={setOuvert}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{v ? `Modifier ${v.nom}` : "Nouvelle variété"}</SheetTitle>
          <SheetDescription>Référentiel des variétés proposé aux vendeurs et clients.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4">
          {(["nom", "nomArabe", "slug", "origine"] as const).map((k) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={`va-${k}`}>
                {{ nom: "Nom", nomArabe: "Nom arabe", slug: "Identifiant (slug)", origine: "Origine" }[k]}
              </Label>
              <Input
                id={`va-${k}`}
                value={f[k]}
                onChange={(e) => set(k, e.target.value)}
                dir={k === "nomArabe" ? "rtl" : undefined}
                disabled={Boolean(v && k === "slug")}
              />
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
          <Button
            variant="brand"
            disabled={pending || !f.nom || !f.slug}
            onClick={() => {
              if (v) {
                maj.run({ slug: v.slug, nom: f.nom, nomArabe: f.nomArabe, origine: f.origine, description: f.description, active: f.active });
              } else {
                creer.run({ ...f, moisDebutRecolte: 10, moisFinRecolte: 12 });
              }
            }}
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DeleteVarietyDialog({ variete }: { variete: Variete }) {
  const [ouvert, setOuvert] = useState(false);
  const suppr = useAction(supprimerVariete, { onSuccess: () => setOuvert(false) });

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-danger" aria-label={`Supprimer ${variete.nom}`}>
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer la variété {variete.nom} ?</DialogTitle>
          <DialogDescription>
            Cette action retirera la variété du référentiel. Les produits existants associés conserveront leurs données.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOuvert(false)} disabled={suppr.pending}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            disabled={suppr.pending}
            onClick={() => suppr.run({ slug: variete.slug })}
          >
            {suppr.pending ? "Suppression…" : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Admin : tableau des variétés + formulaire en Sheet + suppression. */
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
                  <div className="flex items-center justify-end gap-1">
                    <VarietySheet v={v} trigger={<Button variant="ghost" size="icon-sm" aria-label={`Modifier ${v.nom}`}><Pencil className="size-4" /></Button>} />
                    <DeleteVarietyDialog variete={v} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
