"use client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { useAction } from "@/hooks/use-action";
import { modererAvis } from "@/server/modules/commandes/actions";

export type AvisAdmin = { id: string; produitNom: string; auteur: string; note: number; commentaire: string; creeLe: string; statut: "VISIBLE" | "MASQUE" };

/** Modération des avis (admin) : Avis.masquer() / réafficher. Un avis masqué sort de la note moyenne du produit. */
export function ReviewsModeration({ avis }: { avis: AvisAdmin[] }) {
  const router = useRouter();
  const { run, pending } = useAction(modererAvis, { onSuccess: () => router.refresh() });
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Auteur</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Commentaire</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-end">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {avis.map((a) => (
            <TableRow key={a.id} className={a.statut === "MASQUE" ? "opacity-60" : undefined}>
              <TableCell className="font-medium">{a.produitNom}</TableCell>
              <TableCell>{a.auteur}</TableCell>
              <TableCell className="whitespace-nowrap">
                <Star className="me-1 inline size-4 fill-brand-fill text-brand-fill" aria-hidden />
                {a.note}/5
              </TableCell>
              <TableCell className="max-w-md text-[13px]">{a.commentaire}</TableCell>
              <TableCell className="whitespace-nowrap text-[13px]">{formatDate(a.creeLe)}</TableCell>
              <TableCell className="text-end">
                {a.statut === "VISIBLE" ? (
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => run({ avisId: a.id, statut: "MASQUE" })}>
                    <EyeOff aria-hidden /> Masquer
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => run({ avisId: a.id, statut: "VISIBLE" })}>
                    <Eye aria-hidden /> Réafficher
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
