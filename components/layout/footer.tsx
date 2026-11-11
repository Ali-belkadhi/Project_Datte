"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Mail, MapPin, Phone } from "lucide-react";
import { Logo, PalmIcon } from "./logo";
import { NAV_LINKS, LEGAL_LINKS } from "@/lib/navigation";
import { categories } from "@/data/products";
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from "@/components/ui/social-icons";

const SOCIALS = [
  { label: "Instagram", Icon: InstagramIcon, href: "#" },
  { label: "Facebook", Icon: FacebookIcon, href: "#" },
  { label: "TikTok", Icon: TiktokIcon, href: "#" },
  { label: "WhatsApp", Icon: WhatsappIcon, href: "#" },
];

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.includes("@")) setDone(true);
      }}
      className="mt-5"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Adresse e-mail
      </label>
      <div className="flex rounded-full border border-cream/15 bg-cream/5 p-1 transition-colors focus-within:border-gold">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          disabled={done}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse e-mail"
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-cream placeholder:text-cream/40 focus:outline-none"
        />
        <button
          id="newsletter-submit"
          type="submit"
          aria-label="S'inscrire à la newsletter"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold text-white transition-colors hover:bg-gold-light"
        >
          {done ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
        </button>
      </div>
      <p className="mt-2 text-xs text-cream/50">
        {done ? "Merci ! Vous recevrez bientôt nos nouveautés." : "Offres exclusives et nouveautés, 2 fois par mois."}
      </p>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-forest text-cream">
      <PalmIcon className="pointer-events-none absolute -right-16 -top-10 size-[26rem] text-cream/[0.03]" />
      <div className="container-lux relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/65">
            SIWAR valorise les trésors des palmeraies de Kébili : des dattes et produits naturels, récoltés et
            préparés avec soin au cœur du désert tunisien.
          </p>
          <ul className="mt-6 flex gap-2">
            {SOCIALS.map(({ label, Icon, href }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full border border-cream/15 text-cream/80 transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Navigation du pied de page" className="lg:col-span-2">
          <h3 className="font-serif text-lg text-gold-light">Navigation</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-gold-light">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/compte" className="transition-colors hover:text-gold-light">
                Mon compte
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Catégories" className="lg:col-span-3">
          <h3 className="font-serif text-lg text-gold-light">Nos produits</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/produits?categorie=${c.slug}`} className="transition-colors hover:text-gold-light">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2 lg:col-span-3">
          <h3 className="font-serif text-lg text-gold-light">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" /> Route de Douz, Kébili 4200, Tunisie
            </li>
            <li className="flex gap-3">
              <Phone className="size-4 shrink-0 text-gold" /> +216 00 000 000
            </li>
            <li className="flex gap-3">
              <Mail className="size-4 shrink-0 text-gold" /> contact@siwar.tn
            </li>
          </ul>
          <h3 className="mt-8 font-serif text-lg text-gold-light">Newsletter</h3>
          <Newsletter />
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-lux flex flex-col items-center justify-between gap-4 py-6 text-xs text-cream/50 md:flex-row">
          <p>© {new Date().getFullYear()} SIWAR — La richesse naturelle du désert. Tous droits réservés.</p>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-gold-light">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
