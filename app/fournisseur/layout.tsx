import Link from "next/link";
import { redirect } from "next/navigation";
import { Store, LayoutDashboard, Settings, MessageSquare, Bell } from "lucide-react";
import { auth } from "@/lib/auth";
import { BoutonDeconnexion } from "@/components/auth/bouton-deconnexion";

const LIENS = [
  { href: "/fournisseur/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/fournisseur/onboarding", label: "Mon dossier", icon: Store },
  { href: "/fournisseur/boutique", label: "Ma boutique", icon: Settings },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export default async function FournisseurLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/fournisseur/tableau-de-bord");
  if (session.user.role !== "FOURNISSEUR") redirect("/compte");

  return (
    <div className="min-h-screen bg-cream pt-28 pb-24">
      <div className="container-lux">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">ESPACE FOURNISSEUR</p>
            <h1 className="font-serif text-3xl font-semibold text-forest">Espace partenaire</h1>
          </div>
          <BoutonDeconnexion className="text-destructive hover:bg-destructive/10" />
        </div>

        <nav className="mb-8 flex flex-wrap gap-2">
          {LIENS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-full border border-forest/15 bg-cream-50/80 px-4 py-2 text-sm font-medium text-forest transition-colors hover:border-gold hover:bg-white"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
