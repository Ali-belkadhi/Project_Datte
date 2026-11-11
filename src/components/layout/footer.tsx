import Link from "next/link";
import { Banknote, CreditCard, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PalmPattern } from "@/components/brand/palm-pattern";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { NewsletterForm } from "./newsletter-form";

/** Pied de page : fond night, texte cream, motif de palmes. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night pb-24 text-cream lg:pb-0">
      <PalmPattern className="text-cream" opacity={0.06} />
      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 md:px-6 md:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div className="space-y-5">
            <Logo tone="light" />
            <p className="max-w-sm text-[15px] text-cream/70">
              Les plus belles dattes de Tunisie et leurs douceurs, vendues en direct par les producteurs des oasis.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Les récoltes en avant-première</p>
              <NewsletterForm />
            </div>
            <div className="flex flex-col gap-1.5 text-[13px] text-cream/60">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-3.5" aria-hidden /> Tunis · Tozeur · Kébili · Gabès
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="size-3.5" aria-hidden /> {siteConfig.contact.telephone}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((col) => (
              <div key={col.titre} className="space-y-3">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-light uppercase">{col.titre}</p>
                <ul className="space-y-1">
                  {col.liens.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="inline-flex min-h-9 items-center text-sm text-cream/75 transition-colors hover:text-cream">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-cream/10 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2" aria-label="Moyens de paiement acceptés">
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-cream/15 px-3 text-[13px] font-semibold text-cream/80">
              <CreditCard className="size-4" aria-hidden /> Carte
            </span>
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-cream/15 px-3 text-[13px] font-semibold text-cream/80">
              <Banknote className="size-4" aria-hidden /> Paiement à la livraison
            </span>
          </div>
          <ThemeToggle tone="dark" />
        </div>
        <div className="mt-6 flex flex-col gap-2 text-[12px] text-cream/50 md:flex-row md:justify-between">
          <p>© 2026 DEGLA · Marketplace des dattes tunisiennes. Template de démonstration : aucune donnée réelle.</p>
          <p className="flex gap-4">
            <Link href="/" className="hover:text-cream">Mentions légales</Link>
            <Link href="/" className="hover:text-cream">CGV</Link>
            <Link href="/" className="hover:text-cream">Confidentialité</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
