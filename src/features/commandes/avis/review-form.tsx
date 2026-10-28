"use client";
import { useState } from "react";
import { Camera, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";
import { laisserAvis } from "@/server/modules/commandes/actions";

/** Dialog « Laisser un avis » : étoiles, texte, photos (visuel). Server Action laisserAvis. */
export function ReviewForm({ ligneCommandeId, produitNom, trigger }: { ligneCommandeId: string; produitNom: string; trigger?: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const [note, setNote] = useState(0);
  const [survol, setSurvol] = useState(0);
  const [texte, setTexte] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string[]>>({});
  const { run, pending } = useAction(laisserAvis, { onSuccess: () => setOuvert(false) });

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>{trigger ?? <Button variant="outline" size="sm">Laisser un avis</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Votre avis sur {produitNom}</DialogTitle>
          <DialogDescription>Votre retour aide les autres gourmands et le vendeur.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await run({ ligneCommandeId, note, commentaire: texte });
            if (!res.ok && res.error.code === "VALIDATION") setErreurs((res.error.details as { fieldErrors: Record<string, string[]> }).fieldErrors ?? {});
          }}
        >
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Note</legend>
            <div className="flex gap-1" onMouseLeave={() => setSurvol(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                  aria-pressed={note === n}
                  onMouseEnter={() => setSurvol(n)}
                  onClick={() => setNote(n)}
                  className="grid size-11 place-items-center rounded-full hover:bg-accent"
                >
                  <Star className={cn("size-7", (survol || note) >= n ? "fill-brand-fill text-brand-fill" : "text-border")} />
                </button>
              ))}
            </div>
            {erreurs.note && <p className="mt-1 text-[13px] text-danger">{erreurs.note[0]}</p>}
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor="avis-texte">Votre commentaire</Label>
            <Textarea id="avis-texte" value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Goût, fraîcheur, emballage, livraison…" aria-invalid={!!erreurs.commentaire} />
            {erreurs.commentaire && <p className="text-[13px] text-danger">{erreurs.commentaire[0]}</p>}
          </div>
          <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-semibold text-muted-foreground hover:bg-accent">
            <Camera className="size-4" aria-hidden /> Ajouter jusqu&apos;à 3 photos
          </button>
          <DialogFooter>
            <Button type="submit" variant="brand" disabled={pending}>
              {pending ? "Envoi…" : "Publier mon avis"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
