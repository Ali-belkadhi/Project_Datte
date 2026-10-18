"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Logo } from "./logo";
import { NAV_LINKS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useScrolled, useMounted } from "@/hooks/use-client";
import { useCartStore, selectCartCount } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";

const LANGS = [
  { code: "FR", label: "Français", available: true },
  { code: "AR", label: "العربية", available: false },
  { code: "EN", label: "English", available: false },
];

function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        id="lang-selector"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1 rounded-full border border-forest/15 bg-cream-50/70 px-3 text-xs font-semibold text-forest backdrop-blur transition-colors hover:border-gold"
      >
        FR <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-11 w-44 overflow-hidden rounded-2xl border border-border bg-cream-50 p-1.5 shadow-card"
          >
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.code === "FR"}
                  disabled={!l.available}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-beige/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{l.label}</span>
                  {l.code === "FR" ? (
                    <Check className="size-4 text-gold" />
                  ) : (
                    <span className="text-[0.6rem] uppercase tracking-wider text-muted">Bientôt</span>
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrolled(30);
  const mounted = useMounted();
  const count = useCartStore(selectCartCount);
  const { openCart, setSearchOpen, setMenuOpen } = useUIStore();
  const transparent = pathname === "/" && !scrolled;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        transparent
          ? "bg-transparent py-4"
          : "border-b border-forest/5 bg-cream/85 py-2.5 shadow-[0_8px_30px_-18px_rgb(23_35_29/0.35)] backdrop-blur-xl",
      )}
    >
      <nav aria-label="Navigation principale" className="container-lux flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-button"
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 flex size-10 items-center justify-center rounded-full text-forest hover:bg-forest/5 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <Logo />
        </div>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "group relative px-4 py-2 text-[0.82rem] font-medium tracking-wide transition-colors",
                  isActive(link.href) ? "text-forest" : "text-ink/75 hover:text-forest",
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute inset-x-4 -bottom-0.5 h-px origin-left bg-forest transition-transform duration-300",
                    isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-0.5 sm:gap-1.5">
          <button
            id="search-button"
            type="button"
            aria-label="Rechercher"
            onClick={() => setSearchOpen(true)}
            className="flex size-10 items-center justify-center rounded-full text-forest transition-colors hover:bg-forest/5"
          >
            <Search className="size-[1.15rem]" />
          </button>
          <Link
            href="/compte"
            aria-label="Mon compte"
            className="hidden size-10 items-center justify-center rounded-full text-forest transition-colors hover:bg-forest/5 sm:flex"
          >
            <User className="size-[1.15rem]" />
          </Link>
          <button
            id="cart-button"
            type="button"
            aria-label={`Ouvrir le panier (${mounted ? count : 0} articles)`}
            onClick={openCart}
            className="relative flex size-10 items-center justify-center rounded-full text-forest transition-colors hover:bg-forest/5"
          >
            <ShoppingBag className="size-[1.15rem]" />
            <AnimatePresence>
              {mounted && count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute right-0.5 top-0.5 flex size-[1.1rem] items-center justify-center rounded-full bg-forest text-[0.6rem] font-bold text-cream ring-2 ring-cream"
                >
                  {count > 99 ? "99" : count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <div className="ml-1 hidden sm:block">
            <LanguageSelector />
          </div>
        </div>
      </nav>
    </header>
  );
}
