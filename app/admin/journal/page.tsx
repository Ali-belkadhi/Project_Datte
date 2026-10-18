import Link from "next/link";
import { AuditService } from "@/server/services/AuditService";

export const metadata = { title: "Administration — Journal d'audit" };

type UtilisateurVue = { email?: string; nom?: string; prenom?: string };

export default async function AdminJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entite?: string; page?: string }>;
}) {
  const { action, entite, page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const { entries, total, totalPages } = await AuditService.getJournal(
    { action, entite },
    pageNum,
    50
  );

  function construireUrl(nouvellePage: number) {
    const p = new URLSearchParams();
    if (action) p.set("action", action);
    if (entite) p.set("entite", entite);
    if (nouvellePage > 1) p.set("page", String(nouvellePage));
    const qs = p.toString();
    return `/admin/journal${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-medium text-forest">Journal d&apos;audit</h2>
          <span className="text-sm text-muted">{total} entrée(s)</span>
        </div>
        <p className="mt-1 text-sm text-muted">
          Traçabilité des actions d&apos;administration et des usages de l&apos;IA.
        </p>

        {entries.length === 0 ? (
          <p className="mt-8 text-sm text-muted">Aucune entrée pour l&apos;instant.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-forest/15 text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4 font-semibold">Date</th>
                  <th className="py-2 pr-4 font-semibold">Action</th>
                  <th className="py-2 pr-4 font-semibold">Entité</th>
                  <th className="py-2 pr-4 font-semibold">Acteur</th>
                  <th className="py-2 font-semibold">Détails</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const utilisateur = e.utilisateurId as unknown as UtilisateurVue | null;
                  return (
                    <tr key={e._id.toString()} className="border-b border-forest/5 align-top">
                      <td className="whitespace-nowrap py-2.5 pr-4 text-xs text-muted">
                        {new Date(e.creeLe).toLocaleString("fr-FR")}
                      </td>
                      <td className="py-2.5 pr-4 font-medium text-forest">{e.action}</td>
                      <td className="py-2.5 pr-4 text-ink/80">
                        {e.entite}
                        <span className="block text-[0.65rem] text-muted">
                          {e.entiteId.slice(0, 12)}…
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-ink/80">
                        {utilisateur?.email ?? "système"}
                      </td>
                      <td className="max-w-xs py-2.5 text-xs text-muted">
                        {e.details ? JSON.stringify(e.details).slice(0, 120) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {pageNum > 1 && (
              <Link
                href={construireUrl(pageNum - 1)}
                className="rounded-full border border-forest/20 px-4 py-1.5 text-sm text-forest hover:bg-forest/5"
              >
                Précédent
              </Link>
            )}
            <span className="text-sm text-muted">
              Page {pageNum} / {totalPages}
            </span>
            {pageNum < totalPages && (
              <Link
                href={construireUrl(pageNum + 1)}
                className="rounded-full border border-forest/20 px-4 py-1.5 text-sm text-forest hover:bg-forest/5"
              >
                Suivant
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
