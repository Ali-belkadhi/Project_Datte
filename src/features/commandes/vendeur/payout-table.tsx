import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { STATUT_VERSEMENT } from "@/lib/constants";
import { formatDateCourte, formatPrix } from "@/lib/format";
import type { Versement } from "@/types/domain";

/** Tableau des versements : période, brut, commission, net, statut (cartes sur mobile). */
export function PayoutTable({ versements }: { versements: Versement[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-4">Période</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead className="text-end">Brut</TableHead>
              <TableHead className="text-end">Commission</TableHead>
              <TableHead className="text-end">Net</TableHead>
              <TableHead className="pe-4">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versements.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="ps-4">
                  {formatDateCourte(v.periodeDebut)} → {formatDateCourte(v.periodeFin)}
                  <p className="text-[12px] text-muted-foreground">Versé le {formatDateCourte(v.dateVersement)}</p>
                </TableCell>
                <TableCell className="font-mono text-[13px]">{v.reference}</TableCell>
                <TableCell className="text-end tabular-nums">{formatPrix(v.montantBrut)}</TableCell>
                <TableCell className="text-end text-muted-foreground tabular-nums">−{formatPrix(v.commission)}</TableCell>
                <TableCell className="text-end font-semibold tabular-nums">{formatPrix(v.montantNet)}</TableCell>
                <TableCell className="pe-4">
                  <StatusBadge status={STATUT_VERSEMENT[v.statut]} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="space-y-3 md:hidden">
        {versements.map((v) => (
          <li key={v.id} className="space-y-2 rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] font-semibold">{v.reference}</span>
              <StatusBadge status={STATUT_VERSEMENT[v.statut]} />
            </div>
            <p className="text-[13px] text-muted-foreground">
              {formatDateCourte(v.periodeDebut)} → {formatDateCourte(v.periodeFin)}
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-muted-foreground">Brut {formatPrix(v.montantBrut)} · commission −{formatPrix(v.commission)}</span>
            </p>
            <p className="font-display text-xl font-semibold tabular-nums">{formatPrix(v.montantNet)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
