import Link from "next/link";
import { BadgeCheck, Flag, Scale, Store, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { SalesChart } from "@/features/commandes/vendeur";
import { GOUVERNORAT_LABEL } from "@/lib/constants";
import { formatDateCourte, formatPrix } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { compterLitigesOuverts } from "@/server/modules/commandes/services/litiges";
import { seriePlateforme } from "@/server/modules/commandes/services/ventes";
import { getFileATraiter } from "@/server/modules/comptes/services/admin";
import { listFournisseurs } from "@/server/modules/comptes/services/fournisseurs";

export const metadata = pageMetadata("Administration");

/** Vue d'ensemble admin (module A) : KPIs, file « À traiter », graphique. */
export default async function AdminPage() {
  const [verifies, file, litiges, serie] = await Promise.all([listFournisseurs("VERIFIE"), getFileATraiter(), compterLitigesOuverts(), seriePlateforme()]);
  const ca = serie.reduce((a, p) => a + p.chiffreAffaires, 0);
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Administration" titre="Vue d'ensemble" description="Activité de la plateforme sur les 30 derniers jours." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Vendeurs actifs" value={String(verifies.length)} variation={20} icon={<Store className="size-4" />} />
        <StatCard label="Dossiers en attente" value={String(file.dossiers.length)} icon={<BadgeCheck className="size-4" />} />
        <StatCard label="Litiges ouverts" value={String(litiges)} variation={-33} icon={<Scale className="size-4" />} />
        <StatCard label="Chiffre d'affaires" value={formatPrix(ca)} variation={14.2} serie={serie.map((p) => p.chiffreAffaires)} icon={<Wallet className="size-4" />} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Chiffre d&apos;affaires de la plateforme</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart serie={serie} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>À traiter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {file.dossiers.map((d) => (
              <Link key={d.id} href={d.lien} className="flex items-center gap-3 rounded-xl border p-3 hover:bg-accent/40">
                <BadgeCheck className="size-5 text-accent-foreground" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{d.nom}</span>
                  <span className="block text-[12px] text-muted-foreground">
                    Dossier vendeur · {GOUVERNORAT_LABEL[d.region]} · {formatDateCourte(d.soumisLe)}
                  </span>
                </span>
              </Link>
            ))}
            {file.signalements.map((s) => (
              <Link key={s.id} href="/admin/moderation" className="flex items-center gap-3 rounded-xl border p-3 hover:bg-accent/40">
                <Flag className="size-5 text-danger" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{s.cibleLibelle}</span>
                  <span className="block text-[12px] text-muted-foreground">Signalement · {s.motif}</span>
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
