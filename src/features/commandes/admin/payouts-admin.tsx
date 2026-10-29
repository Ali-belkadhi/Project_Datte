"use client";
import { useRouter } from "next/navigation";
import { Calculator, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPrix } from "@/lib/format";
import type { StatusDef } from "@/lib/constants";
import { useAction } from "@/hooks/use-action";
import { calculerVersements, marquerVersement } from "@/server/modules/commandes/actions";

export type VersementAdmin = {
  id: string;
  fournisseurId: string;
  periodeDebut: string;
  periodeFin: string;
  montantBrut: number;
  commission: number;
  montantNet: number;
  statut: "PLANIFIE" | "EFFECTUE" | "ECHOUE";
};

const STATUT: Record<VersementAdmin["statut"], StatusDef> = {
  PLANIFIE: { label: "Planifié", tone: "amber" },
  EFFECTUE: { label: "Effectué", tone: "palm" },
  ECHOUE: { label: "Échoué", tone: "clay" },
};

/** Versements aux vendeurs (admin) : calcul (même logique que le cron), puis virement effectué ou échoué. */
export function PayoutsAdmin({ versements }: { versements: VersementAdmin[] }) {
  const router = useRouter();
  const calcul = useAction(calculerVersements, { onSuccess: () => router.refresh() });
  const marquer = useAction(marquerVersement, { onSuccess: () => router.refresh() });
  return (
    <div className="space-y-4">
      <Button variant="brand" disabled={calcul.pending} onClick={() => calcul.run(undefined as never)}>
        <Calculator aria-hidden /> Calculer les versements (colis livrés depuis 7 jours)
      </Button>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Versement</TableHead>
              <TableHead>Vendeur</TableHead>
              <TableHead>Période</TableHead>
              <TableHead className="text-end">Brut</TableHead>
              <TableHead className="text-end">Commission</TableHead>
              <TableHead className="text-end">Net</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-end">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versements.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono text-[13px]">{v.id}</TableCell>
                <TableCell className="text-[13px]">{v.fournisseurId}</TableCell>
                <TableCell className="whitespace-nowrap text-[13px]">
                  {formatDate(v.periodeDebut)} → {formatDate(v.periodeFin)}
                </TableCell>
                <TableCell className="text-end tabular-nums">{formatPrix(v.montantBrut)}</TableCell>
                <TableCell className="text-end tabular-nums">−{formatPrix(v.commission)}</TableCell>
                <TableCell className="text-end font-semibold tabular-nums">{formatPrix(v.montantNet)}</TableCell>
                <TableCell>
                  <StatusBadge status={STATUT[v.statut]} />
                </TableCell>
                <TableCell className="text-end">
                  {v.statut === "PLANIFIE" && (
                    <span className="inline-flex gap-1">
                      <Button size="sm" variant="outline" disabled={marquer.pending} onClick={() => marquer.run({ id: v.id, statut: "EFFECTUE" })}>
                        <Check aria-hidden /> Effectué
                      </Button>
                      <Button size="sm" variant="ghost" disabled={marquer.pending} onClick={() => marquer.run({ id: v.id, statut: "ECHOUE" })} aria-label="Marquer échoué">
                        <X aria-hidden />
                      </Button>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
