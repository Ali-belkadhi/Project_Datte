"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ExternalLink, MoreHorizontal, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { isActive, sellerBottomNav, sellerNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { BottomNav } from "./bottom-nav";
import { Breadcrumbs, type Crumb } from "./page-header";
import { SellerSidebar } from "./seller-sidebar";

const LIBELLES: Record<string, string> = {
  vendeur: "Espace vendeur",
  produits: "Produits",
  nouveau: "Nouveau produit",
  "studio-3d": "Studio 3D",
  credits: "Crédits 3D",
  commandes: "Commandes",
  avis: "Avis",
  versements: "Versements",
  boutique: "Ma boutique",
  messages: "Messages",
  parametres: "Paramètres",
  onboarding: "Ouverture de boutique",
};

function filDepuis(pathname: string): Crumb[] {
  const seg = pathname.split("/").filter(Boolean);
  return seg.map((s, i) => ({
    label: LIBELLES[s] ?? decodeURIComponent(s).toUpperCase(),
    href: i < seg.length - 1 ? "/" + seg.slice(0, i + 1).join("/") : undefined,
  }));
}

type SellerShellProps = {
  children: React.ReactNode;
  credits: number;
  notificationsNonLues: number;
  vendeur: { nom: string; boutique: string; initiales: string; slug: string };
};

/** Shell de la vue vendeur : sidebar repliable (desktop), barre supérieure, bottom nav + « Plus » (mobile). */
export function SellerShell({ children, credits, notificationsNonLues, vendeur }: SellerShellProps) {
  const pathname = usePathname();
  const [replie, setReplie] = useState(false);
  const [plus, setPlus] = useState(false);
  const autres = sellerNav.flatMap((s) => s.items).filter((i) => !sellerBottomNav.some((b) => b.href === i.href));

  return (
    <div className="flex min-h-dvh bg-background">
      <SellerSidebar replie={replie} onToggle={() => setReplie((r) => !r)} credits={credits} vendeur={vendeur} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-xl md:px-6 lg:h-[72px]">
          <div className="lg:hidden">
            <Logo variant="mark" href="/vendeur" />
          </div>
          <Breadcrumbs items={filDepuis(pathname)} className="hidden min-w-0 md:block" />
          <span className="text-sm font-semibold md:hidden">Espace vendeur</span>
          <div className="ms-auto flex items-center gap-1">
            <label className="relative hidden xl:block">
              <span className="sr-only">Rechercher dans l&apos;espace vendeur</span>
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input placeholder="Commande, produit…" className="h-10 w-60 rounded-full border bg-card ps-9 pe-4 text-sm outline-none focus:border-ring" />
            </label>
            <Link href="/vendeur/commandes" className="relative grid size-11 place-items-center rounded-full hover:bg-accent" aria-label={`Notifications, ${notificationsNonLues} non lues`}>
              <Bell className="size-5" />
              {notificationsNonLues > 0 && <span className="absolute end-2.5 top-2.5 size-2.5 rounded-full bg-danger ring-2 ring-background" />}
            </Link>
            <Link
              href={`/boutique/${vendeur.slug}`}
              className="hidden h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold hover:bg-accent sm:inline-flex"
            >
              Voir ma boutique <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          </div>
        </header>
        <main id="contenu" className="flex-1 px-4 pt-6 pb-28 md:px-6 md:pt-8 lg:pb-12">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <BottomNav
        label="Navigation vendeur"
        items={sellerBottomNav}
        extra={
          <Sheet open={plus} onOpenChange={setPlus}>
            <SheetTrigger className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <MoreHorizontal className="size-5" aria-hidden />
              Plus
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <SheetHeader>
                <SheetTitle className="font-display text-xl">Espace vendeur</SheetTitle>
              </SheetHeader>
              <ul className="grid grid-cols-3 gap-2 px-4">
                {autres.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setPlus(false)}
                      className={cn(
                        "flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card text-[12px] font-semibold",
                        isActive(pathname, item) && "border-brand-fill bg-brand-soft text-accent-foreground",
                      )}
                    >
                      <item.icon className="size-5" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between px-4 pt-2">
                <span className="text-sm font-semibold">Thème</span>
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        }
      />
    </div>
  );
}
