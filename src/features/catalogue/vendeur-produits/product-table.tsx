"use client";
import { useState } from "react";
import Link from "next/link";
import { Archive, Box, Eye, MoreHorizontal, Pencil, Search, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import { StatusBadge } from "@/components/shared/status-badge";
import { NoResults } from "@/components/illustrations/empty-illustrations";
import { ProduitVisuel } from "@/components/illustrations/product-illustration";
import { VARIETY_PRESETS } from "@/components/three/presets";
import { STATUT_PRODUIT, TYPE_DERIVE } from "@/lib/constants";
import { formatPoids, formatPrix } from "@/lib/format";
import { useAction } from "@/hooks/use-action";
import type { Produit } from "@/types/domain";
import { archiverProduit, publierProduit } from "@/server/modules/catalogue/actions";

const ONGLETS = [
  { value: "tous", label: "Tous" },
  { value: "PUBLIE", label: "Publiés" },
  { value: "BROUILLON", label: "Brouillons" },
  { value: "RUPTURE", label: "Rupture" },
];

const prix = (p: Produit) => (p.typeProduit === "DATTE" ? `${formatPrix(p.prixParKg)} /kg` : formatPrix(p.prixUnitaire));
const stock = (p: Produit) => (p.typeProduit === "DATTE" ? formatPoids(p.stockGrammes) : `${p.stockUnites} unités`);
const sousTitre = (p: Produit) => (p.typeProduit === "DATTE" ? VARIETY_PRESETS[p.variete].nom : TYPE_DERIVE[p.typeDerive]);

function Badge3D({ p }: { p: Produit }) {
  return p.modele3D ? (
    <Badge variant="success" className="gap-1">
      <Box aria-hidden /> Prête
    </Badge>
  ) : (
    <Badge variant="outline">À créer</Badge>
  );
}

function Actions({ p }: { p: Produit }) {
  const publier = useAction(publierProduit);
  const archiver = useAction(archiverProduit);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${p.nom}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href={`/vendeur/produits/${p.id}`}>
            <Pencil /> Modifier
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/produit/${p.slug}`}>
            <Eye /> Voir la fiche
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/vendeur/studio-3d">
            <Box /> {p.modele3D ? "Gérer la 3D" : "Créer la 3D"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {p.statut !== "PUBLIE" && (
          <DropdownMenuItem onSelect={() => publier.run({ produitId: p.id })}>
            <Send /> Publier
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onSelect={() => archiver.run({ produitId: p.id })}>
          <Archive /> Archiver
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Produits du vendeur : onglets, recherche, tableau (desktop) / cartes (mobile). */
export function ProductTable({ produits }: { produits: Produit[] }) {
  const [onglet, setOnglet] = useState("tous");
  const [q, setQ] = useState("");
  const visibles = produits.filter((p) => (onglet === "tous" || p.statut === onglet) && p.nom.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterChips value={onglet} onChange={setOnglet} ariaLabel="Statut" chips={ONGLETS.map((o) => ({ ...o, count: o.value === "tous" ? produits.length : produits.filter((p) => p.statut === o.value).length }))} />
        <label className="relative md:w-72">
          <span className="sr-only">Rechercher un produit</span>
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit…" className="h-11 w-full rounded-xl border bg-card ps-9 pe-3 text-[15px] outline-none focus:border-ring" />
        </label>
      </div>
      {visibles.length === 0 ? (
        <EmptyState illustration={<NoResults />} titre="Aucun produit" texte="Aucun produit ne correspond à ce filtre." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border bg-card lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-4">Produit</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-end">Ventes</TableHead>
                  <TableHead>3D</TableHead>
                  <TableHead className="pe-4">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="ps-4">
                      <Link href={`/vendeur/produits/${p.id}`} className="flex items-center gap-3">
                        <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                          <ProduitVisuel produit={p} />
                        </span>
                        <span>
                          <span className="block font-semibold hover:underline">{p.nom}</span>
                          <span className="block text-[12px] text-muted-foreground">{sousTitre(p)}</span>
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="tabular-nums">{prix(p)}</TableCell>
                    <TableCell className="tabular-nums">{stock(p)}</TableCell>
                    <TableCell>
                      <StatusBadge status={STATUT_PRODUIT[p.statut]} />
                    </TableCell>
                    <TableCell className="text-end tabular-nums">{p.nombreVentes}</TableCell>
                    <TableCell>
                      <Badge3D p={p} />
                    </TableCell>
                    <TableCell className="pe-4 text-end">
                      <Actions p={p} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {visibles.map((p) => (
              <li key={p.id} className="flex gap-3 rounded-2xl border bg-card p-3">
                <Link href={`/vendeur/produits/${p.id}`} className="size-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                  <ProduitVisuel produit={p} />
                </Link>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <Link href={`/vendeur/produits/${p.id}`} className="line-clamp-2 font-semibold">
                      {p.nom}
                    </Link>
                    <Actions p={p} />
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    {prix(p)} · {stock(p)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={STATUT_PRODUIT[p.statut]} />
                    <Badge3D p={p} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
