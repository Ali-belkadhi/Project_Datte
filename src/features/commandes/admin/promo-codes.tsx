"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPrix } from "@/lib/format";
import { useAction } from "@/hooks/use-action";
import { basculerCodePromo, creerCodePromo, modifierCodePromo, supprimerCodePromo } from "@/server/modules/commandes/actions";

export type CodePromoVue = {
  code: string;
  type: "POURCENTAGE" | "MONTANT_FIXE";
  valeur: number;
  fournisseurId?: string | null;
  montantMinimum: number;
  debut: string;
  fin: string;
  utilisationsMax?: number | null;
  utilisations: number;
  actif: boolean;
};

const jour = (decalage = 0) => new Date(Date.now() + decalage * 864e5).toISOString().slice(0, 10);

/** Codes promo (admin) : liste, activation, création (pourcentage ou montant fixe, global ou par vendeur). */
export function PromoCodes({ codes }: { codes: CodePromoVue[] }) {
  const router = useRouter();
  const [f, setF] = useState({ code: "", type: "POURCENTAGE" as CodePromoVue["type"], valeur: "10", fournisseurId: "", minimum: "0", debut: jour(), fin: jour(30), max: "" });
  const creer = useAction(creerCodePromo, {
    onSuccess: () => {
      setF((x) => ({ ...x, code: "" }));
      router.refresh();
    },
  });
  const basculer = useAction(basculerCodePromo, { onSuccess: () => router.refresh() });
  const [edition, setEdition] = useState<string | null>(null);
  const vider = () => {
    setEdition(null);
    setF((x) => ({ ...x, code: "", valeur: "10", minimum: "0", max: "", fournisseurId: "" }));
  };
  const modifier = useAction(modifierCodePromo, { onSuccess: () => (vider(), router.refresh()) });
  const supprimer = useAction(supprimerCodePromo, { onSuccess: () => router.refresh() });
  const editer = (c: CodePromoVue) => {
    setEdition(c.code);
    setF({ code: c.code, type: c.type, valeur: String(c.type === "POURCENTAGE" ? c.valeur : c.valeur / 1000), fournisseurId: c.fournisseurId ?? "", minimum: String(c.montantMinimum / 1000), debut: c.debut.slice(0, 10), fin: c.fin.slice(0, 10), max: c.utilisationsMax ? String(c.utilisationsMax) : "" });
  };
  const maj = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Remise</TableHead>
              <TableHead>Portée</TableHead>
              <TableHead>Validité</TableHead>
              <TableHead>Utilisations</TableHead>
              <TableHead className="text-end">Actions / actif</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((c) => (
              <TableRow key={c.code}>
                <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                <TableCell>
                  {c.type === "POURCENTAGE" ? `${c.valeur} %` : formatPrix(c.valeur)}
                  {c.montantMinimum > 0 && <span className="block text-[12px] text-muted-foreground">dès {formatPrix(c.montantMinimum)}</span>}
                </TableCell>
                <TableCell className="text-[13px]">{c.fournisseurId ? `Vendeur ${c.fournisseurId}` : "Toute la plateforme"}</TableCell>
                <TableCell className="whitespace-nowrap text-[13px]">
                  {formatDate(c.debut)} → {formatDate(c.fin)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {c.utilisations}
                  {c.utilisationsMax ? ` / ${c.utilisationsMax}` : ""}
                </TableCell>
                <TableCell className="text-end whitespace-nowrap">
                  <Button size="icon" variant="ghost" aria-label={`Modifier ${c.code}`} onClick={() => editer(c)}>
                    <Pencil aria-hidden />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-danger" aria-label={`Supprimer ${c.code}`} disabled={supprimer.pending} onClick={() => confirm(`Supprimer le code ${c.code} ?`) && supprimer.run({ code: c.code })}>
                    <Trash2 aria-hidden />
                  </Button>
                  <Switch checked={c.actif} disabled={basculer.pending} onCheckedChange={(actif) => basculer.run({ code: c.code, actif })} aria-label={`Activer ${c.code}`} />
                </TableCell>
              </TableRow>
            ))}
            {!codes.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Aucun code promo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <form
        className="space-y-3 rounded-2xl border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void (edition ? modifier : creer).run({
            code: f.code,
            type: f.type,
            valeur: f.type === "POURCENTAGE" ? Number(f.valeur) : Math.round(Number(f.valeur) * 1000),
            fournisseurId: f.fournisseurId || undefined,
            montantMinimum: Math.round(Number(f.minimum || 0) * 1000),
            debut: f.debut,
            fin: f.fin,
            utilisationsMax: f.max ? Number(f.max) : undefined,
          });
        }}
      >
        <h2 className="font-semibold">{edition ? `Modifier ${edition}` : "Nouveau code"}</h2>
        <div className="space-y-1.5">
          <Label htmlFor="pc-code">Code</Label>
          <Input id="pc-code" value={f.code} onChange={(e) => setF((x) => ({ ...x, code: e.target.value.toUpperCase() }))} placeholder="RAMADAN26" required disabled={!!edition} className="font-mono uppercase" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pc-type">Type</Label>
            <select id="pc-type" value={f.type} onChange={maj("type")} className="h-11 w-full rounded-xl border bg-background px-3 text-sm">
              <option value="POURCENTAGE">Pourcentage</option>
              <option value="MONTANT_FIXE">Montant fixe (DT)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pc-valeur">{f.type === "POURCENTAGE" ? "Valeur (%)" : "Valeur (DT)"}</Label>
            <Input id="pc-valeur" type="number" min="0" step="any" value={f.valeur} onChange={maj("valeur")} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pc-min">Minimum (DT)</Label>
            <Input id="pc-min" type="number" min="0" step="any" value={f.minimum} onChange={maj("minimum")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pc-max">Utilisations max</Label>
            <Input id="pc-max" type="number" min="1" value={f.max} onChange={maj("max")} placeholder="Illimité" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pc-debut">Début</Label>
            <Input id="pc-debut" type="date" value={f.debut} onChange={maj("debut")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pc-fin">Fin</Label>
            <Input id="pc-fin" type="date" value={f.fin} onChange={maj("fin")} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pc-four">Réservé à un vendeur (identifiant, facultatif)</Label>
          <Input id="pc-four" value={f.fournisseurId} onChange={maj("fournisseurId")} placeholder="f-ben-amor" />
        </div>
        <Button type="submit" variant="brand" className="w-full" disabled={creer.pending || modifier.pending}>
          {edition ? <Pencil aria-hidden /> : <Plus aria-hidden />} {edition ? "Enregistrer les modifications" : "Créer le code"}
        </Button>
        {edition && (
          <Button type="button" variant="outline" className="w-full" onClick={vider}>
            Annuler la modification
          </Button>
        )}
      </form>
    </div>
  );
}
