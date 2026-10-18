import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Flag,
  Settings,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { BoutonDeconnexion } from "@/components/auth/bouton-deconnexion";

const LIENS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/fournisseurs", label: "Fournisseurs", icon: Store },
  { href: "/admin/signalements", label: "Signalements", icon: Flag },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
  { href: "/admin/journal", label: "Journal d'audit", icon: ScrollText },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/compte");

  return (
    <div className="min-h-screen bg-ink text-cream">
      <div className="container-lux pt-28 pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-gold-light">ADMINISTRATION</p>
            <h1 className="flex items-center gap-2 font-serif text-3xl font-semibold text-cream">
              <ShieldCheck className="size-7 text-gold" /> Console DEGLA
            </h1>
          </div>
          <BoutonDeconnexion className="border-cream/30 text-cream hover:bg-cream/10 hover:text-cream" />
        </div>

        <nav className="mb-8 flex flex-wrap gap-2">
          {LIENS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-2 text-sm font-medium text-cream/90 transition-colors hover:border-gold hover:bg-cream/10"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="text-ink">{children}</div>
      </div>
    </div>
  );
}
