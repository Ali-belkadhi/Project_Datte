import Link from "next/link";
import { SignalementService } from "@/server/services/SignalementService";
import { StatutTraitement } from "@/domain/enums";
import { TraitementSignalement } from "@/components/admin/traitement-signalement";

export const metadata = { title: "Administration — Signalements" };

const FILTRES = [
  { value: "", label: "Tous" },
  { value: StatutTraitement.OUVERT, label: "Ouverts" },
  { value: StatutTraitement.TRAITE, label: "Traités" },
  { value: StatutTraitement.REJETE, label: "Rejetés" },
];

const TONES: Record<StatutTraitement, string> = {
  [StatutTraitement.OUVERT]: "bg-gold/15 text-gold-dark",
  [StatutTraitement.TRAITE]: "bg-forest/12 text-forest",
  [StatutTraitement.REJETE]: "bg-ink/12 text-ink",
};

type AuteurVue = { email?: string; nom?: string; prenom?: string };

export default async function AdminSignalementsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const filtre = Object.values(StatutTraitement).includes(statut as StatutTraitement)
    ? (statut as StatutTraitement)
    : undefined;

  const { signalements, total } = await SignalementService.lister({ statut: filtre });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-medium text-forest">Signalements</h2>
          <span className="text-sm text-muted">{total} résultat(s)</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {FILTRES.map((f) => {
            const actif = (filtre ?? "") === f.value;
            return (
              <Link
                key={f.label}
                href={f.value ? `/admin/signalements?statut=${f.value}` : "/admin/signalements"}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  actif
                    ? "border-forest bg-forest text-cream"
                    : "border-forest/20 text-forest hover:bg-forest/5"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {signalements.length === 0 ? (
          <p className="mt-8 text-sm text-muted">Aucun signalement pour ce filtre.</p>
        ) : (
          <ul className="mt-6 divide-y divide-forest/10">
            {signalements.map((s) => {
              const auteur = s.auteurId as unknown as AuteurVue | null;
              return (
                <li key={s._id.toString()} className="flex flex-wrap items-start justify-between gap-4 py-5">
                  <div className="max-w-2xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-forest">
                        {s.cibleType}
                      </span>
                      <span className="text-xs text-muted">cible : {s.cibleId}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${TONES[s.statut as StatutTraitement]}`}
                      >
                        {s.statut}
                      </span>
                    </div>
                    <p className="text-sm text-ink">{s.motif}</p>
                    <p className="text-xs text-muted">
                      Par {auteur?.email ?? "—"} ·{" "}
                      {new Date(s.creeLe).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <TraitementSignalement signalementId={s._id.toString()} statut={s.statut} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
