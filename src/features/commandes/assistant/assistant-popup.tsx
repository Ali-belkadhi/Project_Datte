"use client";
/**
 * IA-C — petite fenêtre de chat flottante (toutes les pages acheteur).
 * Questions → POST /api/ia/assistant ; les résultats d'outils s'affichent en composants
 * (cartes produit avec bouton « Ajouter », suivi de commande) et non en texte brut.
 * L'ajout au panier reste une action du client (bouton), jamais de l'assistant.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, Plus, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { Timeline } from "@/components/shared/timeline";
import { formatPrix } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type { EtapeSuivi, ProduitAvecVendeur } from "@/types/domain";

type Reponse = {
  texte: string;
  produits?: ProduitAvecVendeur[];
  suivi?: { numero: string; statut: string; vendeur: string; etapes: EtapeSuivi[] }[];
  varietes?: { slug: string; nom: string; description: string; origine: string }[];
  mode?: "ia" | "local";
};
type Message = { role: "user" | "assistant"; content: string; donnees?: Reponse };

const SUGGESTIONS = ["2 kg de Deglet Nour bio à moins de 30 DT", "Différence entre Alig et Kenta ?", "Où est ma commande ?", "Une confiture de dattes"];
const ACCUEIL: Message = { role: "assistant", content: "Bonjour ! Je suis le conseiller DEGLA. Je peux chercher des dattes, comparer des variétés ou suivre votre commande." };

export function AssistantPopup() {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([ACCUEIL]);
  const [saisie, setSaisie] = useState("");
  const [attente, setAttente] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  const ajouter = useAddToCart();

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, attente]);

  const envoyer = async (texte: string) => {
    const question = texte.trim();
    if (!question || attente) return;
    const historique = [...messages.filter((m) => m !== ACCUEIL), { role: "user" as const, content: question }];
    setMessages((m) => [...m, { role: "user", content: question }]);
    setSaisie("");
    setAttente(true);
    try {
      const r = await fetch("/api/ia/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historique.map(({ role, content }) => ({ role, content })) }),
      });
      const d = (await r.json()) as Reponse & { error?: string };
      const contenu = r.ok ? d.texte : r.status === 429 ? "Trop de questions d'un coup, réessayez dans une minute." : "Je n'arrive pas à répondre pour le moment.";
      setMessages((m) => [...m, { role: "assistant", content: contenu, donnees: r.ok ? d : undefined }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Pas de connexion : l'assistant a besoin d'internet." }]);
    } finally {
      setAttente(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-controls="assistant-degla"
        aria-label={ouvert ? "Fermer l'assistant" : "Ouvrir l'assistant d'achat"}
        className="fixed end-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 grid size-14 place-items-center rounded-full bg-night text-cream shadow-lift transition-transform hover:scale-105 lg:end-6 lg:bottom-6"
      >
        {ouvert ? <X className="size-6" aria-hidden /> : <MessageCircle className="size-6" aria-hidden />}
        {!ouvert && <Sparkles className="absolute -top-0.5 -end-0.5 size-5 rounded-full bg-brand-fill p-0.5 text-night" aria-hidden />}
      </button>

      {ouvert && (
        <section
          id="assistant-degla"
          aria-label="Assistant d'achat DEGLA"
          className="fixed inset-x-3 bottom-[calc(9.5rem+env(safe-area-inset-bottom))] z-50 flex max-h-[min(560px,calc(100dvh-12rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-lift sm:inset-x-auto sm:end-4 sm:w-[380px] lg:end-6 lg:bottom-24"
        >
          <header className="flex items-center gap-2 border-b bg-night px-4 py-3 text-cream">
            <Sparkles className="size-4 text-brand-light" aria-hidden />
            <p className="flex-1 font-semibold">Assistant DEGLA</p>
            <button type="button" onClick={() => setOuvert(false)} aria-label="Fermer" className="rounded-full p-1 hover:bg-cream/10">
              <X className="size-4" aria-hidden />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}>
                <p className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm", m.role === "user" ? "bg-night text-cream" : "bg-sand")}>{m.content}</p>
                {m.donnees?.produits?.map((p) => (
                  <div key={p.produit.id} className="flex w-full items-center gap-2 rounded-xl border p-2">
                    <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                      <ProductIllustration type={p.produit.visuel.type} variete={p.produit.variete} seed={p.produit.slug} />
                    </span>
                    <Link href={`/produit/${p.produit.slug}`} className="min-w-0 flex-1 text-[13px] hover:underline">
                      <span className="block truncate font-semibold">{p.produit.nom}</span>
                      <span className="block text-muted-foreground">
                        {formatPrix(p.produit.typeProduit === "DATTE" ? p.produit.prixParKg : p.produit.prixUnitaire)}
                        {p.produit.typeProduit === "DATTE" ? " /kg" : ""} · {p.vendeur.nomBoutique}
                      </span>
                    </Link>
                    <Button size="sm" variant="brand" onClick={() => ajouter(p)} aria-label={`Ajouter ${p.produit.nom} au panier`}>
                      <Plus aria-hidden /> Ajouter
                    </Button>
                  </div>
                ))}
                {m.donnees?.varietes?.map((v) => (
                  <Link key={v.slug} href={`/variete/${v.slug}`} className="w-full rounded-xl border p-2 text-[13px] hover:bg-muted">
                    <span className="block font-semibold">{v.nom}</span>
                    <span className="block text-muted-foreground">{v.origine}</span>
                    <span className="line-clamp-2 block">{v.description}</span>
                  </Link>
                ))}
                {m.donnees?.suivi?.map((s) => (
                  <div key={s.numero} className="w-full space-y-2 rounded-xl border p-3">
                    <p className="text-[13px] font-semibold">
                      {s.vendeur} · <span className="font-mono">{s.numero}</span>
                    </p>
                    <Timeline etapes={s.etapes} />
                  </div>
                ))}
              </div>
            ))}
            {attente && (
              <p className="inline-flex items-center gap-2 rounded-2xl bg-sand px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Je cherche…
              </p>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => envoyer(s)} className="rounded-full border bg-background px-3 py-1.5 text-[12px] hover:bg-muted">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={fin} />
          </div>

          <form
            className="flex gap-2 border-t p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void envoyer(saisie);
            }}
          >
            <Input value={saisie} onChange={(e) => setSaisie(e.target.value)} placeholder="Posez votre question…" aria-label="Votre question" maxLength={500} />
            <Button type="submit" size="icon" variant="brand" disabled={attente || !saisie.trim()} aria-label="Envoyer">
              <Send aria-hidden />
            </Button>
          </form>
        </section>
      )}
    </>
  );
}
