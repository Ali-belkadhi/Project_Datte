"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Bell,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  ShoppingBag,
  Store,
  User,
  X,
} from "lucide-react";
import { Role } from "@/domain/enums";
import { FacebookIcon, InstagramIcon } from "@/components/ui/social-icons";
import { Logo } from "./logo";
import { NAV_LINKS } from "@/lib/navigation";
import { useLockBody } from "@/hooks/use-client";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const { menuOpen, setMenuOpen, openCart } = useUIStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  useLockBody(menuOpen);

  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  const role = session?.user?.role;
  const liensCompte = [
    { href: "/compte", label: "Mon compte", Icon: User },
    { href: "/messages", label: "Messagerie", Icon: MessageCircle },
    { href: "/notifications", label: "Notifications", Icon: Bell },
    ...(role === Role.FOURNISSEUR
      ? [{ href: "/fournisseur/tableau-de-bord", label: "Espace fournisseur", Icon: Store }]
      : []),
    ...(role === Role.ADMIN
      ? [{ href: "/admin", label: "Console admin", Icon: LayoutDashboard }]
      : []),
  ];

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div className="fixed inset-0 z-[70] lg:hidden" initial="closed" animate="open" exit="closed">
          <motion.div
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            variants={{ open: { x: 0 }, closed: { x: "-100%" } }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="bg-grain absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-cream p-6 shadow-lux"
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                aria-label="Fermer le menu"
                onClick={() => setMenuOpen(false)}
                className="flex size-10 items-center justify-center rounded-full bg-forest/5 text-forest"
              >
                <X className="size-5" />
              </button>
            </div>

            <motion.ul
              className="mt-12 space-y-1"
              variants={{ open: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } } }}
            >
              {NAV_LINKS.map((link) => (
                <motion.li
                  key={link.href}
                  variants={{ open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: -24 } }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between border-b border-forest/10 py-4 font-serif text-2xl",
                      pathname === link.href ? "text-gold" : "text-forest",
                    )}
                  >
                    {link.label}
                    <ArrowRight className="size-4 opacity-50" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-auto space-y-3">
              {session?.user ? (
                <div className="space-y-1">
                  <p className="px-1 pb-1 text-[0.65rem] uppercase tracking-wider text-muted">
                    {session.user.name ?? "Mon compte"}
                  </p>
                  {liensCompte.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-forest/5"
                    >
                      <Icon className="size-4 text-forest/70" /> {label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      void signOut({ redirectTo: "/" });
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-sm font-medium text-forest transition-colors hover:bg-forest/5"
                  >
                    <LogOut className="size-4 text-forest/70" /> Déconnexion
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/connexion"
                    className="flex h-12 items-center justify-center gap-2 rounded-full border border-forest/20 text-sm font-medium text-forest"
                  >
                    <User className="size-4" /> Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-forest text-sm font-medium text-cream"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={openCart}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-forest/20 text-sm font-medium text-forest"
              >
                <ShoppingBag className="size-4" /> Panier
              </button>

              <div className="flex items-center justify-between pt-3 text-xs text-muted">
                <span>Kébili • Tunisie</span>
                <div className="flex gap-3 text-forest">
                  <InstagramIcon className="size-4" />
                  <FacebookIcon className="size-4" />
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
