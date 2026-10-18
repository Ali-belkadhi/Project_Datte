import Link from "next/link";
import {
  Store,
  Clock,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Flag,
  ScrollText,
  Settings,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import { FournisseurService } from "@/server/services/FournisseurService";
import { SignalementService } from "@/server/services/SignalementService";
import { AuditService } from "@/server/services/AuditService";
import { StatutVerification, StatutTraitement } from "@/domain/enums";

export const metadata = { title: "Administration — Tableau de bord" };

type UtilisateurVue = { email?: string; nom?: string; prenom?: string };

export default async function AdminDashboardPage() {
  const [fournisseurs, signalements, journal] = await Promise.all([
    FournisseurService.compterParStatut(),
    SignalementService.compterParStatut(),
    AuditService.getJournal({}, 1, 8),
  ]);

  const cartesFournisseurs = [
    {
      libelle: "En attente",
      valeur: fournisseurs[StatutVerification.EN_ATTENTE],
      icon: Clock,
      filtre: StatutVerification.EN_ATTENTE,
    },
    {
      libelle: "Vérifiés",
      valeur: fournisseurs[StatutVerification.VERIFIE],
      icon: ShieldCheck,
      filtre: StatutVerification.VERIFIE,
    },
    {
      libelle: "Refusés",
      valeur: fournisseurs[StatutVerification.REFUSE],
      icon: ShieldX,
      filtre: StatutVerification.REFUSE,
    },
    {
      libelle: "Suspendus",
      valeur: fournisseurs[StatutVerification.SUSPENDU],
      icon: AlertTriangle,
      filtre: StatutVerification.SUSPENDU,
    },
  ];

  const cartesSignalements = [
    {
      libelle: "Ouverts",
      valeur: signalements[StatutTraitement.OUVERT],
      icon: Flag,
      filtre: StatutTraitement.OUVERT,
    },
    {
      libelle: "Traités",
      valeur: signalements[StatutTraitement.TRAITE],
      icon: CheckCircle2,
      filtre: StatutTraitement.TRAITE,
    },
    {
      libelle: "Rejetés",
      valeur: signalements[StatutTraitement.REJETE],
      icon: XCircle,
      filtre: StatutTraitement.REJETE,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Validation des fournisseurs */}
      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-medium text-forest">
          <Store className="size-5 text-gold" /> Validation des fournisseurs
        </h2>
        <p className="mt-2 text-sm text-muted">
          Suivez et traitez les demandes d&apos;inscription des partenaires.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cartesFournisseurs.map(({ libelle, valeur, icon: Icon, filtre }) => (
            <Link
              key={libelle}
              href={`/admin/fournisseurs?statut=${filtre}`}
              className="rounded-2xl border border-forest/10 bg-cream-50/70 p-5 transition-colors hover:border-gold"
            >
              <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
                <Icon className="size-4 text-gold" /> {libelle}
              </span>
              <p className="mt-2 font-serif text-3xl font-semibold text-forest">{valeur}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Modération des signalements */}
      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-medium text-forest">
          <Flag className="size-5 text-gold" /> Modération des signalements
        </h2>
        <p className="mt-2 text-sm text-muted">
          Contenus signalés par les utilisateurs, à traiter par l&apos;équipe.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {cartesSignalements.map(({ libelle, valeur, icon: Icon, filtre }) => (
            <Link
              key={libelle}
              href={`/admin/signalements?statut=${filtre}`}
              className="rounded-2xl border border-forest/10 bg-cream-50/70 p-5 transition-colors hover:border-gold"
            >
              <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
                <Icon className="size-4 text-gold" /> {libelle}
              </span>
              <p className="mt-2 font-serif text-3xl font-semibold text-forest">{valeur}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Activité récente */}
      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-medium text-forest">
            <Activity className="size-5 text-gold" /> Activité récente
          </h2>
          <Link
            href="/admin/journal"
            className="text-sm font-medium text-forest underline-offset-4 hover:underline"
          >
            Voir tout le journal
          </Link>
        </div>

        {journal.entries.length === 0 ? (
          <p className="mt-6 text-sm text-muted">Aucune activité pour l&apos;instant.</p>
        ) : (
          <ul className="mt-4 divide-y divide-forest/10">
            {journal.entries.map((e) => {
              const utilisateur = e.utilisateurId as unknown as UtilisateurVue | null;
              return (
                <li key={e._id.toString()} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-forest">{e.action}</p>
                    <p className="truncate text-xs text-muted">
                      {e.entite} · {utilisateur?.email ?? "système"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {new Date(e.creeLe).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Accès rapides */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/fournisseurs?statut=EN_ATTENTE"
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream"
        >
          Traiter les demandes en attente
        </Link>
        <Link
          href="/admin/signalements"
          className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-5 py-2.5 text-sm font-medium text-forest hover:bg-forest/5"
        >
          <Flag className="size-4" /> Modération des signalements
        </Link>
        <Link
          href="/admin/journal"
          className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-5 py-2.5 text-sm font-medium text-forest hover:bg-forest/5"
        >
          <ScrollText className="size-4" /> Journal d&apos;audit
        </Link>
        <Link
          href="/admin/parametres"
          className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-5 py-2.5 text-sm font-medium text-forest hover:bg-forest/5"
        >
          <Settings className="size-4" /> Paramètres
        </Link>
      </div>
    </div>
  );
}
