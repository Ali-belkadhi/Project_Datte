"use client";
import { useState } from "react";
import { Coins, Pencil, Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { creerPackCredits, majPackCredits, supprimerPackCredits } from "@/server/modules/catalogue/actions";
import type { PackCredits3D } from "@/types/domain";

type PackWithActif = PackCredits3D & { actif?: boolean };

function PackSheet({ pack, trigger }: { pack?: PackWithActif; trigger: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [f, setF] = useState({
    nom: pack?.nom ?? "",
    nombreCredits: pack?.nombreCredits ?? 10,
    prix: pack ? pack.prix / 1000 : 35, // millimes en DT
    description: pack?.description ?? "",
    misEnAvant: pack?.misEnAvant ?? false,
    actif: pack?.actif !== false,
  });

  const creer = useAction(creerPackCredits, { onSuccess: () => setOuvert(false) });
  const maj = useAction(majPackCredits, { onSuccess: () => setOuvert(false) });
  const pending = creer.pending || maj.pending;

  const set = (k: keyof typeof f, val: string | number | boolean) => setF((x) => ({ ...x, [k]: val }));

  return (
    <Sheet open={ouvert} onOpenChange={setOuvert}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{pack ? `Modifier « ${pack.nom} »` : "Nouveau pack de crédits"}</SheetTitle>
          <SheetDescription>Configurez le tarif et le nombre de crédits accordés pour la modélisation 3D.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4">
          <div className="space-y-1.5">
            <Label htmlFor="pack-nom">Nom du pack</Label>
            <Input
              id="pack-nom"
              value={f.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder="Ex: Pack Découverte, Pro, Coopérative"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pack-credits">Nombre de crédits</Label>
              <Input
                id="pack-credits"
                type="number"
                min={1}
                value={f.nombreCredits}
                onChange={(e) => set("nombreCredits", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pack-prix">Prix (DT)</Label>
              <Input
                id="pack-prix"
                type="number"
                step="0.5"
                min={0}
                value={f.prix}
                onChange={(e) => set("prix", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pack-desc">Description</Label>
            <Textarea
              id="pack-desc"
              value={f.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Avantages du pack pour les vendeurs…"
            />
          </div>
          <div className="flex min-h-11 items-center justify-between">
            <Label htmlFor="pack-featured">Mettre en avant (badge « Populaire »)</Label>
            <Switch id="pack-featured" checked={f.misEnAvant} onCheckedChange={(val) => set("misEnAvant", val)} />
          </div>
          <div className="flex min-h-11 items-center justify-between">
            <Label htmlFor="pack-act">Actif (disponible à l&apos;achat)</Label>
            <Switch id="pack-act" checked={f.actif} onCheckedChange={(val) => set("actif", val)} />
          </div>
        </div>
        <SheetFooter>
          <Button
            variant="brand"
            disabled={pending || !f.nom || f.nombreCredits <= 0 || f.prix <= 0}
            onClick={() => {
              const data = {
                nom: f.nom,
                nombreCredits: f.nombreCredits,
                prix: Math.round(f.prix * 1000), // conversion en millimes
                description: f.description,
                misEnAvant: f.misEnAvant,
                actif: f.actif,
              };
              if (pack) {
                maj.run({ id: pack.id, ...data });
              } else {
                creer.run(data);
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

function DeletePackDialog({ pack }: { pack: PackWithActif }) {
  const [ouvert, setOuvert] = useState(false);
  const suppr = useAction(supprimerPackCredits, { onSuccess: () => setOuvert(false) });

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-danger" aria-label={`Supprimer ${pack.nom}`}>
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le pack {pack.nom} ?</DialogTitle>
          <DialogDescription>
            Ce pack ne sera plus disponible à l&apos;achat. Les crédits déjà acquis par les vendeurs ne seront pas affectés.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOuvert(false)} disabled={suppr.pending}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            disabled={suppr.pending}
            onClick={() => suppr.run({ id: pack.id })}
          >
            {suppr.pending ? "Suppression…" : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreditsPackAdmin({ packs }: { packs: PackWithActif[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PackSheet trigger={<Button variant="brand"><Plus aria-hidden /> Nouveau pack</Button>} />
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-4">Pack</TableHead>
              <TableHead>Crédits</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="hidden sm:table-cell">Mise en avant</TableHead>
              <TableHead className="hidden sm:table-cell">Statut</TableHead>
              <TableHead className="pe-4 text-end"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packs.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="ps-4 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-accent-foreground">
                      <Coins className="size-4" />
                    </span>
                    {p.nom}
                  </div>
                </TableCell>
                <TableCell className="font-semibold tabular-nums">{p.nombreCredits} crédits</TableCell>
                <TableCell className="tabular-nums font-semibold">{(p.prix / 1000).toFixed(3)} DT</TableCell>
                <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">{p.description}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {p.misEnAvant ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                      <Sparkles className="size-3" /> Mis en avant
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Standard</span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${p.actif !== false ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {p.actif !== false ? "Actif" : "Désactivé"}
                  </span>
                </TableCell>
                <TableCell className="pe-4 text-end">
                  <div className="flex items-center justify-end gap-1">
                    <PackSheet pack={p} trigger={<Button variant="ghost" size="icon-sm" aria-label={`Modifier ${p.nom}`}><Pencil className="size-4" /></Button>} />
                    <DeletePackDialog pack={p} />
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
