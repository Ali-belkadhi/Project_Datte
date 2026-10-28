import Link from "next/link";
import { ArrowRight, Box, MessageCircle, Sparkles, Store, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PalmPattern } from "@/components/brand/palm-pattern";
import { ProductIllustration, ProduitVisuel } from "@/components/illustrations/product-illustration";
import { StepIllustration } from "@/components/illustrations/scenes";
import { SectionReveal } from "@/components/shared/section-reveal";
import { LazyProductViewer, LazyScene } from "@/components/three";
import type { Produit } from "@/types/domain";

/** Bandeau de confiance — chiffres FICTIFS (template de démonstration). */
export function TrustBand() {
  // Chiffres fictifs du template : à remplacer par des statistiques réelles.
  const chiffres = [
    { v: "120", l: "vendeurs" },
    { v: "8", l: "variétés" },
    { v: "24 h", l: "pour expédier" },
    { v: "4,8/5", l: "de satisfaction" },
  ];
  return (
    <section aria-label="DEGLA en chiffres" className="border-b bg-card">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 divide-border px-4 md:grid-cols-4 md:divide-x md:px-6">
        {chiffres.map((c) => (
          <li key={c.l} className="flex flex-col items-center gap-0.5 py-6 text-center md:py-8">
            <span className="font-display text-3xl font-semibold text-date md:text-4xl">{c.v}</span>
            <span className="text-[13px] text-muted-foreground">{c.l}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const CATEGORIES = [
  { nom: "Jus", href: "/catalogue?type=DERIVE&q=jus", type: "bouteille", teinte: "jus", etiquette: "Jus" },
  { nom: "Confitures", href: "/catalogue?type=DERIVE&q=confiture", type: "bocal", teinte: "confiture", etiquette: "Confiture" },
  { nom: "Pâtes", href: "/catalogue?type=DERIVE&q=pâte", type: "bocal", teinte: "pate", etiquette: "Ghars" },
  { nom: "Rob", href: "/catalogue?type=DERIVE&q=rob", type: "bouteille", teinte: "rob", etiquette: "Rob" },
  { nom: "Miel de datte", href: "/catalogue?type=DERIVE&q=miel", type: "bocal", teinte: "miel", etiquette: "Miel" },
  { nom: "Café de noyaux", href: "/catalogue?type=DERIVE&q=café", type: "sachet", teinte: "cafe", etiquette: "Café" },
] as const;

/** « Au-delà de la datte » : grille des catégories de dérivés. */
export function DerivedCategories() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
      {CATEGORIES.map((c, i) => (
        <li key={c.nom}>
          <SectionReveal delay={i * 0.04}>
            <Link href={c.href} className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
              <div className="aspect-square bg-sand">
                <ProductIllustration type={c.type} teinte={c.teinte} etiquette={c.etiquette} seed={c.nom} className="transition-transform duration-300 group-hover:scale-105" />
              </div>
              <span className="flex items-center justify-between px-3.5 py-3 text-sm font-semibold">
                {c.nom}
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden />
              </span>
            </Link>
          </SectionReveal>
        </li>
      ))}
    </ul>
  );
}

/** « Voir avant d'acheter » : bloc éditorial + ProductViewer (Medjool en coupelle). */
export function SeeBeforeBuy({ produit }: { produit: Produit | null }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="relative aspect-square overflow-hidden rounded-3xl border bg-sand lg:order-2">
        {produit?.modele3D ? (
          <LazyScene className="absolute inset-0" fallback={<ProduitVisuel produit={produit} />}>
            <LazyProductViewer source={produit.modele3D} label="Medjool Jumbo en coupelle, en 3D interactive" />
          </LazyScene>
        ) : null}
      </div>
      <div className="space-y-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">Voir avant d&apos;acheter</p>
        <h2 className="font-display text-3xl font-semibold text-balance md:text-4xl">Chaque datte, sous tous les angles.</h2>
        <p className="text-[17px] leading-relaxed text-muted-foreground">
          Faites tourner chaque produit en 3D, zoomez sur la peau, comparez les calibres. Nos vendeurs créent leurs modèles dans le Studio 3D, à partir de
          simples photos.
        </p>
        <ul className="space-y-3 text-[15px]">
          {[
            { icon: Box, t: "Vue 3D sur plus de la moitié du catalogue" },
            { icon: ZoomIn, t: "Zoom sur la texture et la brillance de la peau" },
            { icon: Sparkles, t: "Bientôt : voir le produit chez vous en réalité augmentée" },
          ].map((l) => (
            <li key={l.t} className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-accent-foreground">
                <l.icon className="size-[18px]" aria-hidden />
              </span>
              {l.t}
            </li>
          ))}
        </ul>
        {produit && (
          <Button asChild>
            <Link href={`/produit/${produit.slug}`}>Voir la Medjool Jumbo</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

/** « Comment ça marche » : 3 étapes illustrées. */
export function HowItWorks() {
  const etapes = [
    { n: 1 as const, t: "Choisir", d: "Comparez les variétés, les calibres et les vendeurs. Faites tourner les produits en 3D." },
    { n: 2 as const, t: "Commander chez plusieurs vendeurs", d: "Un seul panier, un seul paiement : chaque vendeur prépare et expédie sa partie." },
    { n: 3 as const, t: "Recevoir et noter", d: "Suivez chaque colis, puis partagez votre avis pour guider les prochains gourmands." },
  ];
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {etapes.map((e, i) => (
        <li key={e.n}>
          <SectionReveal delay={i * 0.06} className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-5">
            <div className="h-24 w-32">
              <StepIllustration etape={e.n} />
            </div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">Étape {e.n}</p>
            <h3 className="font-display text-xl font-semibold">{e.t}</h3>
            <p className="text-[15px] text-muted-foreground">{e.d}</p>
          </SectionReveal>
        </li>
      ))}
    </ol>
  );
}

/** Bandeau assistant IA : aperçu d'une conversation. */
export function AssistantBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-hero p-6 text-cream md:p-10">
      <PalmPattern className="text-cream" opacity={0.06} />
      <div className="relative grid items-center gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-cream/10 px-3 text-[12px] font-bold tracking-wide uppercase">
            <Sparkles className="size-3.5 text-brand-light" aria-hidden /> Assistant IA
          </span>
          <h2 className="font-display text-3xl font-semibold text-balance md:text-4xl">Un conseiller qui connaît chaque palmeraie.</h2>
          <p className="text-[17px] text-cream/75">Demandez une variété, un budget, une idée de cadeau ou l&apos;état de votre commande : l&apos;assistant cherche, compare et vous propose.</p>
          <Button asChild variant="brand" size="lg">
            <Link href="/assistant">Essayer l&apos;assistant</Link>
          </Button>
        </div>
        <div className="space-y-3" aria-label="Aperçu d'une conversation">
          <p className="ms-auto w-fit max-w-[85%] rounded-2xl rounded-ee-md bg-cream px-4 py-3 text-[15px] text-night">2 kg de Deglet Nour bio à moins de 30 DT ?</p>
          <div className="max-w-[90%] space-y-2 rounded-2xl rounded-es-md border border-cream/10 bg-cream/10 px-4 py-3 text-[15px]">
            <p>Voici trois Deglet Nour bio de la récolte 2026, toutes sous 30 DT le kilo. La branchée de Palmeraie Ben Amor est la mieux notée.</p>
            <p className="inline-flex items-center gap-1.5 text-[13px] text-brand-light">
              <MessageCircle className="size-3.5" aria-hidden /> 3 produits trouvés · 51,000 DT pour 2 kg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Bandeau vendeur. */
export function SellerBanner() {
  return (
    <div className="flex flex-col items-start gap-5 rounded-3xl border bg-brand-soft p-6 md:flex-row md:items-center md:justify-between md:p-10">
      <div className="flex items-start gap-4">
        <span className="hidden size-14 shrink-0 place-items-center rounded-2xl bg-card text-accent-foreground sm:grid">
          <Store className="size-6" aria-hidden />
        </span>
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl font-semibold text-balance md:text-3xl">Vous produisez des dattes ? Ouvrez votre boutique sur DEGLA.</h2>
          <p className="text-muted-foreground">Inscription gratuite, 3 crédits 3D offerts, paiement sécurisé et versements tous les quinze jours.</p>
        </div>
      </div>
      <Button asChild size="lg" className="shrink-0">
        <Link href="/inscription?role=vendeur">Ouvrir ma boutique</Link>
      </Button>
    </div>
  );
}
