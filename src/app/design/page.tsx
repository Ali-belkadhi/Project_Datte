import Link from "next/link";
import { ArrowLeft, Box, Plus } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Container, Section } from "@/components/layout/section";
import { AiBadge } from "@/components/shared/ai-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PriceTag } from "@/components/shared/price-tag";
import { RatingStars } from "@/components/shared/rating-stars";
import { GridSkeleton } from "@/components/shared/skeletons";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Stepper } from "@/components/shared/stepper";
import { Timeline } from "@/components/shared/timeline";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { EmptyBasket, LostDate, NoMessages, NoOrders, NoResults, VerificationIllustration } from "@/components/illustrations/empty-illustrations";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { VARIETY_ORDER, VARIETY_PRESETS } from "@/components/three/presets";
import { STATUT_SOUS_COMMANDE } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { DatesLineupDemo, InteractiveDemos } from "./design-demos";

export const metadata = pageMetadata("Design system", "Styleguide interne de DEGLA : tokens, typographie, composants, illustrations et 3D.");

const PALETTE = [
  ["ink", "#2B1A12", "bg-foreground", "15,4:1 sur sable"],
  ["night", "#24150F", "bg-night", "fonds hero"],
  ["date", "#5A2E1A", "bg-[#5A2E1A]", "accents"],
  ["amber-500", "#B8701F", "bg-brand-fill", "3,9:1 — pas de petit texte"],
  ["amber-700", "#8A5212", "bg-[#8A5212]", "6,4:1 avec blanc"],
  ["amber-300", "#D9973F", "bg-brand-light", "7,1:1 sur night"],
  ["amber-100", "#F4E6CC", "bg-[#F4E6CC]", "badges"],
  ["sand-50", "#FAF5EC", "bg-[#FAF5EC]", "fond clair"],
  ["sand-100", "#F3EBDD", "bg-[#F3EBDD]", "sections"],
  ["cream", "#F7EEDF", "bg-cream", "texte sur sombre"],
  ["line", "#E7DCCA", "bg-[#E7DCCA]", "bordures"],
  ["muted", "#7A6656", "bg-[#7A6656]", "5:1 sur sable"],
  ["palm", "#2F5D46", "bg-[#2F5D46]", "succès · 7,6:1"],
  ["palm-100", "#DCE9DF", "bg-[#DCE9DF]", "fond succès"],
  ["clay", "#9A3F24", "bg-[#9A3F24]", "erreur · 6,8:1"],
  ["clay-100", "#F4DED5", "bg-[#F4DED5]", "fond erreur"],
] as const;

/** Styleguide interne (page /design). */
export default function DesignPage() {
  return (
    <main id="contenu" className="pb-24">
      <header className="border-b bg-card">
        <Container className="flex h-16 items-center justify-between">
          <Logo suffix={<span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">Design</span>} />
          <Button asChild variant="ghost" size="sm"><Link href="/"><ArrowLeft className="rtl:rotate-180" aria-hidden /> Accueil</Link></Button>
        </Container>
      </header>
      <Section surtitre="Oasis contemporaine" titre="Palette">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {PALETTE.map(([nom, hex, cls, note]) => (
            <li key={nom} className="overflow-hidden rounded-2xl border bg-card">
              <div className={`h-16 ${cls}`} />
              <div className="p-2.5 text-[12px]">
                <p className="font-semibold">{nom}</p>
                <p className="font-mono text-muted-foreground">{hex}</p>
                <p className="text-muted-foreground">{note}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="sand" titre="Typographie">
        <div className="space-y-4">
          <p className="font-display text-5xl leading-[0.95] font-semibold md:text-7xl">Display hero</p>
          <p className="font-display text-3xl font-semibold md:text-4xl">H1 de page — Fraunces</p>
          <p className="font-display text-2xl font-semibold md:text-3xl">H2 de section</p>
          <p className="text-base font-semibold">H3 de carte — Inter</p>
          <p className="max-w-2xl text-[15px] leading-relaxed">Corps : les plus belles dattes de Tunisie, directement des palmeraies de Tozeur, Kébili et Gabès.</p>
          <p className="text-[13px] text-muted-foreground">Petit / méta</p>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">Sur-titre</p>
          <PriceTag prixMillimes={18500} unite="kg" />
          <p className="font-mono text-sm">DGL-2026-000123 — JetBrains Mono</p>
        </div>
      </Section>
      <Section titre="Boutons, champs, badges">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="brand">Brand</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="brand" disabled>Désactivé</Button>
            <Button size="sm"><Plus aria-hidden /> Petit</Button>
            <Button size="lg" variant="brand">Grand</Button>
            <Button size="icon" variant="outline" aria-label="Icône"><Box /></Button>
          </div>
          <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="d-in">Champ</Label><Input id="d-in" placeholder="Deglet Nour" /></div>
            <div className="space-y-1.5"><Label htmlFor="d-err">Champ en erreur</Label><Input id="d-err" aria-invalid defaultValue="12" /><p className="text-[13px] text-danger">Prix minimum : 1,000 DT/kg.</p></div>
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="d-ta">Zone de texte</Label><Textarea id="d-ta" placeholder="Description…" /></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {Object.values(STATUT_SOUS_COMMANDE).map((s) => <StatusBadge key={s.label} status={s} />)}
            <VerifiedBadge />
            <AiBadge />
            <Badge variant="brand">Récolte 2026</Badge>
            <Badge variant="success">Bio</Badge>
            <Badge variant="night"><Box aria-hidden /> Disponible en 3D</Badge>
            <RatingStars note={4.5} nombreAvis={86} />
          </div>
        </div>
      </Section>
      <Section tone="sand" titre="Composants partagés">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Chiffre d'affaires" value="8 241,300 DT" variation={12.4} serie={[3, 4, 3.5, 5, 6, 5.5, 7]} />
            <StatCard label="Commandes" value="162" variation={-3.1} serie={[6, 5, 5.5, 4, 4.5, 4, 3.8]} />
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <Stepper etapes={["Adresse", "Livraison", "Paiement", "Vérification"]} courante={1} />
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <Timeline etapes={[{ cle: "a", libelle: "Payée", etat: "terminee", date: "2026-10-17T10:00:00Z" }, { cle: "b", libelle: "Acceptée", etat: "terminee", date: "2026-10-17T14:00:00Z" }, { cle: "c", libelle: "En préparation", etat: "en-cours" }, { cle: "d", libelle: "Expédiée", etat: "a-venir" }, { cle: "e", libelle: "Livrée", etat: "a-venir" }]} />
          </div>
          <InteractiveDemos />
        </div>
      </Section>
      <Section titre="Illustrations">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {(["vrac", "branchee", "barquette", "boite", "bocal", "bouteille", "sachet"] as const).map((t) => (
            <li key={t} className="overflow-hidden rounded-2xl border bg-sand">
              <ProductIllustration type={t} variete="deglet-nour" teinte={t === "bouteille" ? "rob" : undefined} seed={t} />
              <p className="bg-card p-2 text-center text-[13px] font-semibold">{t}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-6 flex flex-wrap gap-4">
          {VARIETY_ORDER.map((v) => (
            <li key={v} className="flex flex-col items-center gap-1 text-[12px]">
              <VarietyGlyph variete={v} className="size-12" />
              {VARIETY_PRESETS[v].nom}
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="sand" titre="Les 8 dattes en 3D" description="Matériaux physiques procéduraux : peau brillante, rides, translucidité de la Deglet Nour.">
        <DatesLineupDemo />
      </Section>
      <Section titre="États" description="Chargement (squelettes), états vides illustrés, erreur, 404.">
        <div className="space-y-6">
          <GridSkeleton n={4} />
          <div className="grid gap-4 md:grid-cols-3">
            <EmptyState illustration={<EmptyBasket />} titre="Votre panier attend sa première poignée de dattes." />
            <EmptyState illustration={<NoOrders />} titre="Aucune commande" />
            <EmptyState illustration={<NoResults />} titre="Aucun résultat" />
            <EmptyState illustration={<NoMessages />} titre="Aucun message" />
            <EmptyState illustration={<VerificationIllustration />} titre="Dossier en cours d'examen" />
            <EmptyState illustration={<LostDate />} titre="Cette page s'est égarée dans la palmeraie." />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-danger/40 bg-danger-soft p-4 text-danger">
            <Skeleton className="size-10 rounded-full bg-danger/20" />
            <p className="text-sm font-semibold">État d&apos;erreur : « Une erreur inattendue est survenue. » + bouton « Réessayer » (voir error.tsx)</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
