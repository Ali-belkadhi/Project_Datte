import { Container, Section } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { SectionReveal } from "@/components/shared/section-reveal";
import { VarietyShowcase } from "@/components/three";
import { VarietyCard } from "@/features/catalogue/varietes";
import { pageMetadata } from "@/lib/seo";
import { listVarietes } from "@/server/modules/catalogue/services/varietes";

export const metadata = pageMetadata("Les variétés", "Deglet Nour, Medjool, Alig, Kenta… les huit variétés de dattes tunisiennes, leurs terroirs et leurs saveurs.");

/** Liste des variétés (module B). */
export default async function VarietesPage() {
  const varietes = await listVarietes();
  return (
    <>
      <Container className="pt-8 md:pt-12">
        <PageHeader
          fil={[{ label: "Accueil", href: "/" }, { label: "Variétés" }]}
          surtitre="Terroirs du Djérid, du Nefzaoua et de Gabès"
          titre="Les variétés"
          description="Chaque variété a sa couleur, sa texture et sa saison. Survolez une datte pour la faire avancer."
        />
      </Container>
      <Section className="pt-8 md:pt-10">
        <VarietyShowcase varietes={varietes} />
      </Section>
      <Section tone="sand" titre="Les huit variétés">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {varietes.map((v, i) => (
            <li key={v.slug}>
              <SectionReveal delay={(i % 4) * 0.05} className="h-full [&>a]:h-full">
                <VarietyCard variete={v} />
              </SectionReveal>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
