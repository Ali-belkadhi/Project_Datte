"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilterChips } from "@/components/shared/filter-chips";
import { ShopAvatar } from "@/components/shared/shop-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { GOUVERNORAT_LABEL, STATUT_VERIFICATION, TYPE_FOURNISSEUR } from "@/lib/constants";
import { formatNombre } from "@/lib/format";
import type { Fournisseur } from "@/types/domain";

/** Fournisseurs filtrables par statut de vérification (tableau / cartes). */
export function SupplierReviewTable({ fournisseurs }: { fournisseurs: Fournisseur[] }) {
  const [f, setF] = useState("TOUS");
  const v = fournisseurs.filter((x) => f === "TOUS" || x.statutVerification === f);
  return (
    <div className="space-y-4">
      <FilterChips
        value={f}
        onChange={setF}
        ariaLabel="Statut de vérification"
        chips={["TOUS", "EN_ATTENTE", "VERIFIE", "REFUSE"].map((s) => ({
          value: s,
          label: s === "TOUS" ? "Tous" : STATUT_VERIFICATION[s as keyof typeof STATUT_VERIFICATION].label,
          count: s === "TOUS" ? fournisseurs.length : fournisseurs.filter((x) => x.statutVerification === s).length,
        }))}
      />
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-4">Boutique</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Région</TableHead>
              <TableHead className="hidden text-end lg:table-cell">Ventes</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="pe-4"><span className="sr-only">Ouvrir</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {v.map((x) => (
              <TableRow key={x.id}>
                <TableCell className="ps-4">
                  <Link href={`/admin/fournisseurs/${x.id}`} className="flex items-center gap-3">
                    <ShopAvatar nom={x.nomBoutique} couleur={x.couleur} size="sm" />
                    <span>
                      <span className="block font-semibold hover:underline">{x.nomBoutique}</span>
                      <span className="block text-[12px] text-muted-foreground">{x.gerant}</span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">{TYPE_FOURNISSEUR[x.type]}</TableCell>
                <TableCell className="hidden md:table-cell">{GOUVERNORAT_LABEL[x.region]}</TableCell>
                <TableCell className="hidden text-end tabular-nums lg:table-cell">{formatNombre(x.nombreVentes)}</TableCell>
                <TableCell><StatusBadge status={STATUT_VERIFICATION[x.statutVerification]} /></TableCell>
                <TableCell className="pe-4 text-end">
                  <Link href={`/admin/fournisseurs/${x.id}`} aria-label={`Ouvrir le dossier ${x.nomBoutique}`} className="inline-grid size-9 place-items-center rounded-full hover:bg-accent">
                    <ChevronRight className="size-4 rtl:rotate-180" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
