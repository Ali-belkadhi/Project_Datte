"use client";
import { useState } from "react";
import { Pencil, Plus, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { creerCategorieDerive, majCategorieDerive, supprimerCategorieDerive } from "@/server/modules/catalogue/actions";
import type { CategorieDeriveItem } from "@/server/modules/catalogue/repositories/categorie-derive.repository.mongo";

function CategorySheet({ c, trigger }: { c?: CategorieDeriveItem; trigger: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [f, setF] = useState({
    code: c?.code ?? "",
    nom: c?.nom ?? "",
    description: c?.description ?? "",
    active: c ? c.active : true,
  });

  const creer = useAction(creerCategorieDerive, { onSuccess: () => setOuvert(false) });
  const maj = useAction(majCategorieDerive, { onSuccess: () => setOuvert(false) });
  const pending = creer.pending || maj.pending;

  const set = (k: keyof typeof f, val: string | boolean) => setF((x) => ({ ...x, [k]: val }));

  return (
    <Sheet open={ouvert} onOpenChange={setOuvert}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{c ? `Modifier ${c.nom}` : "Nouvelle catégorie dérivée"}</SheetTitle>
          <SheetDescription>Référentiel des produits dérivés (jus, sirops, confitures, pâte, etc.).</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-code">Code technique (ex: ROB, CONFITURE, JUS)</Label>
            <Input
              id="cat-code"
              value={f.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="CODE_CATEGORIE"
              disabled={Boolean(c)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-nom">Nom affiché</Label>
            <Input
              id="cat-nom"
              value={f.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder="Rob & Sirop de dattes"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              value={f.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brève description de la catégorie…"
            />
          </div>
          <div className="flex min-h-11 items-center justify-between">
            <Label htmlFor="cat-act">Active dans le catalogue</Label>
            <Switch id="cat-act" checked={f.active} onCheckedChange={(act) => set("active", act)} />
          </div>
        </div>
        <SheetFooter>
          <Button
            variant="brand"
            disabled={pending || !f.code || !f.nom}
            onClick={() => {
              if (c) {
                maj.run({ id: c.id, ...f });
              } else {
                creer.run(f);
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

function DeleteCategoryDialog({ item }: { item: CategorieDeriveItem }) {
  const [ouvert, setOuvert] = useState(false);
  const suppr = useAction(supprimerCategorieDerive, { onSuccess: () => setOuvert(false) });

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-danger" aria-label={`Supprimer ${item.nom}`}>
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer la catégorie {item.nom} ?</DialogTitle>
          <DialogDescription>
            Cette action retirera la catégorie des filtres et formulaires pour les nouveaux produits.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOuvert(false)} disabled={suppr.pending}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            disabled={suppr.pending}
            onClick={() => suppr.run({ id: item.id })}
          >
            {suppr.pending ? "Suppression…" : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryAdmin({ categories }: { categories: CategorieDeriveItem[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CategorySheet trigger={<Button variant="brand"><Plus aria-hidden /> Nouvelle catégorie</Button>} />
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-4">Catégorie</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="hidden sm:table-cell">Statut</TableHead>
              <TableHead className="pe-4 text-end"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="ps-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-accent-foreground">
                      <Layers className="size-4" />
                    </span>
                    {c.nom}
                  </div>
                </TableCell>
                <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{c.code}</code></TableCell>
                <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">{c.description}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${c.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="pe-4 text-end">
                  <div className="flex items-center justify-end gap-1">
                    <CategorySheet c={c} trigger={<Button variant="ghost" size="icon-sm" aria-label={`Modifier ${c.nom}`}><Pencil className="size-4" /></Button>} />
                    <DeleteCategoryDialog item={c} />
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
