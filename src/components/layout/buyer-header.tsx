"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUser, Heart, LayoutDashboard, Search, Store } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SearchBar } from "@/components/shared/search-bar";
import { LogoutButton } from "@/components/shared/logout-button";
import { buyerMainNav, isActive } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { CartButton } from "./cart-button";
import { SearchCommand, type SearchIndex } from "./search-command";
import { PwaInstallButton } from "./pwa-install-button";

/** Accès à l'espace vendeur / admin : visible à toutes les tailles (libellé court sur mobile). */
const ACCES =
  "ms-1 inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition-colors hover:bg-accent sm:ms-2 xl:px-4";

/** En-tête acheteur : desktop complet, mobile logo + recherche + panier + accès vendeur. */
export function BuyerHeader({ index, role }: { index: SearchIndex; role: string | null }) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const isFournisseur = role === "FOURNISSEUR";
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-6 lg:h-[72px] lg:gap-6">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {buyerMainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors hover:bg-accent",
                isActive(pathname, item) && "bg-accent text-accent-foreground",
              )}
            >
              {item.href === "/assistant" && <item.icon className="size-4 text-brand" aria-hidden />}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ms-auto hidden max-w-md flex-1 md:block lg:ms-0">
          <SearchBar onOpen={() => setOuvert(true)} />
        </div>
        <div className="ms-auto flex items-center gap-0.5 md:ms-0">
          <button type="button" onClick={() => setOuvert(true)} className="grid size-11 place-items-center rounded-full hover:bg-accent md:hidden" aria-label="Rechercher">
            <Search className="size-5" />
          </button>
          <Link href="/compte/favoris" className="hidden size-11 place-items-center rounded-full hover:bg-accent lg:grid" aria-label="Favoris">
            <Heart className="size-5" />
          </Link>
          <Link href="/compte" className="hidden size-11 place-items-center rounded-full hover:bg-accent lg:grid" aria-label="Mon compte">
            <CircleUser className="size-5" />
          </Link>
          <CartButton />
          <PwaInstallButton />
          {role && (
            <LogoutButton
              showLabel={false}
              // sur mobile, la déconnexion reste dans « Compte » : la place va à l'accès vendeur
              className="hidden size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:grid"
            />
          )}
          {isFournisseur ? (
            <Link href="/vendeur" className={ACCES} aria-label="Mon espace vendeur">
              <LayoutDashboard className="size-4 shrink-0" aria-hidden />
              <span className="xl:hidden">Vendeur</span>
              <span className="hidden xl:inline">Mon espace vendeur</span>
            </Link>
          ) : role === "ADMIN" ? (
            <Link href="/admin" className={ACCES} aria-label="Administration">
              <LayoutDashboard className="size-4 shrink-0" aria-hidden />
              <span className="xl:hidden">Admin</span>
              <span className="hidden xl:inline">Administration</span>
            </Link>
          ) : (
            <Link href="/inscription?role=vendeur" className={ACCES} aria-label="Vendre sur DEGLA">
              <Store className="size-4 shrink-0" aria-hidden />
              <span className="xl:hidden">Vendre</span>
              <span className="hidden xl:inline">Vendre sur DEGLA</span>
            </Link>
          )}
        </div>
      </div>
      <SearchCommand index={index} open={ouvert} onOpenChange={setOuvert} />
    </header>
  );
}
