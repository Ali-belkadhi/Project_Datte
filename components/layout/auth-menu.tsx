"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Store,
  User,
} from "lucide-react";
import { Role } from "@/domain/enums";
import { cn } from "@/lib/utils";

/**
 * Zone d'authentification de la barre de navigation.
 * - visiteur : liens « Connexion » / « S'inscrire »
 * - connecté : menu du compte (profil, messagerie, notifications, espaces, déconnexion)
 */
export function AuthMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Chargement de la session : réserve l'espace pour éviter un saut de mise en page.
  if (status === "loading") {
    return <div className="hidden size-10 sm:block" aria-hidden />;
  }

  // ─── Visiteur ───────────────────────────────────────────────────────────────
  if (!session?.user) {
    return (
      <div className="hidden items-center gap-1 sm:flex">
        <Link
          href="/connexion"
          className="rounded-full px-3 py-2 text-[0.82rem] font-medium text-ink/75 transition-colors hover:bg-forest/5 hover:text-forest"
        >
          Connexion
        </Link>
        <Link
          href="/inscription"
          className="rounded-full bg-forest px-4 py-2 text-[0.82rem] font-medium text-cream transition-colors hover:bg-forest/90"
        >
          S&apos;inscrire
        </Link>
      </div>
    );
  }

  // ─── Connecté ───────────────────────────────────────────────────────────────
  const role = session.user.role;
  const liens = [
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
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu du compte"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 items-center gap-1 rounded-full px-2 text-forest transition-colors hover:bg-forest/5",
          open && "bg-forest/5",
        )}
      >
        <User className="size-[1.15rem]" />
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-border bg-cream-50 p-1.5 shadow-card"
          >
            <div className="px-3 pb-2 pt-1.5">
              <p className="truncate text-sm font-medium text-forest">{session.user.name ?? "Mon compte"}</p>
              <p className="truncate text-xs text-muted">{session.user.email}</p>
            </div>
            <div className="my-1 h-px bg-forest/10" />
            {liens.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-beige/50"
              >
                <Icon className="size-4 text-forest/70" />
                {label}
              </Link>
            ))}
            <div className="my-1 h-px bg-forest/10" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut({ redirectTo: "/" });
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-beige/50"
            >
              <LogOut className="size-4 text-forest/70" />
              Déconnexion
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
