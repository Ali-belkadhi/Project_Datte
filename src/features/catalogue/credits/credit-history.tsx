import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TYPE_MOUVEMENT_CREDIT } from "@/lib/constants";
import { formatDateHeure } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MouvementCredit3D } from "@/types/domain";

/** Historique : achat, consommation, restitution, bonus — montants + ou −. */
export function CreditHistory({ mouvements }: { mouvements: MouvementCredit3D[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="ps-4">Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Détail</TableHead>
            <TableHead className="text-end">Crédits</TableHead>
            <TableHead className="pe-4 text-end">Solde</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mouvements.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="ps-4 text-[13px]">{formatDateHeure(m.creeLe)}</TableCell>
              <TableCell>
                <StatusBadge status={TYPE_MOUVEMENT_CREDIT[m.type]} />
              </TableCell>
              <TableCell className="hidden max-w-72 truncate text-[13px] text-muted-foreground md:table-cell">{m.motif}</TableCell>
              <TableCell className={cn("text-end font-semibold tabular-nums", m.quantite > 0 ? "text-success" : "text-danger")}>
                {m.quantite > 0 ? "+" : "−"}
                {Math.abs(m.quantite)}
              </TableCell>
              <TableCell className="pe-4 text-end tabular-nums">{m.soldeApres}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
