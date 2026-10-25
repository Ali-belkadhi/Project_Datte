import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { METHODE_PAIEMENT, STATUT_COMMANDE } from "@/lib/constants";
import { formatDate, formatPrix } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Commande } from "@/types/domain";
import type { StatutCommande } from "@/types/enums";

const FILTRES: (StatutCommande | "TOUTES")[] = ["TOUTES", "EN_ATTENTE_PAIEMENT", "PAYEE", "PARTIELLEMENT_LIVREE", "LIVREE", "ANNULEE"];

/** Vue globale des commandes (admin) : filtres par statut, totaux, colis par vendeur, facture PDF. */
export function OrdersOverview({
  commandes,
  statut,
  stats,
}: {
  commandes: Commande[];
  statut?: StatutCommande;
  stats: { _id: StatutCommande; n: number; total: number }[];
}) {
  const encaisse = stats.filter((s) => ["PAYEE", "PARTIELLEMENT_LIVREE", "LIVREE"].includes(s._id)).reduce((a, s) => a + s.total, 0);
  const tuiles = [
    { label: "Commandes", valeur: String(stats.reduce((a, s) => a + s.n, 0)) },
    { label: "Volume payé", valeur: formatPrix(encaisse) },
    { label: "En attente de paiement", valeur: String(stats.find((s) => s._id === "EN_ATTENTE_PAIEMENT")?.n ?? 0) },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {tuiles.map((t) => (
          <div key={t.label} className="rounded-2xl border bg-card p-4">
            <p className="text-[13px] text-muted-foreground">{t.label}</p>
            <p className="font-display text-2xl font-semibold tabular-nums">{t.valeur}</p>
          </div>
        ))}
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par statut">
        {FILTRES.map((f) => {
          const actif = (f === "TOUTES" && !statut) || f === statut;
          return (
            <Link
              key={f}
              href={f === "TOUTES" ? "/admin/commandes" : `/admin/commandes?statut=${f}`}
              className={cn("rounded-full border px-3 py-1.5 text-[13px] font-medium", actif ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}
              aria-current={actif ? "page" : undefined}
            >
              {f === "TOUTES" ? "Toutes" : STATUT_COMMANDE[f].label}
            </Link>
          );
        })}
      </nav>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Destinataire</TableHead>
              <TableHead>Vendeurs</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-end">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commandes.map((c) => (
              <TableRow key={c.numero}>
                <TableCell className="font-mono text-[13px] font-semibold">
                  <a href={`/api/factures/${c.numero}`} target="_blank" rel="noopener" className="hover:underline" title="Facture PDF">
                    {c.numero}
                  </a>
                </TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(c.creeLe)}</TableCell>
                <TableCell>{c.adresse.destinataire}</TableCell>
                <TableCell className="text-[13px]">{c.sousCommandes.map((s) => s.fournisseurNom).join(", ")}</TableCell>
                <TableCell className="text-[13px]">{METHODE_PAIEMENT[c.methodePaiement]}</TableCell>
                <TableCell>
                  <StatusBadge status={STATUT_COMMANDE[c.statut]} />
                </TableCell>
                <TableCell className="text-end font-semibold tabular-nums">{formatPrix(c.total)}</TableCell>
              </TableRow>
            ))}
            {!commandes.length && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Aucune commande pour ce filtre.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
