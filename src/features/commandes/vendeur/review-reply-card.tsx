"use client";
import { useState } from "react";
import { MessageSquareReply, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatDate } from "@/lib/format";
import { useAction } from "@/hooks/use-action";
import type { Avis } from "@/types/domain";
import { repondreAvis } from "@/server/modules/commandes/actions";

/** Avis reçu + zone de réponse (Server Action repondreAvis). */
export function ReviewReplyCard({ avis: a }: { avis: Avis }) {
  const [reponse, setReponse] = useState(a.reponseFournisseur ?? "");
  const [publiee, setPubliee] = useState(!!a.reponseFournisseur);
  const [edition, setEdition] = useState(false);
  const { run, pending } = useAction(repondreAvis, { onSuccess: () => (setPubliee(true), setEdition(false)) });
  return (
    <li className="space-y-3 rounded-2xl border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            {a.auteur} <span className="font-normal text-muted-foreground">· {formatDate(a.creeLe)}</span>
          </p>
          <p className="text-[13px] text-muted-foreground">{a.produitNom}</p>
        </div>
        <RatingStars note={a.note} showValue={false} />
      </div>
      <p className="text-[15px] leading-relaxed">{a.commentaire}</p>
      {publiee && !edition ? (
        <div className="rounded-xl bg-sand p-3 text-sm">
          <p className="mb-1 inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent-foreground">
            <Store className="size-3.5" aria-hidden /> Votre réponse
          </p>
          <p className="text-muted-foreground">{reponse}</p>
          <button type="button" onClick={() => setEdition(true)} className="mt-2 text-[13px] font-semibold text-date hover:underline">
            Modifier
          </button>
        </div>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            void run({ avisId: a.id, reponse });
          }}
        >
          <label htmlFor={`rep-${a.id}`} className="sr-only">
            Votre réponse
          </label>
          <Textarea id={`rep-${a.id}`} value={reponse} onChange={(e) => setReponse(e.target.value)} placeholder={`Remerciez ${a.auteur.split(" ")[0]} ou apportez une précision…`} className="min-h-20" />
          <Button type="submit" size="sm" variant="brand" disabled={pending || reponse.trim().length < 5}>
            <MessageSquareReply aria-hidden /> Publier la réponse
          </Button>
        </form>
      )}
    </li>
  );
}
