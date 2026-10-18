import Link from "next/link";
import { FournisseurService } from "@/server/services/FournisseurService";
import { StatutVerification } from "@/domain/enums";

export const metadata = { title: "Administration — Fournisseurs" };

const FILTRES = [
  { value: "", label: "Tous" },
  { value: StatutVerification.EN_ATTENTE, label: "En attente" },
  { value: StatutVerification.VERIFIE, label: "Vérifiés" },
  { value: StatutVerification.REFUSE, label: "Refusés" },
  { value: StatutVerification.SUSPENDU, label: "Suspendus" },
];

const TONES: Record<StatutVerification, string> = {
  [StatutVerification.EN_ATTENTE]: "bg-gold/15 text-gold-dark",
  [StatutVerification.VERIFIE]: "bg-forest/12 text-forest",
  [StatutVerification.REFUSE]: "bg-destructive/12 text-destructive",
  [StatutVerification.SUSPENDU]: "bg-ink/12 text-ink",
};

export default async function AdminFournisseursPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const filtre = Object.values(StatutVerification).includes(statut as StatutVerification)
    ? (statut as StatutVerification)
    : undefined;

  const { fournisseurs, total } = await FournisseurService.lister(filtre, 1, 50);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-medium text-forest">Fournisseurs</h2>
          <span className="text-sm text-muted">{total} résultat(s)</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {FILTRES.map((f) => {
            const actif = (filtre ?? "") === f.value;
            return (
              <Link
                key={f.label}
                href={f.value ? `/admin/fournisseurs?statut=${f.value}` : "/admin/fournisseurs"}
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

        {fournisseurs.length === 0 ? (
          <p className="mt-8 text-sm text-muted">Aucun fournisseur pour ce filtre.</p>
        ) : (
          <ul className="mt-6 divide-y divide-forest/10">
            {fournisseurs.map((f) => (
              <li key={f._id.toString()}>
                <Link
                  href={`/admin/fournisseurs/${f._id.toString()}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors hover:bg-beige/20"
                >
                  <div>
                    <p className="font-medium text-forest">{f.nomBoutique}</p>
                    <p className="text-xs text-muted">
                      {f.type} · {f.region.replace("_", " ")} · {f.slug}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${TONES[f.statutVerification as StatutVerification]}`}
                  >
                    {f.statutVerification.replace("_", " ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
