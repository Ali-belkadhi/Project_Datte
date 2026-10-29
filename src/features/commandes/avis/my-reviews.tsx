"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";
import { modifierAvis, supprimerAvis } from "@/server/modules/commandes/actions";

export type AvisClient = {
  id: string;
  produitNom: string;
  note: number;
  commentaire: string;
  creeLe: string;
  modifieLe?: string;
  reponseFournisseur?: string;
  statut: "VISIBLE" | "MASQUE";
};

function Etoiles({ note, onChange }: { note: number; onChange?: (n: number) => void }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} étoile${n > 1 ? "s" : ""}`} className="disabled:cursor-default">
          <Star className={cn("size-4", n <= note ? "fill-brand-fill text-brand-fill" : "text-muted-foreground")} aria-hidden />
        </button>
      ))}
    </span>
  );
}

/** « Mes avis » : lecture, modification et suppression de ses propres avis (CRUD client). */
export function MyReviews({ avis }: { avis: AvisClient[] }) {
  const router = useRouter();
  const [edition, setEdition] = useState<AvisClient | null>(null);
  const [note, setNote] = useState(5);
  const [texte, setTexte] = useState("");
  const modifier = useAction(modifierAvis, { onSuccess: () => (setEdition(null), router.refresh()) });
  const supprimer = useAction(supprimerAvis, { onSuccess: () => router.refresh() });

  if (!avis.length) {
    return (
      <p className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
        Vous n&apos;avez pas encore donné d&apos;avis. Vous pourrez noter vos achats une fois livrés depuis <Link href="/compte/commandes" className="font-medium text-brand hover:underline">Mes commandes</Link>.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {avis.map((a) => (
          <li key={a.id} className="space-y-2 rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{a.produitNom}</p>
              <Etoiles note={a.note} />
            </div>
            <p className="text-sm">{a.commentaire}</p>
            <p className="text-[12px] text-muted-foreground">
              {formatDate(a.creeLe)}
              {a.modifieLe && ` · modifié le ${formatDate(a.modifieLe)}`}
              {a.statut === "MASQUE" && " · masqué par la modération"}
            </p>
            {a.reponseFournisseur && <p className="rounded-xl bg-sand px-3 py-2 text-[13px]"><strong>Réponse du vendeur :</strong> {a.reponseFournisseur}</p>}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEdition(a);
                  setNote(a.note);
                  setTexte(a.commentaire);
                }}
              >
                <Pencil aria-hidden /> Modifier
              </Button>
              <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-soft hover:text-danger" disabled={supprimer.pending} onClick={() => confirm("Supprimer cet avis ?") && supprimer.run({ avisId: a.id })}>
                <Trash2 aria-hidden /> Supprimer
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Dialog open={!!edition} onOpenChange={(o) => !o && setEdition(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier mon avis</DialogTitle>
            <DialogDescription>{edition?.produitNom}</DialogDescription>
          </DialogHeader>
          <Etoiles note={note} onChange={setNote} />
          <Textarea value={texte} onChange={(e) => setTexte(e.target.value)} rows={4} aria-label="Commentaire" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdition(null)}>
              Annuler
            </Button>
            <Button variant="brand" disabled={modifier.pending} onClick={() => edition && modifier.run({ avisId: edition.id, note, commentaire: texte })}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
