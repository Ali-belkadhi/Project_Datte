"use client";
/**
 * IA-C — rendu d'un message de l'assistant : texte + résultats d'outils en COMPOSANTS
 * (cartes produit, fiches variété, timeline de suivi, confirmation d'ajout), jamais en JSON brut.
 */
import Link from "next/link";
import { Check, Loader2, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProduitVisuel } from "@/components/illustrations/product-illustration";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { ProductCard } from "@/components/shared/product-card";
import { Timeline } from "@/components/shared/timeline";
import { formatPoids, formatPrix, totalLigne } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VarieteSlug } from "@/types/model-source";
import { produitPropose, type MessageAssistant, type PartAjout } from "./use-assistant";

type Props = {
  message: MessageAssistant;
  messages: MessageAssistant[];
  onAjout: (part: PartAjout, confirme: boolean) => void;
  compact?: boolean;
};

export function AssistantMessage({ message, messages, onAjout, compact = false }: Props) {
  const user = message.role === "user";
  return (
    <div className={cn("flex flex-col gap-2", user ? "items-end" : "items-start")}>
      {message.parts.map((part, i) => {
        const cle = `${message.id}-${i}`;
        switch (part.type) {
          case "text":
            return part.text.trim() ? (
              <p
                key={cle}
                className={cn(
                  "max-w-[88%] rounded-2xl px-4 py-2.5 leading-relaxed whitespace-pre-wrap",
                  compact ? "text-sm" : "text-[15px]",
                  user ? "rounded-ee-md bg-primary text-primary-foreground" : "rounded-es-md border bg-card",
                )}
              >
                {part.text}
              </p>
            ) : null;

          case "tool-rechercherProduits":
            if (part.state !== "output-available") return <EnCours key={cle} texte="Je cherche dans le catalogue…" />;
            return part.output.length ? (
              <ul key={cle} className="scrollbar-none -mx-1 flex w-full snap-x gap-3 overflow-x-auto px-1 pb-1">
                {part.output.map((item) => (
                  <li key={item.produit.id} className={cn("flex shrink-0 snap-start", compact ? "w-44" : "w-52")}>
                    <ProductCard item={item} compact className="w-full" />
                  </li>
                ))}
              </ul>
            ) : null;

          case "tool-infosVariete":
            if (part.state !== "output-available") return <EnCours key={cle} texte="Je consulte la fiche variété…" />;
            if ("erreur" in part.output) return null;
            return (
              <Link key={cle} href={`/variete/${part.output.slug}`} className="flex w-full gap-3 rounded-2xl border bg-card p-3 text-[13px] hover:bg-accent">
                <VarietyGlyph variete={part.output.slug as VarieteSlug} className="size-9 shrink-0" />
                <span className="min-w-0">
                  <span className="block font-display text-base font-semibold">{part.output.nom}</span>
                  <span className="block text-muted-foreground">{part.output.origine}</span>
                  <span className="line-clamp-3 block">{part.output.description}</span>
                </span>
              </Link>
            );

          case "tool-suivreCommande":
            if (part.state !== "output-available") return <EnCours key={cle} texte="Je regarde votre commande…" />;
            if ("erreur" in part.output) return null;
            return (
              <div key={cle} className="w-full space-y-3 rounded-2xl border bg-card p-4">
                <p className="font-mono text-[13px] font-semibold">{part.output.numero}</p>
                {part.output.colis.map((s) => (
                  <div key={s.numero} className="space-y-2">
                    <p className="text-[13px] text-muted-foreground">
                      {s.vendeur} · <span className="font-mono">{s.numero}</span>
                    </p>
                    <Timeline etapes={s.etapes} orientation="vertical" compact />
                  </div>
                ))}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/compte/commandes/${part.output.numero}`}>Voir le détail</Link>
                </Button>
              </div>
            );

          case "tool-ajouterAuPanier":
            return <ConfirmationAjout key={cle} part={part} messages={messages} onAjout={onAjout} />;

          default:
            return null;
        }
      })}
    </div>
  );
}

function EnCours({ texte }: { texte: string }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-2xl bg-sand px-3 py-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden /> {texte}
    </p>
  );
}

/** Carte de CONFIRMATION : l'assistant propose, le client décide. */
function ConfirmationAjout({ part, messages, onAjout }: { part: PartAjout; messages: MessageAssistant[]; onAjout: Props["onAjout"] }) {
  if (part.state === "input-streaming" || !part.input) return <EnCours texte="Je prépare la proposition…" />;
  const { produitId, nomProduit, quantiteGrammes, quantiteUnites } = part.input;
  const item = produitPropose(messages, produitId);
  const p = item?.produit;
  const prix = p ? (p.typeProduit === "DATTE" ? p.prixParKg : p.prixUnitaire) : null;
  const qte = quantiteGrammes ? formatPoids(quantiteGrammes) : `${quantiteUnites ?? 1} × `;
  const total = prix !== null ? totalLigne(prix, quantiteGrammes, quantiteGrammes ? undefined : (quantiteUnites ?? 1)) : null;

  return (
    <div className="w-full space-y-3 rounded-2xl border-2 border-brand-fill/40 bg-card p-4">
      <div className="flex items-center gap-3">
        {p && (
          <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-sand">
            <ProduitVisuel produit={p} />
          </span>
        )}
        <p className="text-[15px] font-semibold">
          Ajouter {qte} {quantiteGrammes ? "de " : ""}
          {nomProduit}
          {total !== null && ` — ${formatPrix(total)}`} ?
        </p>
      </div>
      {part.state === "output-available" ? (
        <p className={part.output.confirme ? "inline-flex items-center gap-1.5 text-sm font-semibold text-success" : "text-sm text-muted-foreground"}>
          {part.output.confirme && <Check className="size-4" aria-hidden />}
          {part.output.confirme ? "Ajouté au panier" : part.output.message}
        </p>
      ) : part.state === "output-error" ? (
        <p className="text-sm text-destructive">{part.errorText}</p>
      ) : (
        <div className="flex gap-2">
          <Button variant="brand" size="sm" onClick={() => onAjout(part, true)}>
            <ShoppingBag aria-hidden /> Confirmer
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAjout(part, false)}>
            <X aria-hidden /> Refuser
          </Button>
        </div>
      )}
    </div>
  );
}
