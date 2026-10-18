import Image from "next/image";
import { PageHeader } from "@/components/layout/page-header";
import { IMG } from "@/data/products";
import { PalmIcon } from "@/components/layout/logo";
import { Leaf, Award, HeartHandshake, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Notre Histoire & Terroir de Kébili",
  description: "Découvrez l'histoire de SIWAR, marque tunisienne d'exception valorisant les dattes de Kébili.",
};

export default function AProposPage() {
  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="NOTRE MAISON"
        title="L'Âme de Kébili"
        description="Au cœur du désert tunisien, là où les palmiers séculaires puisent l'eau la plus pure sous le soleil ardent."
        crumbs={[{ label: "À propos" }]}
      />

      <div className="container-lux mt-12 space-y-20">
        {/* Intro section with side image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <PalmIcon className="size-8 text-forest" />
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-forest leading-tight">
              La richesse naturelle du désert
            </h2>
            <p className="text-base text-ink/80 leading-relaxed">
              Fondée à Kébili, berceau séculaire des plus belles palmeraies de Tunisie, la maison <strong>SIWAR</strong> célèbre la générosité du désert. Nous sélectionnons rigoureusement les dattes Deglet Nour à maturité optimale sur l&apos;arbre.
            </p>
            <p className="text-base text-ink/80 leading-relaxed">
              Notre engagement est absolu : préserver la pureté naturelle du fruit sans sucres ajoutés, sans additifs chimiques, et sublimer chaque récolte à travers des recettes gourmandes et saines.
            </p>
          </div>

          <div className="lg:col-span-6 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lux">
            <Image
              src={IMG.heroDesert}
              alt="Palmeraie de Kébili au coucher du soleil"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* 4 Pillars / Values */}
        <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow block">ENGAGEMENTS</span>
            <h3 className="mt-2 font-serif text-3xl font-medium text-forest">
              Nos Valeurs Fondatrices
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-sand/60 text-forest">
                <Leaf className="size-6 text-gold-dark" />
              </div>
              <h4 className="mt-4 font-serif text-lg font-semibold text-forest">100% Naturel</h4>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Aucun conservateur ni sirop de glucose industriel. La nature dans son expression la plus pure.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-sand/60 text-forest">
                <Award className="size-6 text-gold-dark" />
              </div>
              <h4 className="mt-4 font-serif text-lg font-semibold text-forest">Savoir-faire Artisanal</h4>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Dénoyautage méticuleux, garnissage manuel des fruits secs et cuisson douce en petits lots.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-sand/60 text-forest">
                <HeartHandshake className="size-6 text-gold-dark" />
              </div>
              <h4 className="mt-4 font-serif text-lg font-semibold text-forest">Filière Équitable</h4>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Partenariat direct avec les petits producteurs oasiens de Kébili pour une juste rémunération.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-sand/60 text-forest">
                <ShieldCheck className="size-6 text-gold-dark" />
              </div>
              <h4 className="mt-4 font-serif text-lg font-semibold text-forest">Excellence Certifiée</h4>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Normes d&apos;hygiène strictes et traçabilité complète de la palme jusqu&apos;à votre table.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Sections Anchor Targets */}
        <div className="space-y-12 border-t border-forest/10 pt-16 max-w-4xl mx-auto">
          <section id="mentions-legales">
            <h3 className="font-serif text-2xl font-medium text-forest mb-3">Mentions Légales</h3>
            <p className="text-sm text-ink/75 leading-relaxed">
              SIWAR SARL — Société au capital de 50 000 DT. Siège social : Route de Douz, Kébili 4200, Tunisie. Matricule Fiscal : 1234567/A/M/000. Registre de Commerce : B12345672026. Directeur de la publication : Direction SIWAR.
            </p>
          </section>

          <section id="confidentialite">
            <h3 className="font-serif text-2xl font-medium text-forest mb-3">Politique de Confidentialité</h3>
            <p className="text-sm text-ink/75 leading-relaxed">
              Nous respectons scrupuleusement la confidentialité de vos données personnelles. Les données collectées sur notre site servent exclusivement au traitement et à la livraison de vos commandes. Conformément à la loi tunisienne n° 2004-63, vous bénéficiez d&apos;un droit d&apos;accès et de rectification.
            </p>
          </section>

          <section id="cgv">
            <h3 className="font-serif text-2xl font-medium text-forest mb-3">Conditions Générales de Vente (CGV)</h3>
            <p className="text-sm text-ink/75 leading-relaxed">
              Toutes les commandes passées sur la boutique SIWAR sont soumises aux présentes CGV. Les prix sont indiqués en Dinars Tunisiens (DT) toutes taxes comprises. La livraison est assurée sur l&apos;ensemble du territoire tunisien.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
